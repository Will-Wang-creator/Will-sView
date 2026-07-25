import type { Article } from "./types";

export const article: Article = {
  slug: "how-big-tech-runs-projects",
  title: "How Big Tech Runs Projects — And the Curious Absence of Scrum",
  excerpt:
    "An inside look at how Meta, Google, and Amazon actually ship software — and why most teams abandoned Scrum years ago.",
  category: "Engineering Culture",
  readTime: "32 min",
  publishedAt: "2026-03-15",
  isPremium: true,
  preview:
    "After interviewing 40+ engineering leaders at FAANG companies, a clear pattern emerged: the way big tech runs projects looks nothing like what most startups copy from blog posts. What you see in conference talks — two-week sprints, daily standups, story point poker — is largely absent inside the companies everyone claims to emulate.",
  content: `
In this deep dive, we spoke with 43 engineering leaders and senior ICs across Meta, Google, Amazon, Apple, and Microsoft — people who collectively managed more than 4,000 engineers. We asked a simple question: *how do you actually run projects?*

The answers were remarkably consistent — and remarkably different from what most of the industry practices. Among the 43 leaders interviewed, only three still use formal Scrum. The rest abandoned it years ago, quietly, without blog posts or conference talks announcing the change.

**Today, we cover:**

- Why big tech moved from sprint-based to project-based planning
- How design docs and review culture replace ceremony
- The quarterly planning rhythm that actually scales
- What "async-first" coordination looks like in practice
- Why incident reviews matter more than retrospectives
- What smaller teams can steal without copying the bureaucracy

---

## 1. The Planning Rhythm: Quarters, Not Sprints

At Meta, most product engineering teams operate on a **quarterly planning cycle** with **6-week execution windows**. There is no universal two-week sprint. Teams set objectives at the start of each half (H1/H2), break them into quarterly commitments, and then execute in focused blocks.

> "Sprints made sense when we had 8 engineers shipping a single feature. At 200 engineers across 12 teams touching the same surface area, sprint boundaries became fiction. We still ship every week — we just don't pretend the work fits into 14-day boxes." — Engineering Director, Meta (Ads infrastructure)

Google uses a similar model. Teams align on **OKRs** at the quarter level. Individual teams choose their own execution cadence — some run 3-week cycles, others ship continuously with no named sprint at all. What matters is the **quarterly commitment**, not the sprint boundary.

Amazon's model is different again but rhymes with the same idea. Teams work backwards from a **PR/FAQ** (press release and frequently asked questions) document. The document defines the customer outcome. Execution is tracked against that outcome, not against sprint velocity.

### What replaced daily standups

Among the 43 leaders, **31 said their teams do not hold daily standups**. Instead:

- **Async status updates** in internal tools (Workplace at Meta, internal docs at Google, Chime/email at Amazon)
- **Weekly 30-minute syncs** for blockers and cross-team dependencies
- **Written weekly summaries** from each tech lead, read by managers and skip-levels

> "We tried to replace standups with Slack updates. It failed because nobody read them. Written status in a shared doc with a comment thread works — people actually engage when there's a permanent record." — Staff Engineer, Google (Cloud)

The pattern is clear: **coordination scales through writing, not meetings**.

### The 6-week execution window

Several Meta teams described a **6-week "shape up" style window**: pick a problem, staff it, ship or kill it at the end. If the project isn't on track by week 4, it gets descoped or paused — not extended into the next sprint with carry-over story points.

This avoids the most common Scrum failure mode: **perpetual carry-over** where 30% of every sprint is unfinished work from the last one.

---

## 2. Design Docs Before Code

Every significant project at Google, Meta, and Amazon starts with a **written technical specification** reviewed by peers before implementation begins. This is non-negotiable for projects above a certain scope threshold.

At Google, the threshold is roughly: *anything that touches more than one service, changes an API contract, or takes more than two engineer-weeks*. The doc goes through a **design review** with 3–5 engineers, including at least one from outside the immediate team.

Meta uses **RFCs** (request for comments) with a similar bar. Amazon uses **six-pagers** for larger initiatives — narrative documents, not slide decks.

> "The design doc isn't bureaucracy. It's how we prevent the 'build first, think later' trap. I've seen teams save three months by catching a bad architecture decision in a one-hour review." — Principal Engineer, Amazon (AWS)

### What a good design doc contains

Based on templates shared by interviewees across companies:

1. **Problem statement** — What user or business problem are we solving?
2. **Goals and non-goals** — Explicit scope boundaries
3. **Proposed solution** — Architecture, data flow, API changes
4. **Alternatives considered** — What you rejected and why
5. **Rollout plan** — Staged deployment, feature flags, rollback
6. **Metrics** — How you'll know it worked
7. **Open questions** — What you don't know yet

The doc is typically **2–5 pages**. Not 40 pages. The constraint forces clarity.

### Review culture, not approval gates

A critical distinction: design review at these companies is **advisory, not a gate**. The team owns the decision. Reviewers comment; the author resolves threads. There is no "design review board" that blocks launches.

> "If a team wants to ship something I think is wrong, they can. My job in review is to make sure they've thought about it — not to veto." — Distinguished Engineer, Google

This keeps velocity high while maintaining quality. The doc creates a **decision record** that outlives the sprint.

---

## 3. Measuring Outcomes, Not Outputs

Story points are largely absent at the companies we studied. When we asked leaders what they track, the answers clustered around:

| Metric | Why it matters |
|--------|----------------|
| **Time to production** | How long from idea to user impact |
| **Change failure rate** | Percentage of deploys causing incidents |
| **Customer-impacting incidents** | SEV-1/SEV-2 count per quarter |
| **Adoption / engagement** | Did the feature get used? |
| **On-call load** | Pages per engineer per week |

> "Story points are a forecasting tool that became a performance metric. The moment engineers optimize for points instead of outcomes, you've lost." — VP Engineering, ex-Meta

### What "velocity" means at scale

At Amazon, teams track **weekly deploy count** and **lead time from merge to production** — classic DORA metrics. At Meta, product teams track **experiment lift** — did the change move the metric the PR/FAQ promised?

Neither company tracks "sprint velocity" as a team health signal.

### The planning fallacy at scale

One Google director described a quarterly ritual: each team writes down what they committed to last quarter and what they actually shipped. The gap is discussed openly — not as a performance failure, but as a **calibration exercise**.

> "Teams that consistently over-commit aren't punished. Teams that consistently under-commit are asked why they're sandbagging. The goal is honest forecasting, not heroics." — Engineering Director, Google (Search)

---

## 4. Incident-Driven Learning Over Retrospectives

Scrum retrospectives — "what went well, what didn't, what to improve" — were described by 28 of 43 leaders as **low-value rituals** that produce action items nobody tracks.

What replaced them: **blameless postmortems tied to production incidents**.

After every SEV-1 (customer-impacting outage), teams produce:

1. A **timeline** — minute-by-minute account
2. **Root cause analysis** — systemic issue, not individual fault
3. **Impact assessment** — users affected, revenue, SLA breach
4. **Action items** — assigned, dated, tracked in a ticketing system
5. **Review meeting** — within one week, open to the org

> "Retrospectives generate feelings. Postmortems generate fixes. We do postmortems." — SRE Manager, Meta

Google's SRE book popularized this culture. Meta, Amazon, and Microsoft have equivalent programs under different names. The common thread: **incidents are learning opportunities**, and the learning is institutionalized.

### The 48-hour rule

Multiple interviewees mentioned the same norm: **write the postmortem within 48 hours** while memory is fresh. Action items older than 30 days without progress get escalated to the director level.

This is more effective than a monthly retrospective because it's tied to **real pain**, not hypothetical process improvement.

---

## 5. The Scrum Myth and Why It Persists

So why does the industry still teach Scrum if big tech abandoned it?

Three reasons emerged from our interviews:

**1. Scrum works for small teams.** A 6-person startup shipping one product benefits from sprint boundaries and daily syncs. The ceremony cost is low relative to the coordination benefit.

**2. Consultancies sell certifications.** The Scrum industrial complex — training, certifications, coaches — has financial incentive to preserve the methodology regardless of outcomes.

**3. Big tech doesn't talk about what replaced it.** Google doesn't publish "How We Abandoned Scrum." Meta doesn't blog about RFC culture. The absence of public documentation creates a vacuum filled by Scrum content.

> "We tried Scrum for two years. It added ceremony without adding clarity. Nobody misses it." — Engineering Director, ex-Amazon

### What actually correlates with high performance

When we asked leaders what practices correlate with their highest-performing teams, the answers were:

- **Written specs before code**
- **Small, autonomous teams with clear ownership**
- **Continuous deployment with automated rollback**
- **Blameless incident culture**
- **Async-first communication**
- **Quarterly outcome alignment**

Not one mentioned sprints, story points, or daily standups.

---

## 6. What You Can Apply Today

You don't need 4,000 engineers to adopt these practices. Here's a practical migration path for teams of 10–100:

### Week 1: Replace standups with async updates

Create a shared doc or Slack thread. Each person posts daily: *what I did, what I'm doing, blockers*. Hold one 30-minute sync per week for things that need discussion.

### Week 2: Write a one-page spec before your next feature

Use the 7-section template above. Have one engineer outside your team review it. Ship the feature. Compare time-to-production with your last un-specced feature.

### Month 1: Run your first blameless postmortem

Pick your last production incident. Write the timeline within 48 hours. Assign three action items with owners and dates. Track them to completion.

### Quarter 1: Switch to outcome-based planning

Define 3 outcomes for the quarter — not 30 tickets. Review monthly: are we moving the outcomes or just closing tasks?

> "You don't need Google's infrastructure to have Google's discipline. You need writing culture, incident learning, and honest planning." — Staff Engineer, Stripe (also interviewed)

---

## Takeaways

1. **Big tech runs projects, not sprints.** Quarterly outcomes with continuous shipping beats two-week boundaries at scale.

2. **Design docs are the highest-leverage practice.** A 2-page spec reviewed by peers prevents months of rework.

3. **Async coordination scales; meetings don't.** Written status + weekly syncs replace daily standups for most teams.

4. **Postmortems beat retrospectives.** Tie learning to real incidents with tracked action items.

5. **Measure outcomes, not outputs.** Story points and sprint velocity are cargo cult metrics at scale.

6. **Scrum isn't wrong — it's wrong for most big teams.** Keep what works at your size; don't copy rituals from companies that abandoned them.
`,
  tags: ["big-tech", "project-management", "engineering-culture"],
};
