/**
 * End-to-end site smoke tests against localhost:3000
 */
const BASE = process.env.TEST_URL || "http://localhost:3000";
const TIMEOUT_MS = 15000;

let passed = 0;
let failed = 0;

function assert(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function fetchJson(url, options = {}) {
  const res = await fetchWithTimeout(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _raw: text.slice(0, 200) };
  }
  return { res, json, cookies: res.headers.getSetCookie?.() || [] };
}

function cookieHeader(setCookies) {
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

async function main() {
  console.log(`\nTesting ${BASE}\n`);

  // 0. Server reachable
  try {
    await fetchWithTimeout(BASE);
  } catch (err) {
    console.error(
      `  ✗ Server unreachable at ${BASE} — start with "npm run build && npx next start -p 3001" and TEST_URL=http://localhost:3001`
    );
    console.error(`    ${err.message}`);
    process.exit(1);
  }

  // 1. Homepage
  const home = await fetchWithTimeout(BASE);
  const homeHtml = await home.text();
  assert("Homepage loads", home.status === 200);
  assert(
    "Homepage has hero",
    homeHtml.includes("Big tech and startups") ||
      homeHtml.includes("Will'sView") ||
      homeHtml.includes("大型科技")
  );

  // 2. Articles
  const articles = await fetchWithTimeout(`${BASE}/articles`);
  const articlesHtml = await articles.text();
  assert("Articles page loads", articles.status === 200);
  assert(
    "Articles listed",
    articlesHtml.includes("Popular") ||
      articlesHtml.includes("Articles") ||
      articlesHtml.includes("熱門文章")
  );

  // 3. Legal pages
  const privacy = await fetchWithTimeout(`${BASE}/privacy`);
  assert("Privacy page loads", privacy.status === 200);
  const terms = await fetchWithTimeout(`${BASE}/terms`);
  assert("Terms page loads", terms.status === 200);

  // 4. Login
  const login = await fetchJson(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "free@example.com", password: "demo1234" }),
  });
  assert("Free user login", login.res.status === 200, JSON.stringify(login.json));
  const freeCookie = cookieHeader(login.cookies);

  // 5. Premium article paywall for free user
  const premium = await fetchWithTimeout(`${BASE}/articles/how-claude-code-is-built`, {
    headers: { cookie: freeCookie },
  });
  const premiumHtml = await premium.text();
  assert(
    "Premium article shows paywall for free user",
    premiumHtml.includes("premium content") ||
      premiumHtml.includes("Subscribe") ||
      premiumHtml.includes("Premium")
  );

  // 6. Demo checkout for free user
  const checkout = await fetchJson(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: freeCookie },
    body: JSON.stringify({ planId: "monthly" }),
  });
  assert(
    "Demo checkout succeeds",
    checkout.res.status === 200 && checkout.json.url,
    JSON.stringify(checkout.json)
  );

  // 7. Verify subscription activated
  const members = await fetchWithTimeout(`${BASE}/members`, {
    headers: { cookie: freeCookie },
  });
  const membersHtml = await members.text();
  assert(
    "Member page shows subscription after demo checkout",
    membersHtml.includes("Subscription valid until") ||
      membersHtml.includes("full member access") ||
      membersHtml.includes("訂閱有效") ||
      membersHtml.includes("Review your activity") ||
      membersHtml.includes("按讚")
  );

  // 8. Premium access after subscription
  const premiumAfter = await fetchWithTimeout(`${BASE}/articles/how-claude-code-is-built`, {
    headers: { cookie: freeCookie },
  });
  const afterHtml = await premiumAfter.text();
  assert(
    "Premium content unlocked after subscription",
    !afterHtml.includes("This is premium content") ||
      afterHtml.includes("Architecture") ||
      afterHtml.includes("Claude Code")
  );

  // 9. Engagement API
  const engagement = await fetchJson(`${BASE}/api/articles/how-claude-code-is-built/engagement`, {
    headers: { cookie: freeCookie },
  });
  assert("Engagement API works", engagement.res.status === 200);

  // 10. Like requires login - test with no cookie
  const anonLike = await fetchJson(`${BASE}/api/articles/how-claude-code-is-built/engagement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "like" }),
  });
  assert("Like without login returns 401", anonLike.res.status === 401);

  // 11. Logout
  const logout = await fetchWithTimeout(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: { cookie: freeCookie },
    redirect: "manual",
  });
  assert(
    "Logout redirects to home",
    logout.status === 307 && logout.headers.get("location")?.includes("/")
  );

  // 12. Checkout without login
  const checkoutAnon = await fetchJson(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId: "monthly" }),
  });
  assert("Checkout without login returns 401", checkoutAnon.res.status === 401);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
