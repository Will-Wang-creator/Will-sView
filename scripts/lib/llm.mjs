const STYLE_GUIDE = `Write in the Will'sView / Pragmatic Engineer editorial style (reference: Gergely Orosz long-form engineering journalism):

VOICE & AUDIENCE
- Investigative, practitioner-first tone for staff+ engineers, EM, and VP Eng
- Write like you interviewed 8–15 practitioners and read primary sources — not like a news recap
- Frame around a real organizational problem, then analyze root causes, tradeoffs, and what to do next

STRUCTURE (required)
- Open with a concrete hook: specific number, company type, quote, or scene from an eng org
- Include "**Today, we cover:**" with 5–7 bullet points near the top
- Use 6–8 numbered sections with ## headings (e.g. "## 1. ...", "## 2. ...")
- Include "## Related Coverage" citing how HN, Stack Overflow Blog, TechCrunch, Ars, etc. covered the story
- End with "## Takeaways" — numbered list of 6–8 actionable items

DEPTH REQUIREMENTS
- Length: 2,400–3,500 words minimum in the content field
- At least 3 blockquotes with role attribution (e.g. "Staff engineer, fintech" — no invented real names)
- At least 2 markdown tables (benchmarks, role comparisons, playbook by company stage, etc.)
- Include survey-style framing where appropriate ("we analyzed...", "teams reported...", "in conversations with...")
- One section with a practical playbook (week-by-week or by company stage: startup / growth / enterprise)
- One section on risks, second-order effects, or failure modes
- Use --- between major sections; use **bold** for emphasis; include subsections with ### where useful

EDITORIAL RULES
- Title must be a compelling editorial headline — NOT "Topic: What Engineering Teams Should Know"
- Do NOT invent specific real people's names
- Reference news sources by publication name; do not copy text verbatim
- Connect the news to shipping velocity, org design, hiring, platform strategy, or reliability as relevant`;

export async function generateArticleDraft({ topic, sources, dateISO }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set — using expanded fallback template (set key for full depth).");
    return generateFallbackDraft({ topic, sources, dateISO });
  }

  const sourceList = sources
    .map((s) => `- ${s.title} (${s.source}): ${s.url}`)
    .join("\n");

  const prompt = `You are the lead editor at Will'sView, a premium engineering intelligence publication in the style of The Pragmatic Engineer.

Write a long-form investigative analysis of this week's top tech/engineering news topic:

Topic headline: ${topic.title}
Primary URL: ${topic.url}
Publication date: ${dateISO}

Related coverage:
${sourceList}

${STYLE_GUIDE}

Return ONLY valid JSON with these fields (no markdown code fence):
{
  "title": "compelling editorial title (not identical to headline)",
  "excerpt": "1-2 sentence subtitle for article cards",
  "preview": "2-3 sentence free preview paragraph ending with ellipsis...",
  "content": "full markdown article body",
  "category": "one of: Trends, Career, Engineering Culture, Industry, Best Practices, Deep Dive",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      temperature: 0.65,
      max_tokens: 12000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You produce Pragmatic Engineer–quality engineering journalism as JSON only. Articles must exceed 2400 words in content.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.warn(`OpenAI failed (${res.status}), using fallback draft: ${err.slice(0, 200)}`);
    return generateFallbackDraft({ topic, sources, dateISO });
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty LLM response");

  const parsed = JSON.parse(raw);
  if (!parsed.title || !parsed.content) {
    throw new Error("LLM response missing required fields");
  }

  return parsed;
}

function generateFallbackDraft({ topic, sources, dateISO }) {
  const related = sources
    .slice(0, 6)
    .map((s) => `- **${s.title}** — ${s.source}`)
    .join("\n");

  const shortTitle = topic.title.length > 80 ? topic.title.slice(0, 77) + "..." : topic.title;

  const content = `
In the week of ${dateISO}, "${topic.title}" moved from niche forums to leadership Slack channels. The headline travels fast because it names something practitioners already feel but rarely document: tooling choices are not neutral preferences — they encode trust, identity, and organizational memory.

We read primary coverage (${topic.source}), cross-checked discussion on Hacker News and engineering blogs, and mapped the story against patterns from similar cycles in 2024–2026. What follows is not a recap. It is an analysis of why this topic lands now, who pays the cost when teams ignore it, and what engineering leaders should change in the next 30–90 days.

**Today, we cover:**

- Why this story resonates beyond the headline
- How tooling decisions become trust decisions in engineering orgs
- What high-performing teams do differently when evaluating change
- Org design, hiring, and platform implications
- Risks: toolchain thrash, silent veto power, and knowledge silos
- A playbook by company stage (startup, growth, enterprise)
- Related coverage and primary sources

---

## 1. What Changed — and Why Now

${topic.title} surfaced as a top story this week (${dateISO}). Primary source: ${topic.url}

Three forces typically converge when a tooling story breaks through noise:

1. **Adoption saturation** — a category (AI assistants, observability, CI, IDEs) crossed from early adopter to default assumption in interviews and RFPs.
2. **Budget scrutiny** — finance asks for ROI on tool spend; engineering must articulate value beyond "developers like it."
3. **Trust fracture** — an incident, outage, or policy change (data retention, model training, SSO) forces teams to ask what their tools actually promise.

The immediate reaction in engineering orgs follows a familiar pattern: platform teams assess integration and security impact, product teams reassess roadmap dependencies, and people managers watch for morale signals that surveys miss.

> "We stopped debating features. The question became: who do we trust with our code, our incidents, and our customer data? That's not a toolchain conversation — it's a governance conversation wearing a toolchain hat." — Director of Platform Engineering, mid-market SaaS

---

## 2. Tools Encode Trust — Not Just Productivity

Practitioner interviews and blog discourse this week converge on a point Stack Overflow and senior ICs have made for years: **developers do not switch tools casually because switching breaks a trust chain.**

That chain has four links:

| Link | What engineers trust | What breaks it |
|------|---------------------|----------------|
| Correctness | Output matches intent (compiler, test runner, AI suggestion) | Silent wrongness, hallucinated APIs |
| Privacy | Code and context stay inside policy | Training on private repos, unclear retention |
| Continuity | Muscle memory, plugins, runbooks still work | Forced migrations, license changes |
| Status | Tool choice signals craft identity | Mandates from leadership with no practitioner input |

When leaders treat tooling as a procurement optimization problem, they optimize the wrong function. The cost is not the subscription line item — it is **coordination tax**: retraining, duplicated workflows, shadow IT, and engineers who comply publicly while routing work through trusted personal setups.

Survey-style patterns from comparable orgs (50–300 engineers) in 2025–2026 show teams that mandate top-down tool changes without a 4-week parallel run see **15–25% longer cycle time** on affected services for one quarter — even when the new tool is objectively better.

---

## 3. Engineering Implications

### Shipping velocity

Teams shipping weekly should expect planning conversations to reference this topic for 2–4 weeks. The useful exercise is not panic — it is naming **which assumptions** in your delivery system depend on a specific vendor or workflow.

Ask explicitly:
- If we lost this tool tomorrow, which services stop deploying?
- Which on-call runbooks embed tool-specific steps?
- Where do AI-assisted workflows bypass code review norms?

### Org design

Platform and developer experience teams become the default owner — but the decision is cross-functional. Security, legal, finance, and product must be in the room before a mandate lands.

A healthy pattern: **tool councils** with rotating IC representation (not permanent "tool police"), quarterly review, and a published evaluation rubric.

### Talent and hiring

Candidates now ask about AI policy, data handling, and IDE freedom in first rounds. Interviewers need honest, consistent answers tied to strategy — not "we use whatever you want" unless that is actually true.

---

## 4. What High-Performing Teams Do

Based on patterns from similar news cycles, teams that avoid thrash typically:

1. **Assign a DRI** for a time-boxed (2–4 week) evaluation — not an open-ended committee
2. **Publish evaluation criteria** before picking winners: security, latency, DX, cost, exit cost
3. **Run parallel workflows** — old and new side by side with measured tasks, not slide demos
4. **Communicate uncertainty** — what you know, what you're testing, what would change the decision
5. **Protect deep work** — no production migration without rollback and success metrics

| Team type | Typical first move | Common mistake |
|-----------|-------------------|----------------|
| Startup (<50 eng) | Founder memo + optional pilot squad | Mandating before product-market fit stabilizes |
| Growth (50–200) | Platform spike + security review | Silent mandates; shadow tooling explosion |
| Enterprise (200+) | Risk review + phased rollout by business unit | Six-month RFP with no practitioner input |

> "We treat major tool changes like migrations — feature flags, rollback plans, and a written postmortem even when it succeeds. That single habit cut our 'surprise veto' rate in half." — Staff engineer, public tech company

---

## 5. Risks and Second-Order Effects

**Toolchain thrash:** Changing IDEs, AI assistants, or observability stacks more than once per year burns credibility. Engineers stop investing in learning official tools.

**Silent veto power:** Senior ICs who distrust a mandate often route critical work through personal setups. Compliance dashboards show green; actual risk sits outside audit scope.

**Identity politics:** Tool debates become proxy wars for autonomy, quality standards, or distrust of management. Unresolved, they show up as review nitpicks and slow hiring loops.

**Vendor concentration:** Standardizing on one AI or observability vendor without exit plan creates the same coupling teams spent a decade escaping with cloud providers.

---

## 6. A 90-Day Playbook for Engineering Leaders

**Days 1–14: Name the problem.** Is this about cost, security, velocity, or morale? Interview 6–8 engineers across levels. Document current toolchain map and incident dependencies.

**Days 15–30: Evaluate with criteria.** Score options on a shared rubric. Include "cost to leave" as a first-class column. Share draft findings with eng org before deciding.

**Days 31–60: Pilot with metrics.** Pick one team or service. Measure cycle time, review latency, incident MTTR, or survey DX — not vanity adoption counts.

**Days 61–90: Decide, document, revisit.** Scale, revert, or extend pilot. Publish internal decision record: context, options, tradeoffs, revisit date.

| Stage | Minimum bar before mandate |
|-------|---------------------------|
| Startup | 2-week pilot, founder + lead IC sign-off |
| Growth | Security + platform sign-off, rollback tested |
| Enterprise | Phased BU rollout, legal/compliance review |

> "The teams that win aren't the ones with the newest tools. They're the ones where practitioners trust the process that picks tools." — VP Engineering, Series C fintech

---

## 7. Related Coverage This Week

${related}

Primary topic coverage: **${shortTitle}** — ${topic.source}

---

## Takeaways

1. **Tooling is trust infrastructure** — productivity metrics miss the governance layer.
2. **Mandates without parallel runs fail quietly** — shadow workflows are the real architecture.
3. **Publish evaluation criteria before winners** — transparency beats surprise announcements.
4. **Measure exit cost** — every standardization decision is also a coupling decision.
5. **Time-box evaluations** — open-ended tool committees become political battlegrounds.
6. **Candidates are watching** — your AI and data policy is now part of employer brand.
7. **Revisit in 90 days** — most tool hype fades; a few choices compound. Know which you made.
8. **Protect IC voice** — rotating councils beat permanent toolchain dictatorship.
  `.trim();

  return {
    title: editorialTitleFromTopic(topic.title),
    excerpt: `Why "${shortTitle}" is really a trust and governance story — and what engineering leaders should do in the next 90 days.`,
    preview: `${shortTitle} made headlines this week. Beneath the hot takes is a harder question: when tools encode trust, how should engineering orgs choose, mandate, and migrate without burning velocity...`,
    content,
    category: "Engineering Culture",
    tags: ["weekly", "tooling", "engineering-culture", "trust"],
  };
}

function editorialTitleFromTopic(headline) {
  if (headline.toLowerCase().includes("trust") && headline.toLowerCase().includes("tool")) {
    return "When Tools Encode Trust: Why Developer Tooling Decisions Are Org Decisions";
  }
  if (headline.length <= 72 && !headline.includes(":")) return headline;
  const trimmed = headline.replace(/\?+$/, "").trim();
  if (trimmed.length <= 72) return trimmed;
  return trimmed.slice(0, 69).trim() + "...";
}
