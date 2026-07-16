// 全機能E2E検証スクリプト（Playwright / Chromium）
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3000";
const results = [];

function ok(name) {
  results.push({ name, ok: true });
  console.log(`  PASS  ${name}`);
}
function fail(name, err) {
  results.push({ name, ok: false, err: String(err) });
  console.log(`  FAIL  ${name}: ${err}`);
}

async function run() {
  // アップロードテスト用の1x1 PNGを作成
  const pngPath = path.join(__dirname, "test-upload.png");
  fs.writeFileSync(
    pngPath,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    )
  );

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept());

  const uniq = Date.now().toString(36);
  const testUser = {
    name: `テスト花子${uniq}`,
    email: `e2e-${uniq}@example.com`,
    password: "testpass1234",
  };

  // ---------- 1. 新規会員登録 ----------
  try {
    await page.goto(`${BASE}/register`);
    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.fill("#passwordConfirm", testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/`);
    await page.locator("header").getByText(`${testUser.name} さん`).waitFor();
    ok("新規会員登録 → 自動ログイン → ヘッダーに名前表示");
  } catch (e) { fail("新規会員登録", e); }

  // ---------- 2. 重複メール登録はエラー ----------
  try {
    await page.goto(`${BASE}/mypage`); // ログイン中なのでマイページが見える
    await page.locator("h1").getByText("マイページ").waitFor();
    ok("ログイン状態でマイページ表示");
  } catch (e) { fail("マイページ表示", e); }

  // ---------- 3. 店舗検索 → 詳細ページ ----------
  let storeUrl = "";
  try {
    await page.goto(`${BASE}/stores?q=味噌`);
    const card = page.locator('a[href^="/stores/"]', { hasText: "麺屋 白樺" }).first();
    await card.waitFor();
    await card.click();
    await page.waitForURL(/\/stores\/[a-z0-9]+/);
    storeUrl = page.url();
    await page.locator("h1", { hasText: "麺屋 白樺" }).waitFor();
    ok("キーワード検索 → 店舗詳細ページ表示");
  } catch (e) { fail("店舗検索→詳細", e); }

  // ---------- 4. 口コミ投稿 ----------
  try {
    await page.locator('button[aria-label="星4つ"]').click();
    await page.fill("#review-title", "E2Eテストの口コミです");
    await page.fill("#review-body", "自動テストから投稿された口コミです。スープが濃厚でとても美味しかったです。");
    await page.getByRole("button", { name: "口コミを投稿する" }).click();
    // 投稿後はrevalidateにより「投稿済み」表示に切り替わる
    await page
      .getByText("口コミを投稿しました")
      .or(page.getByText("この店舗には口コミを投稿済みです"))
      .first()
      .waitFor();
    await page.reload();
    await page.getByText("E2Eテストの口コミです").first().waitFor();
    ok("口コミ投稿 → 一覧に反映");
  } catch (e) { fail("口コミ投稿", e); }

  // ---------- 5. 重複口コミは投稿済み表示 ----------
  try {
    await page.getByText("この店舗には口コミを投稿済みです").waitFor();
    ok("同一店舗への重複口コミ防止（投稿済み表示）");
  } catch (e) { fail("重複口コミ防止", e); }

  // ---------- 6. コメント投稿 ----------
  try {
    await page.getByRole("button", { name: "コメントする" }).first().click();
    await page.fill('textarea[name="body"]', "E2Eテストからのコメントです。参考になりました！");
    await page.getByRole("button", { name: "コメントを送信" }).click();
    await page.getByText("E2Eテストからのコメントです").first().waitFor();
    ok("口コミへのコメント投稿 → 表示");
  } catch (e) { fail("コメント投稿", e); }

  // ---------- 7. お気に入り登録 ----------
  try {
    await page.getByRole("button", { name: "お気に入りに追加" }).click();
    // 楽観的UIで即座に表示が切り替わるため、ボタンが再度有効化される（＝サーバー処理完了）まで待つ
    await page
      .locator('button:not([disabled])', { hasText: "お気に入り登録済み" })
      .waitFor();
    await page.goto(`${BASE}/mypage/favorites`);
    await page.getByText("麺屋 白樺").first().waitFor();
    ok("お気に入り登録 → マイページのお気に入り一覧に表示");
  } catch (e) { fail("お気に入り登録", e); }

  // ---------- 8. お気に入り解除 ----------
  try {
    await page.goto(storeUrl);
    await page.getByRole("button", { name: "お気に入り登録済み" }).click();
    await page.getByRole("button", { name: "お気に入りに追加" }).waitFor();
    ok("お気に入り解除");
  } catch (e) { fail("お気に入り解除", e); }

  // ---------- 9. マイページの口コミ一覧・削除 ----------
  try {
    await page.goto(`${BASE}/mypage/reviews`);
    await page.getByText("E2Eテストの口コミです").waitFor();
    await page.getByRole("button", { name: "削除" }).first().click();
    await page.getByText("まだ口コミを投稿していません").waitFor();
    ok("マイページで自分の口コミ表示 → 削除");
  } catch (e) { fail("自分の口コミ削除", e); }

  // ---------- 10. ログアウト ----------
  try {
    await page.goto(`${BASE}/`);
    await page.locator("header").getByRole("button", { name: "ログアウト" }).click();
    await page.locator("header").getByText("ログイン").first().waitFor();
    ok("ログアウト → ヘッダーがゲスト表示に");
  } catch (e) { fail("ログアウト", e); }

  // ---------- 11. 誤ったパスワードでログイン失敗 ----------
  try {
    await page.goto(`${BASE}/login`);
    await page.fill("#email", "taro@example.com");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');
    await page.getByText("メールアドレスまたはパスワードが正しくありません").waitFor();
    ok("誤ったパスワードでログイン拒否");
  } catch (e) { fail("ログイン失敗表示", e); }

  // ---------- 12. 一般ユーザーは管理画面に入れない ----------
  try {
    await page.fill("#email", "taro@example.com");
    await page.fill("#password", "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/`);
    await page.goto(`${BASE}/admin`);
    await page.waitForURL(`${BASE}/`); // requireAdminで / にリダイレクト
    ok("一般ユーザーの管理画面アクセスをブロック");
    await page.locator("header").getByRole("button", { name: "ログアウト" }).click();
    await page.locator("header").getByText("新規登録").first().waitFor();
  } catch (e) { fail("一般ユーザー管理画面ブロック", e); }

  // ---------- 13. 管理者ログイン → ダッシュボード ----------
  try {
    await page.goto(`${BASE}/login`);
    await page.fill("#email", "admin@example.com");
    await page.fill("#password", "admin1234");
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/`);
    await page.goto(`${BASE}/admin`);
    await page.locator("h1", { hasText: "ダッシュボード" }).waitFor();
    await page.getByText("登録店舗数").waitFor();
    ok("管理者ログイン → ダッシュボード表示");
  } catch (e) { fail("管理者ダッシュボード", e); }

  // ---------- 14. 店舗新規登録（画像アップロード付き） ----------
  const testStoreName = `E2Eテスト食堂${uniq}`;
  try {
    await page.goto(`${BASE}/admin/stores/new`);
    await page.fill("#name", testStoreName);
    await page.selectOption("#categoryId", { label: "グルメ" });
    await page.selectOption("#area", "東京・渋谷");
    await page.fill("#description", "E2Eテストで登録された店舗です。自動テスト用のダミーデータです。");
    await page.fill("#address", "東京都渋谷区テスト町1-2-3");
    await page.fill("#phone", "03-0000-0000");
    await page.setInputFiles('input[type="file"]', pngPath);
    await page.locator('img[src^="/api/uploads/"]').first().waitFor();
    ok("画像アップロード → プレビュー表示");
    await page.getByRole("button", { name: "店舗を登録" }).click();
    await page.waitForURL(`${BASE}/admin/stores`);
    await page.getByText(testStoreName).waitFor();
    ok("店舗の新規登録 → 管理一覧に表示");
  } catch (e) { fail("店舗新規登録", e); }

  // ---------- 15. 公開ページでアップロード画像を確認 ----------
  try {
    await page.locator(`a:has-text("${testStoreName}")`).first().click();
    await page.waitForURL(/\/stores\/[a-z0-9]+/);
    const imgSrc = await page
      .locator('img[src^="/api/uploads/"]')
      .first()
      .getAttribute("src");
    const res = await page.request.get(`${BASE}${imgSrc}`);
    if (res.status() !== 200) throw new Error(`upload image status ${res.status()}`);
    ok("公開詳細ページでアップロード画像が配信される");
  } catch (e) { fail("アップロード画像配信", e); }

  // ---------- 16. 店舗編集 ----------
  try {
    await page.goto(`${BASE}/admin/stores`);
    const row = page.locator("tr", { hasText: testStoreName });
    await row.getByRole("link", { name: "編集" }).click();
    await page.waitForURL(/\/admin\/stores\/.+\/edit/);
    await page.fill("#budget", "2,000円〜3,000円");
    await page.getByRole("button", { name: "変更を保存" }).click();
    await page.waitForURL(`${BASE}/admin/stores`);
    ok("店舗情報の編集 → 保存");
  } catch (e) { fail("店舗編集", e); }

  // ---------- 17. 口コミ管理 ----------
  try {
    await page.goto(`${BASE}/admin/reviews`);
    await page.locator("h1", { hasText: "口コミ管理" }).waitFor();
    const countText = await page.locator("p", { hasText: "件の口コミ" }).textContent();
    ok(`口コミ管理ページ表示（${countText.trim()}）`);
  } catch (e) { fail("口コミ管理", e); }

  // ---------- 18. ユーザー管理 ----------
  try {
    await page.goto(`${BASE}/admin/users`);
    await page.getByText(testUser.name).waitFor();
    ok("ユーザー管理ページにE2E登録ユーザーが表示");
  } catch (e) { fail("ユーザー管理", e); }

  // ---------- 19. カテゴリ管理 ----------
  try {
    await page.goto(`${BASE}/admin/categories`);
    await page.fill('input[name="name"]', `テストカテゴリ${uniq}`);
    await page.fill('input[name="slug"]', `test-${uniq}`);
    await page.getByRole("button", { name: "追加" }).click();
    await page.getByText("カテゴリを追加しました").waitFor();
    const row = page.locator("tr", { hasText: `テストカテゴリ${uniq}` });
    await row.getByRole("button", { name: "削除" }).click();
    await row.waitFor({ state: "detached" });
    ok("カテゴリ追加 → 削除");
  } catch (e) { fail("カテゴリ管理", e); }

  // ---------- 20. テスト店舗の削除 ----------
  try {
    await page.goto(`${BASE}/admin/stores`);
    const row = page.locator("tr", { hasText: testStoreName });
    await row.getByRole("button", { name: "削除" }).click();
    await row.waitFor({ state: "detached" });
    ok("店舗の削除");
  } catch (e) { fail("店舗削除", e); }

  // ---------- 21. E2Eユーザーの削除（管理者から） ----------
  try {
    await page.goto(`${BASE}/admin/users`);
    const row = page.locator("tr", { hasText: testUser.name });
    await row.getByRole("button", { name: "削除" }).click();
    await row.waitFor({ state: "detached" });
    ok("ユーザーの削除（管理者）");
  } catch (e) { fail("ユーザー削除", e); }

  // ---------- 22. モバイル表示（レスポンシブ） ----------
  try {
    const mobile = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const mpage = await mobile.newPage();
    await mpage.goto(`${BASE}/`);
    await mpage.locator('button[aria-label="メニューを開く"]').click();
    // モバイルメニュー内の（表示されている）リンクをクリック
    await mpage.locator('a[href="/ranking"]:visible').first().waitFor();
    await mpage.locator('a[href="/ranking"]:visible').first().click();
    await mpage.waitForURL(`${BASE}/ranking`);
    ok("モバイル表示：ハンバーガーメニュー → ナビゲーション");
    await mobile.close();
  } catch (e) { fail("モバイル表示", e); }

  await browser.close();
  fs.unlinkSync(pngPath);

  const passed = results.filter((r) => r.ok).length;
  console.log("");
  console.log(`結果: ${passed}/${results.length} 件成功`);
  if (passed !== results.length) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
