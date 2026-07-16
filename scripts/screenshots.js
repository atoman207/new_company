const { chromium } = require("playwright");
const path = require("path");

const BASE = "http://localhost:3000";
const OUT = process.argv[2] || __dirname;

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(`${BASE}/`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUT, "home.png"), fullPage: false });

  const first = await page.locator('a[href^="/stores/"]').nth(6).getAttribute("href");
  await page.goto(`${BASE}${first}`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUT, "store-detail.png"), fullPage: false });

  await page.goto(`${BASE}/ranking`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUT, "ranking.png"), fullPage: false });

  // 管理画面
  await page.goto(`${BASE}/login`);
  await page.fill("#email", "admin@example.com");
  await page.fill("#password", "admin1234");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/admin`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(OUT, "admin.png"), fullPage: false });

  // モバイル
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto(`${BASE}/`);
  await mobile.waitForLoadState("networkidle");
  await mobile.screenshot({ path: path.join(OUT, "mobile-home.png"), fullPage: false });

  await browser.close();
  console.log("screenshots saved to " + OUT);
}

run().catch((e) => { console.error(e); process.exit(1); });
