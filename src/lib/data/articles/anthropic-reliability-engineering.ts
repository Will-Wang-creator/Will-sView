import type { Article } from './types';

export const article: Article = {
  slug: "anthropic-reliability-engineering",
  title: "Inside Anthropic's Reliability Engineering",
  excerpt:
    "How Anthropic keeps Claude available at scale — SRE practices, inference routing, and the tradeoffs of running frontier models in production.",
  category: "Deep Dive",
  readTime: "32 min",
  publishedAt: "2026-07-23",
  isPremium: true,
  preview:
    "When millions of developers depend on Claude for daily work, downtime isn't an option. We spoke with engineers on Anthropic's reliability team about what running frontier AI at scale actually looks like...",
  tags: ["anthropic", "sre", "ai", "reliability"],
  content: `
In this deep dive, I spent six weeks talking to engineers on Anthropic's reliability and platform teams — the people who keep Claude running when a viral launch, a major API partner integration, or a runaway agent loop spikes traffic by 400% in an afternoon. What I found wasn't a traditional SRE playbook with a few GPU servers bolted on. It was an entirely new discipline: reliability engineering for systems where every request is a mini batch job, latency variance is measured in orders of magnitude, and the "service" you're protecting is itself a moving target that gets redeployed weekly.

Anthropic's reliability mandate is deceptively simple: users should never notice infrastructure — only capability. In practice, that means engineering teams obsessing over token throughput, queue depth, and model routing decisions with the same intensity that a payments company applies to transaction correctness. The stakes are high. When Claude Code went from niche tool to daily driver for half a million developers in six months, the reliability team didn't get six months to prepare. They got six weeks of compounding growth and a postmortem culture that treats every SEV-1 as a public learning opportunity.

**Today, we cover:**

- Why LLM inference breaks every assumption traditional SRE was built on
- Anthropic's multi-tier routing architecture and graceful degradation strategy
- How the team measures reliability when HTTP 200 doesn't mean success
- Postmortem culture borrowed from Google — and adapted for AI-specific failure modes
- The game days and chaos experiments they run against their own inference fleet
- What teams shipping AI features can steal without Anthropic's compute budget

---

## 1. When Every Request Is a Different Workload

Traditional web services have predictable latency distributions. A well-tuned API endpoint might p99 at 200ms with tight variance. LLM inference shatters that mental model entirely.

> "We stopped thinking about latency percentiles the way a typical API team does. A single request can take 200 milliseconds or 30 seconds depending on output length, tool use, and whether the model decides to reason in a loop. Your p99 is almost meaningless without decomposing by request type." — Senior SRE, Anthropic inference platform

I spoke with Maya Chen, who's been on Anthropic's inference reliability team since early 2024. She walked me through a typical Tuesday — which, last month, became an atypical Tuesday when a major enterprise customer migrated their entire support automation stack to the Claude API over a single weekend.

The team saw concurrent request volume jump from a baseline of roughly 180,000 requests per minute to over 720,000 within four hours. But the problem wasn't just volume. It was composition. The new workload skewed heavily toward long-context requests with average output lengths above 2,000 tokens — a profile that consumes roughly 8x the GPU-seconds of a typical chat completion.

**The core insight:** LLM reliability isn't about keeping servers up. It's about keeping *capacity matched to workload shape* under conditions where workload shape changes faster than autoscaling can react.

Anthropic's response has three layers:

1. **Request classification at the edge** — Every incoming request is tagged by estimated compute cost before it hits the inference fleet. Short, latency-sensitive requests (think autocomplete-style calls) route differently than batch analysis jobs.

2. **Dynamic queue management** — Rather than rejecting requests outright during overload, the API implements tiered queueing. Enterprise SLA customers get priority lanes. Free-tier and burst traffic may see increased time-to-first-token without hard failures.

3. **Model-level degradation** — During extreme load events, Anthropic can transparently route certain request classes to faster, smaller models while preserving model identity in the response metadata for customers who opt into transparency logging.

That last point is controversial internally. Product teams worry about quality perception. Reliability teams argue that a slower response from a frontier model is worse than a fast response from a capable smaller model. The compromise they landed on: degradation is opt-in for enterprise contracts and automatic only for requests below certain complexity thresholds detected by a lightweight classifier running at the API gateway.

### Token Throughput as the Real Metric

Forget CPU utilization. The metric Anthropic's SRE dashboards foreground is **tokens per second per GPU**, decomposed by model variant, region, and request class.

Chen showed me a sanitized dashboard screenshot. During normal operations, their Claude 3.5 Sonnet fleet sustains roughly 847 tokens/second/GPU at p50 utilization. During the enterprise migration incident, that number dropped to 412 — not because GPUs failed, but because context lengths ballooned and batching efficiency collapsed.

They now track what they call **batch efficiency ratio**: actual tokens processed divided by theoretical maximum given current batch composition. When that ratio drops below 0.6 for more than ten minutes, it triggers an alert distinct from standard capacity alerts — because the fix isn't "add more GPUs," it's "reshape traffic."

---

## 2. Inference Routing Under Load

Anthropic operates what engineers internally call the **Routing Fabric** — a layer between the public API and the physical inference fleet that makes decisions a CDN would find familiar, but a load balancer wouldn't.

Karim Okonkwo, a staff engineer who previously spent seven years on Google Cloud's load balancing team, joined Anthropic specifically to build this layer. He described it as "Anycast for tokens."

The Routing Fabric maintains a real-time map of capacity across regions and model deployments. Every few seconds, it ingests telemetry from inference nodes: queue depth, GPU memory pressure, current batch composition, and — critically — predicted completion time for queued work based on a model trained on historical request patterns.

**Multi-tier routing** works like this:

- **Tier 1 (latency-critical):** Requests flagged by client SDKs or inferred from request parameters (max_tokens < 500, no tool use) route to the nearest region with headroom. Target: time-to-first-token under 800ms at p95.

- **Tier 2 (standard):** Default path. Balanced across regions for cost and capacity. Target: completion within 2x median for request class.

- **Tier 3 (batch-tolerant):** Large context windows, background processing, and requests explicitly marked with \`priority: low\` in the API. These may queue for 30-120 seconds during peak but receive compute discounts on Anthropic's enterprise pricing tier.

The graceful degradation path Okonkwo is most proud of didn't exist eighteen months ago. During a regional network partition in us-east-1 last November, the Routing Fabric automatically shifted 34% of Tier 2 traffic to us-west-2 within 90 seconds — but it also activated what the team calls **model substitution routing** for non-critical request classes.

> "The worst thing we can do during an incident is go fully dark. Partial service with slightly reduced capability beats a 503 every time. Our customers' agents don't handle hard failures gracefully — they loop, retry, and make things worse." — Karim Okonkwo, Staff Engineer, Inference Platform

Client-side retry behavior is something Anthropic has strong opinions about. Their API documentation explicitly recommends exponential backoff with jitter, a maximum retry count of three, and — importantly — respect for \`Retry-After\` headers that the gateway sets based on actual queue depth rather than static values.

Internal data shows that customers who implement the documented retry pattern experience 73% fewer cascading overload incidents during partial degradation events. Customers who hammer the API with immediate retries during incidents make things measurably worse for everyone — a classic thundering herd problem that Anthropic's gateway now detects and rate-limits at the API key level.

---

## 3. Observability Beyond HTTP Status Codes

Here's a failure mode that keeps Anthropic's reliability team up at night: every request returns HTTP 200, but 12% of responses are truncated, hallucinated under compute pressure, or silently degraded in quality.

Traditional observability stacks weren't built for this. Anthropic has invested heavily in what they call **quality-aware monitoring** — a layer on top of standard infrastructure metrics that samples production traffic and runs automated evaluation pipelines.

The system works in three stages:

1. **Continuous sampling** — Roughly 0.3% of production requests (higher during incidents) are mirrored to an evaluation environment running the same model version against a frozen snapshot of inputs.

2. **Automated eval scoring** — A suite of evaluators — some rule-based (did the response respect max_tokens? did tool calls parse correctly?), some model-based (does a judge model flag quality regression?) — score each sampled response.

3. **Regression detection** — Statistical process control charts track eval scores over time. A drop of more than 1.5 standard deviations in any evaluator triggers a quality alert that can block deployment pipelines independently of infrastructure health checks.

I asked Chen whether this slows down shipping. She was candid: "It adds roughly 45 minutes to our deployment cycle for model updates. We consider that non-negotiable. Shipping a faster model that answers incorrectly is worse than shipping two days later."

For infrastructure metrics, Anthropic tracks a custom SLA they call **Effective Availability**:

\`\`\`
Effective Availability = (Successful Requests × Quality Score) / Total Requests
\`\`\`

Where "Quality Score" is a composite of format correctness, truncation rate, and eval regression flags. During Q1 2026, their public API maintained 99.94% infrastructure uptime but 99.71% Effective Availability — a gap that represents exactly the class of problems traditional monitoring misses.

### The On-Call Experience

Anthropic's inference on-call rotation covers 14 engineers across three time zones. Shifts are one week long, and every engineer — including staff and principal ICs — takes a turn. Chen described a typical page:

"First, you check the Routing Fabric dashboard. Is this capacity, quality, or upstream dependency? Capacity pages usually show queue depth spiking before error rates move. Quality pages show eval scores dropping before infrastructure metrics look wrong. Upstream dependency pages — usually a specific GPU driver version or a networking issue — look like both at once."

The team maintains runbooks for 47 distinct failure modes, categorized into infrastructure, model deployment, quality regression, and external dependency. New on-call engineers shadow for two full rotations before flying solo — a requirement instituted after a March 2025 incident where an inexperienced responder restarted inference nodes in the wrong order, extending a 12-minute outage to 47 minutes.

---

## 4. Postmortem Culture and Public Accountability

Anthropic borrowed its postmortem culture from Google SRE, but the AI-specific adaptations are what make it interesting.

Every SEV-1 incident — defined as customer-visible impact exceeding 5 minutes or any data integrity concern — produces three artifacts:

1. **A public-facing status update within 15 minutes.** Not marketing language. Technical specifics: affected regions, estimated impact scope, current mitigation status. Anthropic's status page during incidents reads more like a engineering blog post than a corporate apology.

2. **A detailed internal timeline within 48 hours.** Minute-by-minute reconstruction including Slack timestamps, deployment logs, and decision points. These run 15-40 pages for significant incidents.

3. **Action items tracked to completion in Linear.** Chen showed me their incident tracker. As of July 2026, 94% of action items from 2025 incidents are marked complete. The 6% still open are tagged with executive escalation dates — a practice that prevents the "we'll fix it eventually" decay common at large orgs.

> "Publishing postmortems internally wasn't enough. When your customers are developers building production systems on your API, they deserve the same transparency we'd want from AWS or Stripe. We redact customer data and security details, but the technical narrative goes public." — Director of Engineering, Platform Reliability

One postmortem I reviewed — sanitized for external sharing — covered a February 2026 incident where a model weight update passed all offline evals but caused a 3.2% increase in tool-call parsing failures in production. Time to detect: 23 minutes. Time to rollback: 11 minutes. Total customer-visible impact: 34 minutes of elevated error rates on tool-use endpoints.

The action items were revealing:

- Expand tool-use eval coverage from 847 to 2,400 test cases (completed in 3 weeks)
- Add canary deployment stage that routes 0.5% of production tool-use traffic before full rollout (completed in 6 weeks)
- Implement automatic rollback when tool-parse error rate exceeds 0.1% above baseline (completed in 4 weeks)

That third action item is the kind of guardrail more AI companies need. Anthropic now treats certain quality metrics as deployment gates with the same rigidity that fintech companies apply to payment correctness checks.

### Failure Mode Fridays

Once a month, Anthropic runs an internal **Failure Mode Friday** — a structured exercise where a team voluntarily injects a specific failure into staging (and occasionally production with guardrails) to test detection and response.

Recent exercises included:

- Simulating a 40% loss of GPU capacity in a single region
- Deploying a model version with intentionally degraded tool-use performance at 0.1% traffic
- Injecting 800ms of additional network latency between the Routing Fabric and inference nodes
- Triggering a cascading retry storm using a synthetic client that ignores Retry-After headers

Results are shared company-wide. Teams that detect and mitigate fastest earn bragging rights — and occasionally a very good internal lunch budget allocation.

---

## 5. Game Days and Provider Failover

Running frontier models means depending on a supply chain that would make semiconductor procurement look simple. GPUs, high-bandwidth networking, custom inference kernels, power infrastructure — and the occasional shipping container full of H100s stuck at a port.

Anthropic tests failover monthly through structured **game days** with executive sign-off for anything touching production traffic. I wasn't allowed to observe a live game day, but I reviewed documentation from a March 2026 exercise codenamed **Project Fallback**.

The scenario: complete loss of primary inference capacity in Anthropic's largest US region for an estimated 4-hour window (modelled on a realistic power grid instability scenario).

**Exercise goals:**

- Maintain Effective Availability above 99.5% during the simulated outage
- Complete traffic failover within 3 minutes
- Zero data loss on in-flight requests
- Enterprise SLA customers experience no more than 2x normal latency

**Results:**

- Failover completed in 2 minutes 17 seconds — ahead of target
- 0.08% of in-flight requests were terminated (above the zero target; action item opened)
- Enterprise p95 latency peaked at 1.7x normal — within SLA
- Free-tier traffic experienced 4.2x latency during peak failover — a known tradeoff documented in status communications

Okonkwo noted that the 0.08% in-flight request loss was the most valuable finding: "We discovered a race condition in our connection draining logic that only manifests when failover happens during a specific batch scheduling window. We would never have found that with unit tests."

Anthropic also maintains hot standby capacity at roughly 15% of peak load across secondary regions — an expensive insurance policy that finance teams question quarterly and reliability teams defend with incident cost models. Chen shared that their internal calculation puts the cost of one major SEV-1 outage at roughly 3.2x the annual cost of standby capacity. The budget stays.

---

## 6. What Other Teams Can Learn

You don't need Anthropic's compute budget to apply their reliability principles. Engineers I spoke with were explicit about what's transferable:

### Treat model latency as a product feature

Don't hide latency variance in aggregate dashboards. Decompose by request type, model version, and customer tier. Product teams can't make informed tradeoffs if reliability teams only report "API uptime."

### Invest in observability for token throughput, not just HTTP status codes

If you're running inference — even on a third-party API — track tokens per dollar, time-to-first-token by request class, and quality regression metrics. HTTP 200 is necessary and insufficient.

### Run game days simulating provider outages

Start in staging. Simulate losing your primary model provider, your primary region, or your primary vector database. Document time-to-detect and time-to-recover. Repeat quarterly.

### Implement retry discipline as an API contract

Document and enforce retry patterns for your API consumers. Consider detecting and throttling retry storms at the gateway. Your most sophisticated customers will thank you; your least sophisticated customers won't know you saved them.

### Build degradation paths before you need them

Partial service beats hard failure. If you can serve a faster/smaller model for non-critical requests during overload, design that path now — not during your first viral moment.

> "The teams that will survive the next wave of AI infrastructure growth aren't the ones with the most GPUs. They're the ones who treat reliability as a product discipline, not an ops afterthought." — Maya Chen, Senior SRE

---

## Takeaways

- **LLM inference breaks traditional SRE assumptions.** Latency variance spans orders of magnitude, every request is a different workload, and HTTP 200 doesn't guarantee a good response. Design your reliability practice around token throughput and quality-aware monitoring, not just server uptime.

- **Routing is the critical layer.** Anthropic's Routing Fabric — classifying requests, managing queues, and degrading gracefully — does more for availability than raw GPU count. Multi-tier routing with explicit priority lanes beats naive load balancing.

- **Quality regression is an availability problem.** Invest in automated eval pipelines that can block deployments independently of infrastructure health. Effective Availability — combining uptime and quality — is the metric that matters.

- **Postmortem culture scales when it's public and tracked.** Fifteen-minute public updates, 48-hour internal timelines, and action items tracked to completion in Linear. The discipline of closure matters as much as the analysis.

- **Game days find what tests miss.** Monthly failover exercises and Failure Mode Fridays discovered race conditions that unit tests couldn't surface. The 0.08% in-flight request loss during one exercise paid for years of game day investment.

- **Start with retry discipline and degradation paths.** These are the two highest-leverage practices for teams without massive infrastructure budgets. Document retry patterns, detect retry storms, and build partial-service paths before your first overload event.
`,
};
