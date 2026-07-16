import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fetchStoresWithRating, sortStores, getCategories } from "@/lib/stores";
import { formatDate, truncate } from "@/lib/utils";
import SearchForm from "@/components/SearchForm";
import StoreCard from "@/components/StoreCard";
import RatingStars from "@/components/RatingStars";
import { CATEGORY_EMOJI } from "@/lib/category-emoji";

export default async function HomePage() {
  const [categories, stores, recentReviews] = await Promise.all([
    getCategories(),
    fetchStoresWithRating(),
    prisma.review.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        store: { select: { id: true, name: true, published: true } },
      },
      where: { store: { published: true } },
    }),
  ]);

  const topRated = sortStores(
    stores.filter((s) => s.reviewCount > 0),
    "rating"
  ).slice(0, 6);
  const newest = sortStores(stores, "new").slice(0, 6);

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="text-center text-3xl font-bold leading-snug text-white sm:text-4xl">
            あなたの街の「行きつけ」が
            <br className="sm:hidden" />
            きっと見つかる
          </h1>
          <p className="mt-4 text-center text-sm text-orange-50 sm:text-base">
            口コミ・ランキング・詳細検索で、ぴったりのお店を探せる店舗情報ポータル
          </p>
          <div className="mx-auto mt-8 max-w-3xl">
            <SearchForm categories={categories} variant="hero" />
          </div>
        </div>
      </section>

      {/* カテゴリから探す */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold text-slate-900">カテゴリから探す</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/stores?category=${c.slug}`}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow"
            >
              <span className="text-3xl">
                {CATEGORY_EMOJI[c.slug] ?? "🏬"}
              </span>
              <span className="text-sm font-bold text-slate-800">{c.name}</span>
              <span className="text-xs text-slate-500">
                {c._count.stores}件
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 人気ランキング */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              🏆 人気ランキング
            </h2>
            <Link
              href="/ranking"
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              ランキングをもっと見る →
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((store, i) => (
              <StoreCard key={store.id} store={store} rank={i + 1} />
            ))}
          </div>
          {topRated.length === 0 && (
            <p className="mt-5 text-sm text-slate-500">
              まだ口コミのある店舗がありません。
            </p>
          )}
        </div>
      </section>

      {/* 新着店舗 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900">🆕 新着店舗</h2>
          <Link
            href="/stores?sort=new"
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            すべて見る →
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {newest.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* 新着口コミ */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-slate-900">💬 新着の口コミ</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {recentReviews.map((review) => (
              <Link
                key={review.id}
                href={`/stores/${review.store.id}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-700">
                    {review.store.name}
                  </span>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {review.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {truncate(review.body, 80)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {review.user.name} さん・{formatDate(review.createdAt)}
                </p>
              </Link>
            ))}
          </div>
          {recentReviews.length === 0 && (
            <p className="mt-5 text-sm text-slate-500">
              まだ口コミがありません。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
