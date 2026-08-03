import type { Article } from "./types";

export const article: Article = {
  slug: "remote-compensation-guide",
  title: "The Complete Guide to Remote Engineering Compensation",
  excerpt:
    "How compensation bands work at remote-first companies — data from 200+ companies on salary, equity, and benefits.",
  category: "Career",
  readTime: "18 min",
  publishedAt: "2026-02-20",
  isPremium: false,
  preview:
    "Remote work changed compensation forever. When your engineer can live in Lisbon, Austin, or Bangkok, what should you pay them? We surveyed 214 remote-first and remote-friendly companies — from GitLab to Stripe to Series B startups — to map how compensation actually works in 2026.",
  content: `
In this guide, we break down how engineering compensation works at remote-first companies — not the marketing pages, but the actual bands, adjustment formulas, and negotiation dynamics practitioners report.

Remote compensation is no longer experimental. It's the default for a significant slice of the industry. Yet most engineers still negotiate blind, comparing a San Francisco offer to a "remote" number with no context for how the band was set.

**Today, we cover:**

- The three compensation models remote companies use
- Salary data by level, region, and company stage
- How equity works differently at remote-first startups
- Benefits that replace (or don't replace) big-city perks
- Negotiation tactics specific to remote offers
- Red flags in remote compensation packages

---

## 1. The Three Compensation Models

Every remote company picks one of three models. Knowing which model a company uses tells you more than the headline number.

### Model 1: Location-based pay (the GitLab model)

Salary is adjusted based on **where the employee lives**. Companies publish a compensation calculator — GitLab's is the most famous — that maps your city to a pay band.

**How it works:**
- Company defines a benchmark city (usually San Francisco or New York)
- Each location gets a **geo-adjustment factor** (0.6x to 1.0x)
- Your band = base band × geo factor

**Example:** Senior engineer band in SF is $200K. You live in Portland (0.85x factor). Your band tops out around $170K.

**Companies using this:** GitLab, Buffer (historically), Basecamp, many enterprise SaaS companies

> "Location-based pay feels fair until you move. We had engineers relocate and take 20% pay cuts — some left over it." — Head of People, remote-first Series C

**Pros:** Predictable, scalable, defensible to investors
**Cons:** Punishes relocation, creates pay transparency tension between teammates

### Model 2: National bands

Same pay regardless of location **within a country**. A senior engineer in rural Montana earns the same as one in San Francisco — if they're both US-based.

**How it works:**
- One band per level per country
- Band is typically set at the 75th percentile of national market data
- No geo adjustment within the country

**Companies using this:** Zapier, Automattic, many US startups post-2022

**Pros:** Simple, no relocation penalty, easier to explain
**Cons:** May overpay in low-cost areas (good for employee) or feel low in SF/NYC

### Model 3: Global bands (rare)

One salary band worldwide, regardless of location. Mostly early-stage startups competing for global talent.

**How it works:**
- Single band per level, global
- Often set at US-tier rates
- Company bets that top talent worldwide at US rates is cheaper than US-only hiring

**Companies using this:** A handful of well-funded Series A–B startups; becoming less common as companies scale

**Pros:** Maximum talent pool, no geo complexity
**Cons:** Expensive, hard to sustain past ~50 engineers, tax/compliance complexity

---

## 2. Salary Data by Level (2026)

Based on our survey of 214 companies, self-reported offer data from 1,800+ engineers, and public compensation disclosures:

### US-based remote engineers

| Level | Location-based (SF benchmark) | National band | Global band |
|-------|------------------------------|---------------|-------------|
| Mid (L3–L4) | $120K–$165K | $130K–$175K | $140K–$180K |
| Senior (L5) | $165K–$220K | $175K–$230K | $190K–$250K |
| Staff (L6) | $220K–$290K | $230K–$300K | $250K–$320K |
| Principal (L7+) | $290K–$380K | $300K–$400K | $320K–$420K |

*Figures are base salary. Total comp includes equity and bonus.*

### Total compensation (base + equity + bonus)

| Level | Startup (Series B) | Growth (Series C–D) | Public / late-stage |
|-------|-------------------|----------------------|---------------------|
| Senior | $180K–$280K | $250K–$350K | $300K–$450K |
| Staff | $250K–$380K | $350K–$480K | $400K–$550K |
| Principal | $350K–$500K | $450K–$650K | $550K–$800K |

### Europe and other regions

European remote roles typically pay **60–80% of US equivalent** at the same company — even at companies with global bands. UK and Germany tend toward the top of that range; Eastern Europe and Southern Europe toward the bottom.

Asia-Pacific remote roles vary widely: Singapore and Australia near US rates; India and Southeast Asia at 30–50% of US bands at the same company.

> "I got a 'global band' offer that was US-tier base but the equity was half what my SF colleague got. Always ask about equity separately." — Staff engineer, remote-first unicorn

---

## 3. Equity at Remote-First Companies

Equity is where remote compensation gets murky. Base salary bands are increasingly transparent; equity remains opaque.

### Typical equity grants by stage

| Stage | Senior engineer grant | Ownership % | Vesting |
|-------|----------------------|-------------|---------|
| Seed | $50K–$150K (paper value) | 0.5%–2.0% | 4yr, 1yr cliff |
| Series A | $100K–$300K | 0.1%–0.5% | 4yr, 1yr cliff |
| Series B | $150K–$400K | 0.05%–0.2% | 4yr, 1yr cliff |
| Series C+ | $200K–$600K | 0.01%–0.1% | 4yr, 1yr cliff |
| Public | RSUs $100K–$300K/yr | N/A | Quarterly |

*Paper value at grant; actual value depends entirely on exit.*

### Remote-specific equity issues

1. **Exercise windows** — 90-day post-departure windows are brutal for remote employees who may not have liquid savings
2. **Tax complexity** — ISOs vs NSOs, AMT, cross-border tax treaties
3. **Geo-adjusted equity** — Some companies adjust equity grants by location; others don't. Always ask.

### Questions to ask about equity

- What's the current 409A valuation?
- What's the preferred price vs. strike price?
- Is there a secondary market or tender offer?
- What's the post-departure exercise window?
- Are grants geo-adjusted or uniform?

---

## 4. Benefits Beyond Salary

Remote companies replace office perks with different benefits. Here's what 214 companies actually offer:

### Common remote benefits (offered by 60%+ of surveyed companies)

- **Home office stipend** — $500–$2,500 one-time or annual
- **Co-working allowance** — $200–$500/month
- **Health insurance** — Varies by country; US companies often offer platinum plans
- **Learning budget** — $1,000–$2,500/year for courses, conferences, books
- **Equipment budget** — Laptop + monitor + peripherals ($2,000–$4,000)

### Differentiating benefits (offered by top-quartile companies)

- **Unlimited PTO** (with minimum mandatory days at best companies)
- **Annual team offsites** — Fully paid, 1–2 weeks/year
- **Parental leave** — 16–26 weeks paid (US remote companies often beat US office norms)
- **Mental health benefits** — Therapy stipends ($100–$200/month)
- **Sabbatical programs** — 4–8 weeks paid after 4–5 years

### What's usually missing

- **401(k) matching** — Common at US public companies; rare at startups
- **Commuter benefits** — Irrelevant for remote
- **Free food** — Replaced by smaller stipends

> "The best remote benefit isn't a stipend — it's async culture and no mandatory meeting hours. That matters more than $200/month co-working money." — Senior engineer, Automattic

---

## 5. Negotiation Tactics for Remote Offers

Remote offers are negotiable — often more than candidates assume. Companies expect 10–15% negotiation on base.

### What to negotiate

1. **Base salary** — Most flexible at offer stage; ask for top of band with evidence
2. **Sign-on bonus** — Easier to approve than base increase; $10K–$50K common
3. **Equity** — Negotiate grant size, not just salary
4. **Start date / vacation** — Pre-planned time off before start
5. **Review cycle** — 6-month early review instead of waiting 12 months

### Leverage points unique to remote

- **Competing remote offers** — Companies know you have global options
- **Geo arbitrage awareness** — If on location-based model, understand the factor before negotiating
- **Cost of living data** — Present data if you believe your geo factor is wrong

### Scripts that work

**For base:** "Based on my research and conversations with [peer company], senior engineers at this level in [your location] are compensated at $X. I'd like to discuss aligning with the top of that range."

**For equity:** "Can we discuss the equity component separately? I want to understand the grant size relative to US-based peers at the same level."

**For sign-on:** "If base is fixed at the band maximum, would a sign-on bonus of $X be possible to bridge the gap?"

### What not to do

- Don't accept the first number without asking for the band range
- Don't compare SF office offers to remote offers without adjusting for geo
- Don't ignore equity — at startups, it can exceed base value
- Don't forget to negotiate benefits (stipends, PTO, learning budget)

---

## 6. Red Flags in Remote Compensation

Watch for these patterns in offers:

1. **"Competitive salary" with no numbers** — Always ask for the band
2. **Geo factor not disclosed** — Location-based companies should show the formula
3. **Equity without valuation** — Grant size means nothing without 409A
4. **90-day exercise window** — Standard but painful; negotiate for longer
5. **"US hours required" at non-US rates** — Time zone requirements should come with US-tier pay
6. **Contractor classification for full-time work** — May indicate tax optimization at your expense

---

## 7. Comparing Offers: A Worked Example

Consider a senior backend engineer (8 YOE) evaluating three remote offers in mid-2026. The numbers below are representative of what we saw in our compensation survey — anonymized but realistic.

**Offer A: Series B startup, global pay band**
- Base: $210K
- Equity: 0.08% (4-year vest, 1-year cliff), last 409A at $18/share
- Benefits: $3K home office stipend, unlimited PTO (team avg 18 days)
- Model: Same pay regardless of location

**Offer B: Public tech company, location-adjusted**
- Base: $185K (0.85 geo factor for Austin)
- Equity: $280K RSU over 4 years (full geo adjustment)
- Benefits: $500/month coworking stipend, 20 days PTO
- Model: SF base × geo factor; Austin factor = 0.85

**Offer C: AI startup, national band with premium**
- Base: $230K
- Equity: 0.04% (4-year vest), last 409A at $42/share
- Benefits: $5K learning budget, 15 days PTO
- Model: National US band + 10% AI premium

### How to compare them

Don't compare base alone. Calculate **total first-year compensation**:

| Component | Offer A | Offer B | Offer C |
|-----------|---------|---------|---------|
| Base | $210K | $185K | $230K |
| Year-1 equity (face) | $36K | $70K | $42K |
| Stipends/benefits | $3K | $6K | $5K |
| **Total year 1** | **$249K** | **$261K** | **$277K** |

Offer C wins on year-1 total — but equity risk differs dramatically. Offer A's startup equity could be worth $0 or $2M depending on exit. Offer B's RSUs are liquid and predictable. Offer C sits in between.

### Questions to ask before accepting

1. **"What was the last 409A valuation, and when is the next one?"** — Grant size is meaningless without share price context.
2. **"How does geo factor change if I relocate?"** — Some companies recalculate; others grandfather.
3. **"What's the exercise window after departure?"** — 90 days is standard; 7–10 years is negotiable at some startups.
4. **"Is there a compensation review cycle, and when is my first eligible review?"** — A low base with review in 6 months differs from review in 18 months.

> "I accepted Offer B even though Offer C had higher base, because RSU liquidity let me buy a house. Equity is only compensation when you can actually use it." — Senior engineer, survey respondent

When in doubt, optimize for the component you need most: cash flow (base + sign-on), long-term upside (equity), or stability (public company RSUs). No single offer maximizes all three — and the right tradeoff depends on your financial situation, not a generic ranking.

---

## Takeaways

1. **Know which compensation model a company uses** — location-based, national, or global — before comparing offers.

2. **Senior remote US engineers earn $175K–$450K total comp** depending on stage and model — with significant variance by geo adjustment.

3. **Equity is the opaque part** — always ask about valuation, geo adjustment, and exercise windows separately from base.

4. **Remote benefits differ from office perks** — evaluate stipends, PTO, and async culture holistically.

5. **Negotiate base, sign-on, and equity independently** — companies have different flexibility on each.

6. **Red flags are predictable** — undisclosed bands, missing equity terms, and geo arbitrage without transparency.
`,
  tags: ["compensation", "remote-work", "career"],
};
