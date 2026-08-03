import type { Article } from "./types";

export const article: Article = {
  slug: "inside-meta-engineering-culture",
  title: "Inside Meta's Engineering Culture in 2026",
  excerpt:
    "Meta's engineering culture evolved post-layoffs and post-metaverse pivot. Current engineers describe what's changed — and what stubbornly stayed the same.",
  category: "Engineering Culture",
  readTime: "18 min",
  publishedAt: "2026-04-10",
  isPremium: true,
  preview:
    "Meta cut 21,000 jobs between 2022 and 2024, pivoted from metaverse-first to AI-first, and lost senior talent to startups. Inside the company, engineering culture is being rebuilt around a smaller, flatter organization...",
  content: `
Between November 2022 and October 2024, Meta eliminated approximately 21,000 positions — roughly 25% of its workforce. The company that had spent a decade growing aggressively, acquiring competitors, and declaring "move fast and break things" as its operating philosophy was suddenly shrinking. Engineers who survived the layoffs describe the experience as a cultural earthquake — one whose aftershocks are still reshaping how Meta builds software in 2026.

At the same time, Meta executed the most dramatic strategic pivot in its history. The metaverse — which consumed $46 billion in Reality Labs investment and dominated company messaging from 2021 to 2023 — was deprioritized. AI, specifically generative AI integrated across Facebook, Instagram, WhatsApp, and a standalone Meta AI assistant, became the company's declared future.

We spoke with 16 current and recently departed Meta engineers across levels from E4 to E7, spanning infrastructure, AI/ML, product engineering, and Reality Labs. What emerges is a picture of a company in transition — smaller, more focused, and more hierarchical in some ways while flatter in others. The Meta of 2026 is not the Meta of 2019, but it is also not the company that outsiders assume it has become.

**Today, we cover:**

- What the layoffs actually changed about how Meta engineers work
- The metaverse-to-AI pivot and its impact on engineering allocation
- What's changed in Meta's engineering culture — and what stubbornly hasn't
- How compensation, career growth, and performance culture evolved
- The Reality Labs question: what's left of the metaverse bet
- What Meta's transformation means for engineers considering the company

---

## 1. The Layoffs and What They Left Behind

Meta's layoffs were not a single event. They came in waves — November 2022 (11,000), March 2023 (10,000), and smaller targeted cuts through 2024. Each wave had different selection criteria, and the cumulative effect was deeper than any single round suggested.

### How Teams Shrunk

Before the layoffs, a typical Meta product engineering team might have 8–12 engineers, a PM, a designer, and a data scientist. Post-layoffs, the same team's scope often remained — but with 5–7 engineers.

Engineers describe the immediate aftermath:

- **Meeting load increased.** With fewer people, each engineer attended more meetings, owned more services, and context-switched more frequently.
- **On-call burden grew.** Fewer engineers per rotation meant more frequent on-call shifts and longer incident response when the on-call engineer was unavailable.
- **Technical debt accumulated.** Features that would have been built in parallel were sequenced. Refactoring and cleanup deprioritized in favor of maintaining existing functionality.
- **Institutional knowledge walked out the door.** Layoffs were not perfectly targeted. Teams lost senior engineers who held critical system knowledge alongside engineers whose roles were genuinely redundant.

> "We went from 10 engineers to 6, but our OKRs didn't change. Same number of goals, fewer people. Something had to give — and what gave was everything that wasn't on this quarter's roadmap. Refactoring, documentation, mentoring, all of it." — E5 engineer, Meta product team

### The Hierarchy Flattening (Sort Of)

Meta eliminated many Director and VP-level positions during the layoffs — part of Mark Zuckerberg's declared "year of efficiency." The result was a flatter organization on paper:

- **Fewer management layers** between IC engineers and VP-level leadership
- **Wider spans of control** for remaining managers (8–12 direct reports, up from 5–7)
- **More autonomy for senior ICs** — Staff and Principal engineers took on responsibilities previously handled by eliminated management roles

But engineers describe a more nuanced reality. Flattening removed managers who provided air cover, career coaching, and cross-team coordination. The remaining managers are stretched thin, and senior ICs fill gaps without the organizational authority or compensation that managers receive.

> "They eliminated my director and told me, a Staff engineer, to 'provide technical leadership for the org.' That's manager work without manager title or manager pay. I'm doing it because I care about the team, but it's not sustainable." — Staff engineer, Meta infrastructure

---

## 2. The AI Pivot: Where the Engineers Went

Meta's pivot from metaverse-first to AI-first was not just a messaging change — it was a massive reallocation of engineering talent. Understanding the numbers helps frame everything else about Meta's current culture.

### Engineering Allocation in 2026

Based on our interviews and public reporting, Meta's engineering allocation roughly breaks down as:

- **AI/ML (including Llama, Meta AI assistant, ranking, recommendations): ~45%** of engineering headcount
- **Core product (Facebook, Instagram, WhatsApp engineering): ~30%**
- **Infrastructure and platform: ~15%**
- **Reality Labs (metaverse/VR/AR): ~10%**

Compare this to 2022, when Reality Labs alone was targeting 20%+ of engineering investment and AI/ML was perhaps 25%. The shift is dramatic — and it created winners and losers inside the company.

### The Llama Bet

Meta's open-source AI strategy — releasing Llama models freely to researchers and developers — is the company's most significant engineering bet of the post-layoff era. Engineers on the Llama team describe the work as the most energizing at the company:

- **Llama 3 and beyond** compete with GPT-4 and Claude on benchmarks while being freely available
- **The team is growing** — one of the few areas with active hiring
- **Open-source releases create external credibility** that Meta's internal AI work never had
- **Engineers publish papers, speak at conferences, and build public reputations** — rare at a company that historically kept research internal

> "I've been at Meta for eight years. The Llama team is the most excited I've seen engineers since the early Instagram integration. People are doing their best work because the output is public and the impact is visible." — E6 engineer, Meta AI

### What Happened to Reality Labs

Reality Labs is not dead — but it is diminished. The $46 billion investment did not disappear, and Quest headsets continue to ship. But the ambitious timeline for metaverse platform dominance has been replaced by a slower, hardware-focused strategy:

- **Headcount reduced by ~50%** from peak metaverse investment
- **Horizon Worlds** (Meta's social VR platform) deprioritized after failing to gain traction
- **Engineering focus shifted to hardware** — Quest headsets, smart glasses (Ray-Ban Meta), and AR research
- **Remaining engineers describe lower morale** and uncertainty about long-term commitment

Engineers who stayed in Reality Labs fall into two camps: those who believe AR glasses will be Meta's next platform (and are willing to wait), and those who are actively interviewing elsewhere.

---

## 3. What's Changed in Engineering Culture

Meta's engineering culture in 2026 reflects the layoffs, the pivot, and the broader industry shift toward AI. Several changes are structural; others are atmospheric.

### "Move Fast" With Guardrails

The old Meta mantra — "move fast and break things" — is officially retired. The new operating principle, described by multiple engineers, is closer to "move fast with guardrails." What this means in practice:

- **Mandatory pre-launch review for AI features** — any product change involving AI models, ranking changes, or generative features requires review by a centralized AI safety team before shipping
- **Experimentation still drives decisions** — A/B testing remains the core product development methodology, but experiments involving AI have longer review cycles
- **Rollback triggers are automated** — AI features that degrade key metrics (engagement, safety, user reports) auto-rollback without waiting for human intervention
- **Code review requirements tightened** — teams report stricter review standards post-layoffs, partly because fewer engineers means each change has higher blast radius

> "Move fast is still the culture, but 'break things' has been replaced by 'with guardrails.' The guardrails are real — I've had launches delayed two weeks for AI safety review. That would never have happened in 2019." — E5 engineer, Instagram

### Bootcamp Persists

One cultural constant: Meta Bootcamp. Every new engineer still rotates through three teams over 6–8 weeks before choosing their permanent team. Engineers consistently cite Bootcamp as one of Meta's best cultural institutions:

- **Cross-team exposure** prevents siloed thinking
- **Network building** — Bootcamp cohorts create social connections that persist for years
- **Informed team selection** — engineers choose teams based on experience, not interview impressions
- **Cultural onboarding** — Bootcamp teaches Meta's tools, processes, and unwritten norms

Post-layoffs, Bootcamp also serves a retention function. New engineers who build relationships across teams are less likely to leave — they have connections beyond their immediate group.

### Internal Tools Evolution

Meta's internal developer tools — historically built around Mercurial, Phabricator (Phab), and custom CI — underwent significant change:

- **GitHub adoption** — Meta migrated from Mercurial to Git and from Phabricator to an internal GitHub Enterprise deployment. The migration took 2+ years and was largely complete by 2025.
- **Diff review culture persists** — even on GitHub, Meta engineers maintain Phabricator-era review standards: detailed diffs, test plans, rollback plans, and explicit reviewer approval before merge.
- **AI-assisted development tools** — Meta built internal AI coding assistants (powered by Llama) before commercial tools like Copilot were approved. Engineers report mixed adoption — powerful for boilerplate, less trusted for complex changes.

### The Open Source Reversal

Historically, Meta open-sourced tools reactively — when internal tools were no longer competitive advantages (React, PyTorch, Cassandra). The Llama strategy represents something different: open-sourcing proactively as a competitive strategy.

This shift affects engineering culture:

- **External reputation matters** — engineers on open-source projects build public profiles that help with retention and recruiting
- **Code quality standards increase** — open-source releases require documentation, testing, and API stability that internal-only code skips
- **Community interaction** — Meta engineers engage with external developers on GitHub, forums, and conferences in ways that were rare pre-Llama

---

## 4. What Hasn't Changed

For all the transformation, several aspects of Meta's engineering culture remain recognizably the same — for better and worse.

### Performance Culture

Meta's up-or-out performance culture survived the layoffs intact. Engineers are rated on a curve, and consistently low ratings lead to performance improvement plans and eventual departure.

What changed: calibration happens less frequently (once per year instead of twice), and the bottom percentile threshold was reportedly lowered from ~5% to ~3%. But the fundamental system — forced ranking, visible performance scores, and manager pressure to differentiate — persists.

> "People thought the layoffs would kill the performance culture. They didn't. If anything, surviving the layoffs made everyone more anxious about their rating. The implicit message was: we cut 25% and we can cut again." — E5 engineer, Facebook core

Engineers outside AI/ML report that career growth is harder in the current environment. With 70% of new hires going to AI teams, non-AI teams receive fewer headcount allocations for promotions. An E5 engineer on a core product team competes for promotion against a shrinking pool of available slots.

### Data-Driven Decision Making

Meta's obsession with data — every product decision backed by experiment results, every metric tracked in dashboards, every launch evaluated by statistical significance — has not changed. If anything, AI integration made it more intense:

- **Model performance metrics** join product metrics in launch criteria
- **AI-specific dashboards** track model latency, inference cost, safety violation rates, and user feedback on AI-generated content
- **Experimentation platforms** were extended to support AI model A/B testing — comparing not just UI changes but model versions

### The Monorepo

Meta's enormous monorepo — one of the largest in the industry, containing the vast majority of Meta's code — persists. Engineers have strong opinions about it:

- **Advantages:** atomic changes across services, shared libraries, consistent tooling, single CI pipeline
- **Disadvantages:** slow CI for large changes, complex merge conflicts, difficulty for new engineers to navigate, tooling optimized for Meta's scale that doesn't translate elsewhere

Post-layoffs, monorepo maintenance became harder with fewer infrastructure engineers. CI times reportedly increased 15–20% as the engineer-to-codebase ratio worsened.

---

## 5. Compensation, Growth, and the Talent Equation

Meta's compensation remains among the highest in the industry — but the structure and accessibility changed post-layoffs.

### Top-of-Market for AI, Less So Elsewhere

Meta's compensation strategy in 2026 is targeted:

- **AI/ML roles:** total compensation at or above Google DeepMind, OpenAI, and Anthropic — typically $400K–$700K+ for E5/E6 levels in the Bay Area
- **Core product engineering:** competitive but not leading — $300K–$500K for equivalent levels
- **Reality Labs:** compensation maintained at pre-layoff levels to prevent further attrition, but signing bonuses and refresh grants reduced

This tiered approach creates internal tension. Engineers on core product teams doing equally complex work see AI colleagues compensated 20–40% higher.

### The Startup Drain

Meta lost significant senior talent to AI startups between 2023 and 2026. Engineers who left cite:

- **Equity upside** — early-stage AI startup equity with potential 10–50x returns
- **Impact visibility** — building foundational AI vs. optimizing ad ranking
- **Cultural energy** — smaller teams, faster shipping, less bureaucracy
- **Mission alignment** — building AI vs. building ad products

Meta's response: aggressive counter-offers for AI talent (reportedly $1M+ packages for senior researchers), faster promotion cycles for AI teams, and the Llama open-source strategy as a retention tool.

> "Three people on my team left for OpenAI in six months. Meta matched two of them financially. One stayed because of the match. The other two left anyway — they wanted to be at a company where AI is the product, not a feature." — E6 engineering manager, Meta AI

### Hiring: Selective and AI-Focused

Meta's hiring in 2025–2026 is selective and concentrated:

- **~70% of new engineering hires** go to AI/ML teams
- **Overall hiring volume** is 40–50% below 2021–2022 peak
- **Bar remains high** — Bootcamp acceptance rate reportedly below 5%
- **Non-AI hiring** is mostly backfill, not team growth

For engineers considering Meta, the implication is clear: AI/ML roles offer the best compensation, growth trajectory, and job security. Other roles exist but carry more uncertainty.

---

## 6. The Reality for Engineers in 2026

Synthesizing our interviews, the experience of being a Meta engineer in 2026 depends heavily on which part of the company you're in.

### If You're on an AI Team

- **High energy, high resources, high visibility.** Llama releases, Meta AI product launches, and ranking improvements are the company's priorities.
- **Career growth is accessible.** Promotions, scope expansion, and public recognition are available.
- **Compensation is top-of-market.** Counter-offers for departures are aggressive.
- **Workload is intense.** AI teams operate at startup pace within a big-company structure. Expect 50–55 hour weeks during launch crunches.

### If You're on a Core Product Team

- **Stable but stagnant.** Facebook, Instagram, and WhatsApp generate the revenue that funds everything else. Your work matters economically but lacks the excitement of AI.
- **Career growth is slower.** Fewer promotion slots, less headcount for team growth, harder to get visibility with leadership.
- **Compensation is good but not exceptional.** You'll earn well above market, but AI peers earn more.
- **Workload increased post-layoffs.** Fewer people, same scope, more on-call, less mentoring.

### If You're in Reality Labs

- **Uncertain future.** Smart glasses show promise; VR platform ambitions have contracted. Long-term commitment from leadership is unclear.
- **Talented colleagues, diminishing resources.** The team that remains is strong, but budget and headcount continue to shrink.
- **Compensation maintained but trajectory unclear.** Good pay today, but resume value depends on whether Reality Labs products succeed.

### Meta Engineering Compensation by Track (2026)

| Track | Base (E5 equiv.) | Total comp range | Promotion velocity | Job security |
|-------|-----------------|------------------|-------------------|--------------|
| AI/ML (Llama, ranking) | $220–280K | $450–700K | Fast (18–24 mo) | High |
| Core product (FB, IG) | $200–250K | $380–550K | Slow (24–36 mo) | Moderate |
| Infrastructure/platform | $210–260K | $400–580K | Moderate | High |
| Reality Labs | $200–240K | $350–500K | Stalled | Uncertain |
| Ads/monetization | $210–270K | $420–620K | Moderate | High |

These ranges reflect Bay Area compensation for engineers with 5–8 years of experience. AI track premiums of 20–40% over core product are the largest internal disparity Meta engineers reported — and a primary driver of Bootcamp team selection in 2026.

---

## Takeaways

1. **Meta is two companies now.** AI/ML is where growth, compensation, and energy concentrate. Everything else is maintenance mode with higher per-person workload.

2. **The layoffs permanently changed the social contract.** Engineers who survived are loyal but anxious. Performance culture persists. The implicit message is that no role is safe.

3. **"Move fast with guardrails" is the new normal.** AI safety review, automated rollback, and stricter code review add process without eliminating Meta's experimentation-driven culture.

4. **Bootcamp and diff review culture are Meta's enduring strengths.** These institutions survived the layoffs and pivot because they work — Bootcamp builds networks, diff review maintains quality.

5. **Open source (Llama) changed the culture.** For the first time, Meta engineers build public reputations. This helps retention and recruiting in ways internal-only work never could.

6. **Non-AI career growth is genuinely harder.** With 70% of hires going to AI, promotion slots on core product teams are scarce. Engineers on those teams should plan accordingly.

7. **Meta compensation remains excellent but is tiered.** AI roles pay 20–40% more than equivalent core product roles. Factor this into team selection during Bootcamp.

8. **The metaverse isn't dead, but it's no longer the future.** Reality Labs engineers face uncertainty. Smart glasses may succeed; VR platform ambitions have contracted significantly.
  `.trim(),
  tags: ["meta", "engineering-culture", "big-tech"],
};
