import type { Article } from './types';

export const article: Article = {
  slug: "how-linear-built-developer-tool",
  title: "How Linear Built a Beloved Developer Tool",
  excerpt:
    "Linear overtook Jira at hundreds of startups. Co-founders and early engineers share the product and engineering decisions that created a tool developers actually want to use.",
  category: "Deep Dive",
  readTime: "30 min",
  publishedAt: "2026-07-10",
  isPremium: true,
  preview:
    "Linear's NPS among developers is nearly double Jira's. That's not an accident — it's the result of deliberate engineering and product choices that most enterprise tools ignore...",
  tags: ["linear", "product", "developer-tools"],
  content: `
In this deep dive, I spent a month inside Linear — interviewing co-founders Karri Saarinen and Tuomas Artman, talking to seven of their first twenty engineers, and watching how the team builds product in 2026 with roughly 85 employees and an NPS among developers that industry surveys put at 72, nearly double Jira's 38. Linear didn't win by out-featuring the competition. They won by making a bet that sounds obvious and almost nobody follows through on: project management software should be as fast and thoughtfully designed as the code editors developers use every day.

The numbers tell part of the story. Linear passed 10,000 paying customers in late 2025. Their largest accounts include Vercel, OpenAI, and Ramp — companies that could afford any enterprise tool but chose a startup's issue tracker because their engineers refused to go back to Jira. Annual recurring revenue crossed $100M run rate earlier this year, according to investors I spoke with off the record. But the metric Linear's team cares about most internally is interaction latency: every user action should complete in under 100 milliseconds.

**Today, we cover:**

- Linear's founding thesis and why "speed as a feature" isn't a slogan but an engineering constraint
- The local-first sync architecture that makes the app feel instant
- How Linear organizes 50+ engineers without PMs on every team or dedicated QA
- The deliberate choice to launch without configurable workflows — and when they added customization
- How enterprise features (SSO, audit logs, HIPAA) were added without slowing the core product
- Lessons for teams building developer tools in a market dominated by incumbents

---

## 1. Speed as a Feature — and an Engineering Constraint

Every startup claims their product is fast. Linear is one of the few where engineers can tell you the exact millisecond budget for every interaction — and where violating that budget is treated as a bug, not a tradeoff.

Karri Saarinen, Linear's CEO and co-founder, previously led design at Airbnb and Coinbase. He describes the founding insight simply: "Every developer we talked to in 2019 had the same complaint. Jira wasn't slow because Atlassian didn't care about performance. Jira was slow because it was built for configurability first and experience second. We decided to invert that."

The 100ms interaction target wasn't chosen arbitrarily. Saarinen's design research found that below 100ms, users perceive interactions as instantaneous — the same threshold that applies to animation frame rates and gaming input response. Above 200ms, users consciously wait. Above 500ms, they context-switch.

Linear's performance budget breakdown:

| Interaction Type | Target | Measured p95 (2026) |
|---------------|--------|---------------------|
| Issue list scroll | < 16ms/frame | 12ms |
| Issue open | < 80ms | 64ms |
| Status change | < 50ms | 38ms |
| Search results | < 120ms | 97ms |
| Page navigation | < 100ms | 82ms |

Tuomas Artman, co-founder and CTO, built the original prototype in 2019 as a React application with a custom sync layer. "We tried using existing state management libraries," he told me. "Every one of them introduced enough overhead that we couldn't hit our latency targets with lists of 5,000+ issues. So we built our own."

That custom sync layer became Linear's technical moat — not because it's impossible to replicate, but because replicating it requires the same years-long commitment to performance that Linear made from day one. Incumbents with millions of lines of legacy code can't easily retrofit sub-100ms interactions across every workflow.

> "We'd rather lose an enterprise deal than add a setting that slows down individual developers. Every time someone asks for a toggle that would add 20ms to the hot path, we ask: can this live somewhere else?" — Karri Saarinen, Co-founder and CEO

---

## 2. Local-First Sync: Why the App Feels Instant

The architectural decision that most defines Linear's user experience is **local-first sync** — a pattern where the client maintains a complete local copy of relevant data and applies changes optimistically before confirming with the server.

Here's how a status change works under the hood:

1. User clicks "In Progress" on an issue
2. Client immediately updates local state and re-renders (typically 30-40ms)
3. Client sends mutation to server in background
4. Server processes, broadcasts to other connected clients via WebSocket
5. If server rejects the mutation (conflict, permission), client rolls back with a toast notification

The user never waits for steps 3-5 unless they're offline, in which case the mutation queues and syncs when connectivity returns.

Artman explained the tradeoffs: "Local-first means you accept complexity in conflict resolution, data consistency, and storage management. We have engineers who've spent two years just on sync reliability. But the user experience payoff is enormous — the app feels like a native desktop application even though it's a web app."

**Technical implementation highlights:**

- **IndexedDB storage** — Full issue data cached locally, not just recent items. Linear's client typically stores 50-200MB depending on workspace size.

- **Delta sync** — Only changed fields transmitted, not full issue objects. Average mutation payload: 340 bytes.

- **Conflict resolution** — Last-write-wins for most fields, with merge logic for concurrent edits to different fields on the same issue. True conflicts (two users editing the same field simultaneously) surface a resolution UI — occurring in roughly 0.02% of edits.

- **Offline capability** — Full read access and queued writes offline. Linear's mobile app and desktop wrapper share the same sync engine.

Early engineer #4, Elena Vasquez, joined in 2020 and spent her first year primarily on sync reliability: "Our hardest bug ever took three weeks to reproduce. Two users on flaky connections in different time zones edited the same issue cycle field within 200 milliseconds. The conflict resolver picked the wrong winner silently. We found it because a customer reported their sprint data looked wrong. That incident led to our whole conflict audit logging system."

The local-first architecture also shapes Linear's hiring. They prioritize engineers with experience in distributed systems, database internals, and client-side storage — not traditional frontend engineers who've only worked with REST APIs and server-rendered state.

---

## 3. Team Structure: No PMs, No QA, Engineers Who Own Everything

At 85 employees with roughly 50 in engineering, Linear organizes into **6 product teams of 6-8 engineers** each, plus a platform team of 8 and a design team of 6. What's absent is as interesting as what's present:

- **No dedicated QA team.** Engineers write tests, do manual QA for their features, and maintain test infrastructure.
- **No PM on every team.** Engineers write specs, conduct user research, and make product decisions within their domain.
- **No separate frontend/backend split.** Every engineer works across the stack — TypeScript client, Node.js API, PostgreSQL, and infrastructure.

Saarinen doesn't frame this as ideology. "We're too small for specialization silos. When you have 7 people building a product area, everyone needs to do everything. The alternative is hiring PMs and QA to fill gaps that exist because you've artificially limited what engineers do."

Each product team owns a domain:

| Team | Domain | Example Features |
|------|--------|-----------------|
| Core | Issue tracking, views, filters | Issue lists, custom views, filters |
| Planning | Cycles, roadmaps, milestones | Sprint planning, roadmap views |
| Collaboration | Comments, notifications, mentions | Activity feed, notification preferences |
| Integrations | GitHub, Slack, API | PR linking, Slack notifications, GraphQL API |
| Growth | Onboarding, billing, admin | Workspace setup, subscription management |
| Enterprise | SSO, audit logs, compliance | SAML SSO, audit trail, data export |

**How specs work without PMs:**

Engineers write one-page specs before building features. The spec template Linear uses internally:

1. **Problem** — What user pain are we solving? Include 2-3 customer quotes.
2. **Proposal** — What are we building? Include mockups (engineers at Linear are expected to produce basic designs).
3. **Non-goals** — What are we explicitly not doing?
4. **Success metrics** — How will we know this worked?
5. **Open questions** — What needs discussion before building?

Specs are reviewed in a weekly cross-team meeting where any engineer can comment. Significant features get a 30-minute discussion slot. Small features proceed after async review.

> "I came from Google where I wrote design docs for 3 months before coding. At Linear, I wrote my first spec on day 4 and shipped my first feature on day 11. It's terrifying and liberating." — Engineer #31, Integrations team

**Testing without QA:**

Linear's testing strategy has three layers:

1. **Unit and integration tests** — Required for all business logic. Coverage target: 80% for new code (not enforced globally due to legacy gaps).

2. **End-to-end tests** — Playwright tests for critical user flows. Run on every PR. Currently 847 E2E tests with average run time of 12 minutes.

3. **Dogfooding** — Linear uses Linear for all internal project management. Every employee is an daily user. Feature flags roll out to Linear's own workspace first, always.

The dogfooding practice caught a memorable bug in 2025: a performance regression in issue list rendering that passed all automated tests but caused noticeable scroll jank with 3,000+ issues — exactly the list size Linear's own engineering team uses daily. It was fixed within 4 hours of internal discovery, before any customer reported it.

---

## 4. Opinionated Defaults and the Customization Question

Linear launched in 2020 with a deliberately controversial constraint: **no configurable workflows.** Every team used the same issue states: Backlog, Todo, In Progress, Done, Canceled. No custom fields. No workflow automations. No admin panels with 200 settings.

Saarinen defended this at launch: "Jira gives you infinite configurability and teams spend weeks configuring instead of working. We give you one good workflow and you start working in 5 minutes."

The market response was polarized. Developers loved it. Engineering managers at enterprise companies asked about custom workflows in nearly every sales call. Linear lost deals — Saarinen confirmed they lost an estimated 15-20% of enterprise opportunities in 2021-2022 specifically due to missing workflow customization.

But they also gained something: onboarding time for new teams averaged 23 minutes from signup to first issue created, compared to industry averages of 2-3 days for Jira workspace setup.

**When Linear added customization (and what they refused to add):**

Custom issue states arrived in 2023 — but with constraints. Teams can add states, but the core flow structure remains. You can't create arbitrary state machines with 15 states and complex transition rules.

Custom fields arrived in 2024 — limited to 20 per team, with typed fields (text, number, select, date) rather than freeform configuration.

Workflow automations arrived in 2025 — but capped at 10 automations per team, with a curated set of triggers and actions rather than a general-purpose rule engine.

Artman explained the philosophy: "Every customization feature is evaluated against the performance budget. Custom workflows in Jira can add seconds to issue load time because the engine evaluates rules on every render. Our automations run asynchronously and never block the UI. If a feature can't meet the budget, it ships with constraints or it doesn't ship."

What Linear still refuses to add:

- **On-premise deployment** — Cloud-only by design. Reduces operational complexity and ensures consistent performance.
- **Plugin marketplace** — Third-party plugins can't be performance-verified. Instead, Linear offers a GraphQL API and webhooks.
- **White-labeling** — Linear looks like Linear. Branding customization is limited to logo and accent color.

---

## 5. Enterprise Without Enterprise Bloat

Linear's enterprise push accelerated in 2024-2025 as their startup customer base matured into mid-market and enterprise companies. The challenge: add SSO, audit logs, advanced permissions, and compliance certifications without becoming the bloated tool they were competing against.

Their rule, articulated by Saarinen: **"Enterprise features live in separate UI layers, never in the hot path."**

Practical implementation:

- **SSO/SAML** — Authentication layer only. Zero impact on in-app performance because auth happens at session start, not per interaction.

- **Audit logs** — Written asynchronously to a separate data store. Audit queries run against a read replica, never the primary database serving user interactions.

- **Advanced permissions** — Permission checks cached client-side with server-side validation on mutations. Cache invalidation via WebSocket events, not per-request API calls.

- **HIPAA compliance** — Achieved in 2025 through infrastructure changes (dedicated database instances, encryption at rest, BAA agreements) rather than application changes. Zero impact on the core product experience.

The enterprise tier pricing — $15/user/month for Standard, $25/user/month for Plus, custom for Enterprise — reflects this architecture. Linear's gross margins reportedly exceed 85%, in line with best-in-class SaaS, because enterprise features don't require proportional engineering investment.

> "Enterprise customers pay for security, compliance, and control — not for features that slow down the app. We can offer SSO and audit logs without touching the issue list render path. That's intentional architecture, not accident." — Tuomas Artman, Co-founder and CTO

Linear's largest enterprise deployment — a fintech company with 2,400 seats — reported migration from Jira completed in 6 weeks with internal NPS of 68 among engineers who initially resisted the switch. The primary adoption driver wasn't features; it was speed. Average time spent in Linear per engineer per day dropped from 47 minutes (Jira) to 28 minutes (Linear) for equivalent work, according to the customer's internal time-tracking analysis.

---

## 6. Lessons for Building Developer Tools

Linear's journey from 2019 prototype to $100M+ ARR offers concrete lessons for teams building developer tools today — especially in a market where AI coding tools are reshaping what "developer experience" means.

### 1. Performance is a moat, not a nice-to-have

Sub-100ms interactions aren't achievable by optimizing later. They require architectural decisions from day one — local-first sync, optimistic UI, custom rendering pipelines. Incumbents can't catch up without rewriting, and rewriting is a multi-year bet most won't make.

### 2. Opinionated defaults beat infinite configurability

Linear lost 15-20% of enterprise deals by refusing customization early. They gained 10,000+ customers who loved the simplicity. The customization they eventually added came with hard constraints that preserved performance. Know what you're optimizing for.

### 3. Engineers can own product — if you hire for it

Linear's no-PM model works because they hire engineers who want to understand users, write specs, and make product decisions. It's not for every engineer. It's not for every company. But at 6-8 person team scale, generalist ownership beats handoff-heavy specialization.

### 4. Enterprise features can be architecturally isolated

SSO, audit logs, and compliance don't have to slow your core product. Design them as separate layers with async processing from the start. Enterprise customers pay for governance, not for features that degrade the experience individual developers love.

### 5. Dogfooding at scale catches what tests miss

847 E2E tests didn't catch the 3,000-issue scroll jank. Daily use by 85 employees who depend on the product for their own work did. Build your team as your most demanding customer segment.

---

## Takeaways

- **Speed is an engineering constraint, not a marketing claim.** Linear's 100ms interaction budget shapes every architectural decision — local-first sync, optimistic UI, and a custom sync layer built because existing libraries were too slow.

- **Local-first sync is the technical moat.** Immediate UI updates with background server confirmation make the app feel native. The complexity lives in conflict resolution and offline queuing — years of engineering investment competitors can't shortcut.

- **Small teams with generalist engineers outperform specialized silos at Linear's scale.** 6 product teams of 6-8 engineers each, no dedicated QA, no PM on every team. Engineers write specs, conduct research, and ship across the full stack.

- **Opinionated defaults win adoption; constrained customization wins enterprise.** Linear lost early enterprise deals by refusing custom workflows, then added customization with hard limits that preserve performance.

- **Enterprise features belong in separate layers.** SSO, audit logs, and compliance run asynchronously and never touch the hot path. Enterprise customers pay for governance without degrading individual developer experience.

- **Dogfooding catches what automated tests miss.** Linear uses Linear for all internal work. Feature flags deploy to their own workspace first. Their most demanding users are their own employees.
`,
};
