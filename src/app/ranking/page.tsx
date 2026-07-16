import type { Metadata } from "next";
import Link from "next/link";
import { fetchStoresWithRating, sortStores, getCategories } from "@/lib/stores";
import RatingStars from "@/components/RatingStars";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "人気ランキング",
  description:
    "口コミ評価をもとにした人気店舗ランキングです。カテゴリ別のランキングもチェックできます。",
};

type SearchParams = Promise<{ category?: string }>;

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-slate-400 text-white",
  3: "bg-orange-700 text-white",
};

export default async function RankingPage(props: {
  searchParams: SearchParams;
}) {
  const { category: categorySlug = "" } = await props.searchParams;

  const [categories, allStores] = await Promise.all([
    getCategories(),
    fetchStoresWithRating(
      categorySlug ? { category: { slug: categorySlug } } : {}
    ),
  ]);

  const ranked = sortStores(
    allStores.filter((s) => s.reviewCount > 0),
    "rating"
  ).slice(0, 20);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="text-xs text-slate-500" aria-label="パンくずリスト">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-700">ランキング</span>
      </nav>

      <h1 className="mt-3 text-2xl font-bold text-slate-900">
        🏆 {activeCategory ? `${activeCategory.name}` : "総合"}人気ランキング
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        口コミ評価をもとにした人気のお店ランキングです。
      </p>

      {/* カテゴリタブ */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/ranking"
          className={
            !categorySlug
              ? "rounded-full bg-orange-600 px-4 py-1.5 text-sm font-bold text-white"
              : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          }
        >
          総合
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/ranking?category=${c.slug}`}
            className={
              categorySlug === c.slug
                ? "rounded-full bg-orange-600 px-4 py-1.5 text-sm font-bold text-white"
                : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            }
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* ランキングリスト */}
      <div className="mt-6 space-y-4">
        {ranked.map((store, i) => {
          const rank = i + 1;
          return (
            <Link
              key={store.id}
              href={`/stores/${store.id}`}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-bold ${
                    RANK_STYLES[rank] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {rank}
                </span>
              </div>
              <div className="hidden h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.images[0] ?? "/images/stores/placeholder.svg"}
                  alt={store.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700">
                    {store.categoryName}
                  </span>
                  <span className="text-slate-500">{store.area}</span>
                </div>
                <h2 className="mt-1 text-base font-bold text-slate-900">
                  {store.name}
                </h2>
                <div className="mt-1 flex items-center gap-1.5">
                  <RatingStars rating={store.avgRating} size="sm" />
                  <span className="text-sm font-bold text-orange-600">
                    {store.avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    （{store.reviewCount}件）
                  </span>
                </div>
                <p className="mt-1 hidden text-sm text-slate-600 sm:block">
                  {truncate(store.description, 70)}
                </p>
              </div>
            </Link>
          );
        })}

        {ranked.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <p className="text-sm text-slate-500">
              まだ口コミのある店舗がありません。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
