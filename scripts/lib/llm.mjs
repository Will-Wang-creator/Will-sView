const STYLE_GUIDE = `Write in the Will'sView / Pragmatic Engineer editorial style:
- Investigative, practitioner-focused tone for senior engineers and eng leaders
- Open with a concrete hook (specific company, number, or quote)
- Include "**Today, we cover:**" bullet list near the top
- Use 4-6 numbered sections with ## headings
- Include at least 2 blockquotes with attribution (role + company type, no real names required)
- Include at least 1 markdown table where useful
- End with "## Takeaways" numbered list (5-7 items)
- Use markdown: **bold**, lists, --- section breaks
- Length: 1800-2500 words
- Do NOT invent specific real people's names; use roles like "Staff engineer, fintech startup"
- Frame as analysis of the news topic's implications for engineering teams, not a news recap only`;

export async function generateArticleDraft({ topic, sources, dateISO }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateFallbackDraft({ topic, sources, dateISO });
  }

  const sourceList = sources
    .map((s) => `- ${s.title} (${s.source}): ${s.url}`)
    .join("\n");

  const prompt = `You are the lead editor at Will'sView, a premium engineering intelligence publication.

Write a long-form article analyzing this week's top tech/engineering news topic:

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
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You produce high-quality engineering journalism as JSON only.",
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
    .slice(0, 5)
    .map((s) => `- **${s.title}** — ${s.source}`)
    .join("\n");

  const content = `
This week, "${topic.title}" dominated engineering Slack channels and leadership meetings. The headline is easy to share; the implications for how teams ship software, allocate headcount, and evaluate risk are harder — and that's what practitioners need.

We tracked coverage across Hacker News, major tech press, and company engineering blogs to separate signal from hype. What follows is a practitioner-first analysis: what changed, who is affected, and what engineering leaders should do in the next 30 days.

**Today, we cover:**

- Why this story matters beyond the headline
- What engineering teams are changing in response
- Risks, tradeoffs, and second-order effects
- A practical playbook for staff+ engineers and managers

---

## 1. What Happened

${topic.title} surfaced as a top story this week (${dateISO}), driven by broad interest across the tech ecosystem. Primary coverage: ${topic.url}

The immediate reaction in engineering orgs follows a familiar pattern: platform teams assess infrastructure impact, product teams reassess roadmap priorities, and security/compliance teams ask whether existing controls still hold.

> "The question on my team wasn't 'did you see the news?' — it was 'does this change our Q3 bet?' That's the bar for stories that matter." — Engineering Director, growth-stage SaaS

---

## 2. Engineering Implications

### Shipping velocity

Teams shipping weekly should expect at least one planning meeting to reference this topic. The useful exercise is not panic — it's identifying which assumptions in your architecture or hiring plan now deserve a explicit revisit.

### Org design

If the story touches AI, infrastructure, or regulation, expect cross-functional work to land on platform or infra teams first. Product engineering may feel second-order effects within 4-8 weeks.

### Talent and hiring

News cycles compress decision timelines. Candidates will ask about your stance in interviews; interviewers should have a consistent, honest answer that connects company strategy to team reality.

---

## 3. What Teams Are Doing Now

Based on patterns from similar news cycles in 2024–2026, high-performing teams typically:

1. **Assign a DRI** for a 2-week spike to evaluate impact (not a permanent committee)
2. **Write a one-pager** — problem, options, recommendation — before changing roadmap
3. **Communicate early** to eng org: what we know, what we don't, what we're testing
4. **Avoid thrash** — no production changes without a rollback plan and success metric

| Team type | Typical first move | Common mistake |
|-----------|-------------------|----------------|
| Startup (<50 eng) | Founder/CTO memo + 30-min all-hands | Over-rotating roadmap |
| Growth (50–200) | Platform spike + PM triage | Silent teams guessing |
| Enterprise (200+) | Risk review + legal/compliance | 6-week analysis paralysis |

---

## 4. Related Coverage This Week

${related}

---

## 5. A 30-Day Playbook

**Week 1:** Name a DRI. Gather primary sources (not Twitter threads). List systems/processes potentially affected.

**Week 2:** Run a lightweight threat/opportunity review with staff engineers. Document unknowns explicitly.

**Week 3:** Pilot one measurable experiment if warranted — feature flag, internal tool, or policy update.

**Week 4:** Retrospective: keep, revert, or scale. Share learnings in eng all-hands.

> "We treat news like incidents — clear owner, time-boxed investigation, written conclusion. It stops the endless Slack debate." — Staff engineer, public tech company

---

## Takeaways

1. **Headlines lag engineering reality by 2–6 weeks** — your job is to translate early.
2. **Assign ownership** — undirected teams debate; directed teams learn.
3. **Write before you reorg** — one-pagers beat reactive roadmap churn.
4. **Measure one thing** — pick a metric that proves whether your response worked.
5. **Communicate uncertainty** — credibility beats false confidence.
6. **Protect deep work** — not every news cycle deserves a production change.
7. **Revisit in 30 days** — most stories shrink; a few compound. Know which you are facing.
  `.trim();

  return {
    title: topic.title.endsWith("?") ? topic.title : `${topic.title}: What Engineering Teams Should Know`,
    excerpt: `This week's top engineering story — what changed, who's affected, and a 30-day playbook for tech leaders.`,
    preview: `${topic.title} made headlines this week. Here's what engineering leaders need to know about shipping, org design, and risk — beyond the hot take...`,
    content,
    category: "Trends",
    tags: ["weekly", "news", "engineering", "trends"],
  };
}
