import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import MypageNav from "@/components/MypageNav";
import RatingStars from "@/components/RatingStars";
import DeleteForm from "@/components/DeleteForm";
import { deleteReviewAction } from "@/lib/actions/review";

export const metadata: Metadata = {
  title: "投稿した口コミ",
};

export default async function MyReviewsPage() {
  const user = await requireUser();

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      store: { select: { id: true, name: true, area: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">マイページ</h1>

      <div className="mt-5">
        <MypageNav active="reviews" />
      </div>

      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/stores/${review.store.id}`}
                className="text-sm font-bold text-orange-700 hover:underline"
              >
                {review.store.name}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {review.store.area}
                </span>
              </Link>
              <DeleteForm
                action={deleteReviewAction.bind(null, review.id)}
                confirmMessage="この口コミを削除しますか？"
                className="text-xs text-slate-400 hover:text-rose-600"
              >
                削除
              </DeleteForm>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-slate-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <h2 className="mt-1.5 text-sm font-bold text-slate-900">
              {review.title}
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {review.body}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              コメント {review._count.comments}件
            </p>
          </article>
        ))}

        {reviews.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <p className="text-sm text-slate-500">
              まだ口コミを投稿していません。
            </p>
            <Link
              href="/stores"
              className="mt-3 inline-block rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold text-white hover:bg-orange-700"
            >
              お店を探して口コミを書く
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
