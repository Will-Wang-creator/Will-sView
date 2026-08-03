const TECH_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "software",
  "engineering",
  "developer",
  "startup",
  "cloud",
  "open source",
  "programming",
  "tech",
  "machine learning",
  "llm",
  "infrastructure",
  "security",
  "cyber",
  "data",
  "api",
  "github",
  "google",
  "microsoft",
  "meta",
  "amazon",
  "apple",
  "nvidia",
  "openai",
  "anthropic",
  "hiring",
  "layoff",
  "ipo",
  "funding",
  "saas",
  "devops",
  "kubernetes",
  "database",
  "typescript",
  "python",
  "rust",
  "javascript",
];

const SKIP_PATTERNS =
  /harassment|lawsuit|payout|murder|crime|celebrity|sports|recipe|horoscope|weather|election/i;

function isEngineeringRelevant(title) {
  if (SKIP_PATTERNS.test(title)) return false;
  return scoreTitle(title) >= 2;
}

function scoreTitle(title) {
  const lower = title.toLowerCase();
  let score = 0;
  for (const kw of TECH_KEYWORDS) {
    if (lower.includes(kw)) score += 2;
  }
  if (lower.length > 20 && lower.length < 120) score += 1;
  return score;
}

function tokenSet(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
}

function overlapScore(a, b) {
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  let shared = 0;
  for (const t of ta) {
    if (tb.has(t)) shared++;
  }
  return shared / Math.max(ta.size, tb.size, 1);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "WillsView-Weekly-Article/1.0" },
  });
  if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "WillsView-Weekly-Article/1.0" },
  });
  if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
  return res.text();
}

async function fetchHackerNewsStories(limit = 40) {
  const ids = await fetchJson("https://hacker-news.firebaseio.com/v0/topstories.json");
  const stories = [];

  for (const id of ids.slice(0, limit)) {
    try {
      const item = await fetchJson(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      if (!item?.title || item.type !== "story") continue;
      stories.push({
        source: "Hacker News",
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        score: (item.score ?? 0) + scoreTitle(item.title) * 5,
        hnScore: item.score ?? 0,
        publishedAt: item.time ? new Date(item.time * 1000).toISOString() : null,
      });
    } catch {
      // skip failed items
    }
  }

  return stories;
}

function parseRssItems(xml, source) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const block of blocks) {
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const link = block.match(/<link>(.*?)<\/link>/i);
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/i);
    const rawTitle = (title?.[1] || title?.[2] || "").trim();
    if (!rawTitle) continue;

    items.push({
      source,
      title: rawTitle.replace(/&amp;/g, "&").replace(/&quot;/g, '"'),
      url: (link?.[1] || "").trim(),
      score: scoreTitle(rawTitle) * 8,
      hnScore: 0,
      publishedAt: pubDate?.[1] ? new Date(pubDate[1]).toISOString() : null,
    });
  }

  return items;
}

async function fetchGoogleNewsTech() {
  const url =
    "https://news.google.com/rss/search?q=technology+software+engineering+AI&hl=en-US&gl=US&ceid=US:en";
  const xml = await fetchText(url);
  return parseRssItems(xml, "Google News");
}

export async function fetchNewsCandidates() {
  const [hn, google] = await Promise.all([
    fetchHackerNewsStories(50),
    fetchGoogleNewsTech().catch(() => []),
  ]);

  const merged = [...hn, ...google];
  const seen = new Set();

  return merged
    .filter((item) => {
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return isEngineeringRelevant(item.title);
    })
    .sort((a, b) => b.score - a.score);
}

export function pickBestTopic(candidates, existingArticles) {
  const existingTitles = existingArticles.map((a) => a.title);

  for (const candidate of candidates) {
    const tooSimilar = existingTitles.some(
      (title) => overlapScore(title, candidate.title) > 0.45
    );
    if (!tooSimilar) return candidate;
  }

  return candidates[0] ?? null;
}

export function buildSlugFromTopic(title, dateISO) {
  const suffix = `-${dateISO}`;
  const maxBase = Math.max(20, 80 - suffix.length);
  const base = slugify(title).slice(0, maxBase).replace(/-+$/, "");
  return `${base}${suffix}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

export function inferCategory(title) {
  const lower = title.toLowerCase();
  if (/hire|hiring|layoff|compensation|career|job/.test(lower)) return "Career";
  if (/culture|team|org|management|leadership/.test(lower)) return "Engineering Culture";
  if (/security|breach|vulnerability|cyber/.test(lower)) return "Best Practices";
  if (/infrastructure|cloud|kubernetes|database|devops/.test(lower)) return "Industry";
  if (/ai|llm|agent|model|openai|anthropic|gemini/.test(lower)) return "Trends";
  return "Trends";
}

export function inferTags(title, category) {
  const tags = new Set(["weekly", "news"]);
  if (category) tags.add(category.toLowerCase().replace(/\s+/g, "-"));
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 4);
  for (const w of words) tags.add(w);
  return [...tags].slice(0, 6);
}
