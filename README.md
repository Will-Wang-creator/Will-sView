# Will'sView

A premium membership platform for engineering intelligence — inspired by [The Pragmatic Engineer](https://www.pragmaticengineer.com/), designed with Apple-style aesthetics.

Built for global audiences with subscription paywalls, member-only content, and integrations for modern tooling.

## Features

- **Apple-inspired design** — Clean typography, generous whitespace, subtle animations
- **Premium paywall** — Free previews with full content locked behind subscription
- **Subscription checkout** — Monthly ($12) and annual ($120) plans
- **Member dashboard** — Access to premium articles, Slack community, Coda templates
- **Analytics ready** — Google Analytics 4 and Cloudflare Web Analytics integration
- **Global-ready** — English-first, responsive, accessible

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Database | SQLite (sql.js) |
| Auth | JWT sessions (bcrypt + jose) |
| Animation | Framer Motion |
| Hosting | Cloudflare Pages / Vercel |
| Analytics | Google Analytics, Cloudflare Insights |
| Content workflow | Inspired by Substack, Coda, Linear |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| Email | Password | Access |
|-------|----------|--------|
| `demo@example.com` | `demo1234` | Full member (premium content) |
| `free@example.com` | `demo1234` | Free user (paywall on premium) |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, features, testimonials, pricing |
| `/articles` | Article listing |
| `/articles/[slug]` | Article detail with paywall |
| `/pricing` | Subscription plans |
| `/login` | Sign in / register |
| `/members` | Member dashboard and benefits |
| `/subscribe/success` | Post-checkout confirmation |

## Analytics Setup

### Google Analytics 4

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### Cloudflare Web Analytics

1. Add your site in Cloudflare dashboard → Analytics → Web Analytics
2. Set `NEXT_PUBLIC_CF_BEACON_TOKEN=your-token`

## Deployment

### Cloudflare Pages

```bash
npm run build
# Deploy .next output via Cloudflare Pages adapter
```

### Vercel

```bash
npx vercel
```

Set all environment variables in your deployment platform.

## Weekly Articles

Every **Monday at 09:00 (UTC+8)**, GitHub Actions runs `weekly-article.yml` to:

1. Fetch trending tech/engineering news (Hacker News + Google News)
2. Generate a long-form analysis article (OpenAI if `OPENAI_API_KEY` is set)
3. Register the article, sync translations (8 languages), and verify `npm run build`
4. Open a pull request for human review before merge/deploy

**Setup:** Add `OPENAI_API_KEY` as a GitHub repository secret (optional — fallback template used without it).

**Local commands:**

```bash
npm run articles:weekly              # generate from latest news
npm run articles:weekly -- --dry-run   # preview topic only
npm run articles:sync-index            # rebuild index.ts from article files
npm run articles:translate             # re-translate all locale files
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # Auth, checkout
│   ├── articles/         # Article listing & detail
│   ├── login/            # Authentication
│   ├── members/          # Member dashboard
│   └── pricing/          # Subscription plans
├── components/           # UI components
├── lib/
│   ├── auth.ts           # Session management
│   ├── db/               # SQLite database
│   └── data/             # Articles, pricing, testimonials
```

## License

MIT
