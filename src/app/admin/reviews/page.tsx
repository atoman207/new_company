import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, truncate } from "@/lib/utils";
import DeleteForm from "@/components/DeleteForm";
import RatingStars from "@/components/RatingStars";
import { adminDeleteReviewAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "口コミ管理",
};

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      store: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">口コミ管理</h1>
      <p className="mt-1 text-sm text-slate-600">
        全{reviews.length}件の口コミが投稿されています。
      </p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">店舗</th>
              <th className="px-4 py-3 font-medium">評価</th>
              <th className="px-4 py-3 font-medium">タイトル／本文</th>
              <th className="px-4 py-3 font-medium">投稿者</th>
              <th className="px-4 py-3 font-medium">投稿日</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/stores/${review.store.id}`}
                    className="font-bold text-slate-800 hover:text-orange-600"
                  >
                    {review.store.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <RatingStars rating={review.rating} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">
                    {truncate(review.title, 24)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {truncate(review.body, 40)}
                    {review._count.comments > 0 &&
                      `（コメント${review._count.comments}件）`}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{review.user.name}</div>
                  <div className="text-xs text-slate-400">
                    {review.user.email}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDate(review.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <DeleteForm
                    action={adminDeleteReviewAction.bind(null, review.id)}
                    confirmMessage="この口コミを削除しますか？付随するコメントも削除されます。"
                    className="text-xs font-medium text-rose-600 hover:underline"
                  >
                    削除
                  </DeleteForm>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  口コミがまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
