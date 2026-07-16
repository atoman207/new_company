# マチナビ — 店舗情報ポータルサイト

店舗情報・口コミ・ランキング・検索機能を備えたポータルサイトです。
Next.js（App Router）+ PostgreSQL + Prisma で構築されています。

## 主な機能

| 機能 | 説明 |
|---|---|
| 会員登録・ログイン | メールアドレス＋パスワード認証（bcryptハッシュ化、JWTセッションCookie） |
| 店舗一覧・詳細ページ | カテゴリ・エリア・画像ギャラリー・店舗情報テーブル |
| 検索・絞り込み | キーワード／カテゴリ／エリアの複合検索、並び替え（評価順・口コミ数順・新着順）、ページネーション |
| 口コミ投稿 | 星1〜5の評価＋タイトル＋本文。1店舗につき1人1件。本人・管理者は削除可能 |
| コメント | 各口コミへの返信コメント投稿・削除 |
| お気に入り | 店舗のお気に入り登録／解除（ワンクリック・楽観的UI） |
| マイページ | プロフィール、投稿した口コミ一覧、お気に入り一覧 |
| 管理者ダッシュボード | 統計サマリー、店舗CRUD、口コミ管理、ユーザー管理（権限変更・削除）、カテゴリ管理 |
| 画像アップロード | 店舗画像の複数アップロード（JPG/PNG/WebP/GIF、5MBまで） |
| レスポンシブ対応 | モバイル〜デスクトップまで対応（ハンバーガーメニュー等） |
| SEO対策 | ページ別メタデータ、OGP、sitemap.xml、robots.txt、JSON-LD（LocalBusiness／AggregateRating）、パンくずリスト |

## 技術スタック

- **フレームワーク**: Next.js 16（App Router / Server Components / Server Actions）
- **データベース**: PostgreSQL 17
- **ORM**: Prisma 6
- **スタイリング**: Tailwind CSS 4
- **認証**: 自前実装（bcryptjs + jose JWT / httpOnly Cookie）
- **E2Eテスト**: Playwright

## セットアップ手順

### 1. 前提条件

- Node.js 20以上
- PostgreSQL（ローカルで起動していること）

### 2. データベースの作成

```sql
CREATE DATABASE machinavi;
```

### 3. 環境変数

`.env` をプロジェクトルートに作成します（サンプル値）:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/machinavi?schema=public"
SESSION_SECRET="ランダムな長い文字列に変更してください"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. インストール〜起動

```bash
npm install
npx prisma migrate dev   # テーブル作成
npm run db:seed          # サンプルデータ投入
npm run dev              # 開発サーバー起動 → http://localhost:3000
```

本番ビルドの場合:

```bash
npm run build
npm start
```

## テストアカウント（シードデータ）

| 役割 | メールアドレス | パスワード |
|---|---|---|
| 管理者 | admin@example.com | admin1234 |
| 一般会員 | taro@example.com | password123 |
| 一般会員 | hanako@example.com | password123 |

シードデータには 6カテゴリ・15店舗・35件の口コミ・コメント・お気に入りが含まれます。

## E2Eテスト

サーバー起動中に以下を実行すると、全23項目（登録→口コミ→お気に入り→管理画面CRUD→画像アップロード→モバイル表示）を自動検証します。

```bash
node scripts/e2e-test.js
```

## ディレクトリ構成

```
prisma/
  schema.prisma        # DBスキーマ（User/Category/Store/Review/Comment/Favorite）
  seed.js              # サンプルデータ投入
public/images/stores/  # 店舗プレースホルダー画像（SVG）
uploads/               # 管理画面からアップロードされた画像（/api/uploads/* で配信）
src/
  app/                 # ページ（App Router）
    stores/            # 店舗一覧・詳細
    ranking/           # ランキング
    login, register/   # 認証
    mypage/            # マイページ（口コミ・お気に入り）
    admin/             # 管理画面（店舗・口コミ・ユーザー・カテゴリ）
    api/upload/        # 画像アップロードAPI
    api/uploads/[name]/# アップロード画像の配信API
    sitemap.ts         # sitemap.xml
    robots.ts          # robots.txt
  components/          # UIコンポーネント
  lib/
    actions/           # Server Actions（認証・口コミ・お気に入り・管理）
    auth.ts            # セッション管理
    prisma.ts          # Prismaクライアント
scripts/
  e2e-test.js          # E2E検証スクリプト
  generate-placeholders.js  # プレースホルダーSVG生成
```

## 備考

- 画像は `uploads/` ディレクトリに保存され、`/api/uploads/<ファイル名>` 経由で配信されます（本番ビルド後の追加アップロードにも対応）。
- 店舗のサンプル画像はSVGプレースホルダー（カテゴリ別のイメージ画像）です。実運用時は管理画面から実際の写真をアップロードして差し替えられます。
- 管理画面（/admin）・マイページ（/mypage）は未ログイン時に自動でログインページへリダイレクトされます。
