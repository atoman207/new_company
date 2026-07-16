import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, truncate } from "@/lib/utils";
import RatingStars from "@/components/RatingStars";

export default async function AdminDashboardPage() {
  const [storeCount, publishedCount, userCount, reviewCount, commentCount, favoriteCount, recentReviews, recentUsers] =
    await Promise.all([
      prisma.store.count(),
      prisma.store.count({ where: { published: true } }),
      prisma.user.count(),
      prisma.review.count(),
      prisma.comment.count(),
      prisma.favorite.count(),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          store: { select: { id: true, name: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

  const avgAgg = await prisma.review.aggregate({ _avg: { rating: true } });
  const overallAvg = avgAgg._avg.rating
    ? Math.round(avgAgg._avg.rating * 10) / 10
    : 0;

  const stats = [
    { label: "登録店舗数", value: storeCount, sub: `公開中 ${publishedCount}件` },
    { label: "会員数", value: userCount, sub: "" },
    { label: "口コミ数", value: reviewCount, sub: `平均評価 ${overallAvg || "－"}` },
    { label: "コメント数", value: commentCount, sub: `お気に入り ${favoriteCount}件` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-medium text-slate-500">{s.label}</div>
            <div className="mt-1 text-3xl font-bold text-slate-900">
              {s.value}
            </div>
            {s.sub && (
              <div className="mt-1 text-xs text-slate-400">{s.sub}</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">最新の口コミ</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {recentReviews.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/stores/${r.store.id}`}
                    className="text-sm font-bold text-orange-700 hover:underline"
                  >
                    {r.store.name}
                  </Link>
                  <RatingStars rating={r.rating} size="sm" />
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  {truncate(r.title, 40)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {r.user.name} さん・{formatDate(r.createdAt)}
                </p>
              </li>
            ))}
            {recentReviews.length === 0 && (
              <li className="py-3 text-sm text-slate-500">
                まだ口コミがありません。
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">
            新規登録ユーザー
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {u.name}
                  </div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
                <div className="text-xs text-slate-400">
                  {formatDate(u.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/stores/new"
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
        >
          ＋ 新しい店舗を登録
        </Link>
        <Link
          href="/admin/stores"
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          店舗一覧を管理
        </Link>
      </div>
    </div>
  );
}
