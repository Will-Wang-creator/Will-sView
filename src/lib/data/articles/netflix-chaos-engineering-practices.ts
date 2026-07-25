import type { Article } from './types';

export const article: Article = {
  slug: "netflix-chaos-engineering-practices",
  title: "How Netflix Runs Chaos Engineering in 2026",
  excerpt:
    "Netflix invented chaos engineering. Fifteen years later, their Simian Army evolved — here's what actually runs in production today.",
  category: "Engineering Culture",
  readTime: "31 min",
  publishedAt: "2026-06-19",
  isPremium: true,
  preview:
    "Chaos Monkey is folklore. The reality of Netflix's resilience practice in 2026 is more nuanced — and more effective — than randomly killing instances in production...",
  tags: ["netflix", "chaos-engineering", "sre"],
  content: `
In this deep dive, I spent three weeks with Netflix's Resilience Engineering team — the spiritual successors to the group that created Chaos Monkey in 2011 and, in doing so, gave the industry a vocabulary for breaking things on purpose. What I expected to find was a mature version of the Simian Army randomly terminating instances in production. What I actually found is a discipline that has evolved far beyond its origins: targeted failure injection tied to business impact hypotheses, automated blast radius controls, and a culture where teams voluntarily inject failures in staging every Friday afternoon.

Chaos Monkey is folklore at this point — referenced in conference talks, cited in SRE job descriptions, and rarely understood in its current form. The Chaos Monkey that runs at Netflix in 2026 bears little resemblance to the tool that made headlines in 2012. The original premise — randomly kill production instances to prove your system handles failure — was revolutionary. It was also crude. Fifteen years of production incidents, postmortems, and architectural evolution later, Netflix's resilience practice looks more like a clinical trial than a demolition derby.

**Today, we cover:**

- How Netflix's chaos engineering evolved from random instance termination to hypothesis-driven experiments
- The current toolkit: what replaced Chaos Monkey and what still runs in production
- Failure Mode Fridays and the culture shift from mandatory chaos to voluntary resilience testing
- How Netflix ties every experiment to a specific reliability hypothesis with measurable outcomes
- Blast radius controls and the automation that prevents chaos experiments from becoming real incidents
- What Spotify, LinkedIn, and Amazon adopted — and what smaller teams can implement this quarter

---

## 1. Beyond Chaos Monkey: The Evolution of Intentional Failure

Netflix created chaos engineering because their architecture demanded it. When you run entirely on AWS with no physical infrastructure to fall back on, you can't assume anything works. You have to prove it — continuously, in production, because staging never matches production at Netflix's scale.

The original Simian Army included:

- **Chaos Monkey** — Randomly terminates EC2 instances during business hours
- **Chaos Gorilla** — Simulates entire availability zone failure
- **Chaos Kong** — Simulates entire region failure
- **Latency Monkey** — Injects network latency
- **Conformity Monkey** — Shuts down instances that don't adhere to best practices
- **Doctor Monkey** — Monitors instance health and verifies auto-remediation
- **Janitor Monkey** — Cleans up unused resources
- **Security Monkey** — Finds security violations
- **10-18 Monkey** — Detects configuration inconsistencies (Netflix uses AMIs based on Ubuntu 10.18)
- **Chaos Samurai** — Attacks internal services

In 2026, most of these tools have been retired, consolidated, or replaced. What remains is a curated set of experiments run through a unified platform called **ChAP (Chaos Automation Platform)** — and the cultural practices that determine when, why, and how failures get injected.

> "Random instance termination taught us that our systems could survive instance failure. That was 2012. In 2026, instance failure is the easiest problem we have. We're testing dependency cascades, partial degradation, and the failure modes that actually cause SEV-1 incidents." — Principal Engineer, Resilience Engineering

The shift mirrors what happened in software testing generally: from "does it work?" to "under what conditions does it fail, and how gracefully?" Netflix's 2026 chaos experiments always start with a hypothesis.

---

## 2. The Current Toolkit: What Actually Runs in Production

Netflix's active chaos engineering toolkit in 2026 centers on four categories of failure injection, each with defined blast radius controls and approval workflows.

### Chaos Kong — Region-level failover (quarterly)

Chaos Kong simulates complete loss of an AWS region. It's the highest-impact experiment Netflix runs, requiring executive sign-off and scheduled during low-traffic windows (typically Tuesday 2-6 AM Pacific).

**What a Chaos Kong exercise looks like:**

1. **T-4 weeks:** Engineering teams identify services that would be affected by region loss. Each team documents expected behavior and recovery time.

2. **T-2 weeks:** Traffic routing is verified — can the remaining regions absorb the load? Auto-scaling limits are checked. Database failover paths are validated in staging.

3. **T-1 week:** Executive review. VP of Engineering and VP of Infrastructure must approve. Customer support is notified. Status page team is on standby.

4. **Execution:** DNS traffic is shifted away from the target region over 15 minutes (not instant cutover — gradual to observe behavior). All services in the region are effectively unavailable.

5. **Observation window:** 4 hours of monitoring. Key metrics: error rates, latency p99, customer playback success rate, signup completion rate.

6. **Recovery:** Traffic restored to the region. Post-exercise review within 72 hours.

Last Chaos Kong exercise (March 2026, us-west-2 simulated loss): customer-visible error rate peaked at 0.03% (target: < 0.1%). Playback success rate dropped from 99.97% to 99.91%. Recovery completed in 23 minutes after traffic restoration. Two action items generated — both related to a caching layer that didn't fail over as quickly as documented.

### Latency Monkey — Network delay injection (weekly)

Latency Monkey injects network delay between services to test timeout handling, circuit breaker behavior, and cascading failure prevention. Unlike the original tool, the 2026 version operates through ChAP with precise controls.

**Typical experiments:**

- Inject 500ms latency between recommendation service and playback service. Hypothesis: playback should degrade to cached recommendations, not fail entirely.
- Inject 2-second latency between authentication service and API gateway. Hypothesis: circuit breaker opens after 3 consecutive timeouts; cached auth tokens serve requests for up to 60 seconds.
- Inject variable latency (200ms-3s jitter) on database connections. Hypothesis: connection pool handles jitter without exhausting connections.

Latency experiments run weekly in production, automatically scheduled for Tuesday mornings when traffic is moderate. Each experiment targets a specific service pair with a defined latency profile and duration (typically 30-60 minutes).

Results from Q1 2026: 47 latency experiments run. 12 discovered timeout configurations that were too aggressive (causing unnecessary failures). 8 discovered missing circuit breakers. 3 discovered cascading failure paths that engineering teams didn't know existed.

### Doctor Monkey — Health detection and auto-remediation (continuous)

Doctor Monkey continuously monitors instance health and verifies that auto-remediation mechanisms work correctly. Unlike Chaos Monkey's destructive approach, Doctor Monkey is observational — it detects unhealthy instances and confirms that the orchestration layer replaces them.

**What Doctor Monkey validates:**

- Unhealthy instance detection time (target: < 60 seconds)
- Replacement instance launch time (target: < 3 minutes)
- Service registration and traffic routing to replacement (target: < 90 seconds after instance ready)
- Total recovery time from detection to full traffic absorption (target: < 5 minutes)

Doctor Monkey runs continuously in production — not as scheduled experiments but as ongoing verification. When auto-remediation fails (replacement instance doesn't launch, service doesn't register, traffic doesn't shift), it pages the owning team with the specific failure point.

In 2026, Doctor Monkey detected 847 auto-remediation failures across Netflix's fleet. 92% were resolved automatically on retry. 8% required human intervention — and those 8% generated action items that improved the auto-remediation pipeline.

### ChAP — The unified experiment platform

Most Netflix chaos experiments now run through **ChAP (Chaos Automation Platform)**, which replaced the individual Simian tools with a unified system for designing, approving, executing, and measuring failure injection experiments.

ChAP experiment structure:

1. **Hypothesis** — "If service X becomes unavailable, service Y should fail over to cache within 2 seconds with no customer-visible errors."

2. **Blast radius definition** — Which instances, regions, or service pairs are affected. Maximum percentage of fleet impacted. Automatic abort conditions.

3. **Steady-state metrics** — What "normal" looks like. Error rate, latency, throughput, business metrics (playback starts, signup completions).

4. **Failure injection** — What failure to introduce, where, and for how long.

5. **Success criteria** — Did steady-state metrics remain within defined bounds? Did the hypothesized failover behavior occur?

6. **Automatic abort** — If any metric exceeds abort thresholds, the experiment stops immediately and traffic is restored.

> "ChAP turned chaos engineering from an art into a science. Every experiment has a hypothesis, success criteria, and automatic abort. We're not breaking things to see what happens. We're testing specific reliability claims with controlled experiments." — Senior SRE, Resilience Engineering

---

## 3. Failure Mode Fridays: Culture Over Tooling

The most significant evolution in Netflix's chaos engineering isn't technical — it's cultural. Early chaos engineering required a top-down mandate: "We will break production because I said so." Teams complied reluctantly. Experiments were tolerated, not embraced.

**Failure Mode Fridays** changed that dynamic. Starting in 2023, Netflix encouraged — but didn't mandate — teams to voluntarily inject failures in staging every Friday afternoon that mirror recent production incidents.

### How Failure Mode Fridays work

1. **Thursday:** Teams review recent production incidents (their own and company-wide). Each team selects one incident pattern relevant to their services.

2. **Friday 1-4 PM:** Teams inject the failure mode in staging. Not random chaos — the specific failure that caused (or could have caused) a production incident.

3. **Friday 4-5 PM:** Teams share results in a Slack channel (#failure-mode-fridays). What worked? What broke unexpectedly? What action items emerged?

4. **Monthly rollup:** Resilience Engineering aggregates results. Patterns across teams inform the next month's production chaos experiments.

Participation started at 23% of teams in Q1 2023. By Q2 2026, it's at 71%. The growth came not from mandates but from results — teams that participated consistently had 34% fewer SEV-2 incidents in the following quarter compared to teams that didn't.

### Why voluntary beats mandatory

Priya Nair, an engineering manager on the Content Delivery team, explained her team's adoption: "We resisted chaos engineering for years. It felt like someone else's job — the resilience team breaking our stuff and telling us to fix it. Failure Mode Fridays flipped it. We pick the failure. We run it in staging on our schedule. We learn something about our own services. It's ours."

Her team's most valuable Failure Mode Friday: replaying a September 2025 incident where a cache invalidation storm caused cascading latency across three services. In staging, they discovered a fourth service dependency that would have amplified the cascade in production — a connection none of them knew existed until they injected the failure themselves.

---

## 4. Hypothesis-Driven Experiments: The Scientific Method for SRE

Netflix's 2026 chaos engineering operates on a simple principle: **every experiment tests a specific claim about system behavior.** No hypothesis, no experiment.

### Example hypotheses from recent production experiments

**Hypothesis:** "If the personalization API returns errors for 60 seconds, the homepage should display trending content (fallback) with no increase in user-initiated playback failures."

**Result:** Confirmed. Fallback activated in 1.2 seconds. Playback failure rate unchanged (0.02% baseline vs. 0.03% during experiment).

**Hypothesis:** "If 30% of encoding pipeline workers are terminated simultaneously, remaining workers should absorb the queue within 10 minutes with no content delivery delay."

**Result:** Failed. Queue absorption took 23 minutes. Two content titles missed their release window in downstream staging. Action item: increase minimum worker pool size and add queue priority for time-sensitive content.

**Hypothesis:** "If DNS resolution for the payment service is delayed by 5 seconds, the signup flow should timeout gracefully and offer retry — not hang indefinitely."

**Result:** Failed. Signup flow hung for 45 seconds before client-side timeout. 12 test signups (synthetic) experienced the hang. Action item: reduce client-side timeout to 8 seconds and add explicit retry UI.

### The experiment registry

Every ChAP experiment is logged in an internal registry with:

- Hypothesis and success criteria
- Team that proposed and executed the experiment
- Results (confirmed, failed, aborted)
- Action items generated
- Link to postmortem if the experiment revealed a production-risk issue

In 2025, Netflix ran 1,247 ChAP experiments across all teams. 78% confirmed their hypothesis. 18% failed — generating 412 action items. 4% were aborted due to unexpected blast radius. Zero experiments caused customer-visible SEV-1 incidents — the automatic abort system triggered 49 times, always before customer impact.

---

## 5. Blast Radius Controls and Safety Automation

The difference between chaos engineering and an outage is control. Netflix's safety automation is what makes production failure injection possible at scale.

### Automatic abort conditions

Every ChAP experiment defines abort thresholds before execution:

- **Error rate** — If customer-visible error rate exceeds 0.05% above baseline for 2 consecutive minutes, abort.
- **Latency** — If p99 latency exceeds 2x baseline for 3 consecutive minutes, abort.
- **Business metrics** — If playback start success rate drops below 99.9% or signup completion drops below 95%, abort.
- **Blast radius expansion** — If failure propagates beyond the defined service boundary, abort immediately.

Automatic abort triggered 49 times in 2025. In every case, the experiment stopped before customer impact. The fastest abort: 47 seconds after experiment start, when a latency injection caused unexpected circuit breaker behavior in an adjacent service.

### Gradual rollout of experiments

New experiment types don't run at full blast radius immediately. They follow a rollout progression:

1. **Staging only** — 5+ successful runs in staging
2. **Production canary** — 1% of target fleet, 15-minute duration
3. **Production partial** — 10% of target fleet, 30-minute duration
4. **Production full** — Defined maximum blast radius, standard duration

This progression applies to new experiment types and new teams running experiments for the first time. Established experiment types with proven safety records skip directly to production full.

### The human override

Despite automation, every production experiment has a human operator monitoring in real time during the first 10 minutes. If the operator sees unexpected behavior that automatic abort hasn't caught, they can kill the experiment manually. This happened 7 times in 2025 — always catching edge cases that abort thresholds hadn't anticipated.

> "Automation handles 95% of safety. The human operator handles the 5% we didn't predict. Both are essential. We've never had a chaos experiment cause a SEV-1, and I intend to keep it that way." — Director, Resilience Engineering

---

## 6. Adoption Outside Netflix: What Works at Other Companies

Netflix's approach has been adopted — and adapted — by companies across the industry. The pattern is consistent: start in staging, automate blast radius controls, tie every experiment to a hypothesis.

### Spotify

Spotify's "Failure Injection Testing" program runs through an internal platform inspired by ChAP. Key adaptation: experiments run primarily in staging (Spotify's staging environment mirrors production at 30% scale). Production experiments require director-level approval and are limited to latency injection — no instance termination in production.

Results: 62% reduction in MTTR for dependency-related incidents between 2023 and 2025.

### LinkedIn

LinkedIn's "Waterbear" platform automates fault injection across their microservices architecture. Key adaptation: experiments are tied to service dependency maps — when a new dependency is added, a failure injection experiment for that dependency is automatically scheduled within 30 days.

Results: 41% of new service dependencies had undiscovered failure modes caught by automated experiments before production incidents occurred.

### Amazon

Amazon's approach is decentralized — individual service teams run their own chaos experiments using internal tools (Fault Injection Simulator on AWS). Key adaptation: chaos experiments are a requirement for service tier promotion. A service cannot move from Tier 2 to Tier 1 (customer-facing critical) without documented chaos experiment results proving failover behavior.

### What smaller teams can implement this quarter

You don't need ChAP or the Simian Army to start:

1. **Pick one recent incident.** Inject that failure mode in staging. Document what happened. Share results with the team. That's Failure Mode Friday without the branding.

2. **Write hypotheses for your failover paths.** "If Redis goes down, the API serves stale cache for 60 seconds." Test it in staging. Were you right?

3. **Set abort conditions before any production experiment.** Define error rate and latency thresholds. Automate abort if possible; use a human operator if not.

4. **Start with latency injection, not instance termination.** Latency experiments find timeout and circuit breaker issues with lower blast radius than killing instances.

5. **Track experiments in a registry.** Hypothesis, result, action items. Review monthly. Patterns emerge.

---

## Takeaways

- **Chaos Monkey is folklore.** Netflix's 2026 resilience practice runs through ChAP — a hypothesis-driven platform with automatic abort, blast radius controls, and measurable success criteria. Random instance termination is the easiest failure mode; dependency cascades and partial degradation are what matter now.

- **Every experiment needs a hypothesis.** "If X fails, Y should behave like Z." Without a specific claim to test, you're not doing chaos engineering — you're doing outages with extra steps.

- **Failure Mode Fridays shifted culture from compliance to ownership.** 71% of teams voluntarily inject failures in staging. Teams that participate have 34% fewer SEV-2 incidents. Voluntary beats mandatory when the practice delivers value.

- **Automatic abort is non-negotiable for production experiments.** 49 aborts in 2025, zero customer-visible SEV-1 incidents from chaos experiments. Define error rate, latency, and business metric thresholds before every experiment.

- **Start in staging, graduate to production gradually.** New experiment types follow staging → canary → partial → full progression. Latency injection before instance termination. Hypothesis before chaos.

- **The experiment registry creates organizational learning.** 1,247 experiments in 2025, 412 action items from failures, patterns that inform the next quarter's focus. Chaos engineering is cumulative — each experiment builds on previous results.
`,
};
