import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { averageRating, formatDate, truncate } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import RatingStars from "@/components/RatingStars";
import ImageGallery from "@/components/ImageGallery";
import FavoriteButton from "@/components/FavoriteButton";
import ReviewForm from "@/components/ReviewForm";
import CommentForm from "@/components/CommentForm";
import DeleteForm from "@/components/DeleteForm";
import { deleteReviewAction, deleteCommentAction } from "@/lib/actions/review";

type Params = Promise<{ id: string }>;

async function getStore(id: string) {
  return prisma.store.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          comments: {
            orderBy: { createdAt: "asc" },
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
}

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await props.params;
  const store = await getStore(id);
  if (!store || !store.published) {
    return { title: "店舗が見つかりません" };
  }
  return {
    title: `${store.name}（${store.area}／${store.category.name}）`,
    description: truncate(
      `${store.name}の店舗情報・口コミページです。${store.description}`,
      150
    ),
  };
}

export default async function StoreDetailPage(props: { params: Params }) {
  const { id } = await props.params;
  const [store, user] = await Promise.all([getStore(id), getCurrentUser()]);

  if (!store || !store.published) notFound();

  const ratings = store.reviews.map((r) => r.rating);
  const avg = averageRating(ratings);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r === star).length,
  }));

  const favorited = user
    ? (await prisma.favorite.findUnique({
        where: { userId_storeId: { userId: user.id, storeId: store.id } },
      })) !== null
    : false;

  const alreadyReviewed = user
    ? store.reviews.some((r) => r.user.id === user.id)
    : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: store.name,
    description: store.description,
    address: store.address,
    telephone: store.phone ?? undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/stores/${store.id}`,
    ...(ratings.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avg,
        reviewCount: ratings.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const infoRows: [string, React.ReactNode][] = [
    ["カテゴリ", store.category.name],
    ["エリア", store.area],
    ["住所", store.address],
    ["電話番号", store.phone ?? "－"],
    ["営業時間", store.businessHours ?? "－"],
    ["定休日", store.closedDays ?? "－"],
    ["予算目安", store.budget ?? "－"],
    ["アクセス", store.access ?? "－"],
    [
      "公式サイト",
      store.website ? (
        <a
          href={store.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:underline"
        >
          {store.website}
        </a>
      ) : (
        "－"
      ),
    ],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-slate-500" aria-label="パンくずリスト">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span className="mx-1.5">›</span>
        <Link href="/stores" className="hover:underline">店舗一覧</Link>
        <span className="mx-1.5">›</span>
        <Link
          href={`/stores?category=${store.category.slug}`}
          className="hover:underline"
        >
          {store.category.name}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-700">{store.name}</span>
      </nav>

      {/* 店舗ヘッダー */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
              {store.category.name}
            </span>
            <span className="text-sm text-slate-500">{store.area}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {store.name}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={avg} />
            <span className="text-xl font-bold text-orange-600">
              {avg > 0 ? avg.toFixed(1) : "－"}
            </span>
            <span className="text-sm text-slate-500">
              （{ratings.length}件の口コミ）
            </span>
          </div>
        </div>
        <FavoriteButton
          storeId={store.id}
          initialFavorited={favorited}
          isLoggedIn={user !== null}
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImageGallery images={store.images} alt={store.name} />

          <section className="mt-8">
            <h2 className="border-l-4 border-orange-500 pl-3 text-lg font-bold text-slate-900">
              お店について
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {store.description}
            </p>
          </section>

          {/* 口コミセクション */}
          <section className="mt-10">
            <h2 className="border-l-4 border-orange-500 pl-3 text-lg font-bold text-slate-900">
              口コミ（{ratings.length}件）
            </h2>

            {ratings.length > 0 && (
              <div className="mt-4 flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600">
                    {avg.toFixed(1)}
                  </div>
                  <RatingStars rating={avg} size="sm" />
                  <div className="mt-1 text-xs text-slate-500">
                    {ratings.length}件の評価
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {distribution.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-slate-600">★{star}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{
                            width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-slate-500">
                        {count}件
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-5">
              {store.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                          {review.user.name.charAt(0)}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {review.user.name} さん
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {user && (review.user.id === user.id || user.role === "ADMIN") && (
                      <DeleteForm
                        action={deleteReviewAction.bind(null, review.id)}
                        confirmMessage="この口コミを削除しますか？"
                        className="text-xs text-slate-400 hover:text-rose-600"
                      >
                        削除
                      </DeleteForm>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="text-sm font-bold text-orange-600">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-slate-900">
                    {review.title}
                  </h3>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {review.body}
                  </p>

                  {/* コメント */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    {review.comments.length > 0 && (
                      <ul className="space-y-2.5">
                        {review.comments.map((comment) => (
                          <li
                            key={comment.id}
                            className="rounded-lg bg-slate-50 px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">
                                {comment.user.name} さん
                                <span className="ml-2 font-normal text-slate-400">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </span>
                              {user &&
                                (comment.user.id === user.id ||
                                  user.role === "ADMIN") && (
                                  <DeleteForm
                                    action={deleteCommentAction.bind(null, comment.id)}
                                    confirmMessage="このコメントを削除しますか？"
                                    className="text-xs text-slate-400 hover:text-rose-600"
                                  >
                                    削除
                                  </DeleteForm>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-slate-700">
                              {comment.body}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-2.5">
                      {user ? (
                        <CommentForm reviewId={review.id} />
                      ) : (
                        <Link
                          href="/login"
                          className="text-xs text-slate-500 hover:underline"
                        >
                          コメントするにはログインしてください
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {store.reviews.length === 0 && (
                <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  まだ口コミがありません。最初の口コミを投稿してみませんか？
                </p>
              )}
            </div>

            {/* 口コミ投稿フォーム */}
            <div className="mt-8">
              {user ? (
                alreadyReviewed ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600">
                    この店舗には口コミを投稿済みです。ありがとうございます！
                  </p>
                ) : (
                  <ReviewForm storeId={store.id} />
                )
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                  <p className="text-sm text-slate-600">
                    口コミを投稿するにはログインが必要です
                  </p>
                  <div className="mt-3 flex justify-center gap-3">
                    <Link
                      href="/login"
                      className="rounded-lg border border-orange-600 px-5 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold text-white hover:bg-orange-700"
                    >
                      新規会員登録
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* サイドバー：店舗情報 */}
        <aside>
          <div className="rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-20">
            <h2 className="text-base font-bold text-slate-900">店舗情報</h2>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {infoRows.map(([label, value]) => (
                  <tr key={label} className="border-t border-slate-100">
                    <th className="w-24 py-2.5 pr-2 text-left align-top text-xs font-medium text-slate-500">
                      {label}
                    </th>
                    <td className="break-all py-2.5 text-slate-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
}
