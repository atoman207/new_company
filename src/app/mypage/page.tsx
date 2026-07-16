import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import MypageNav from "@/components/MypageNav";

export const metadata: Metadata = {
  title: "マイページ",
};

export default async function MypagePage() {
  const user = await requireUser();

  const [reviewCount, favoriteCount, commentCount] = await Promise.all([
    prisma.review.count({ where: { userId: user.id } }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.comment.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">マイページ</h1>

      <div className="mt-5">
        <MypageNav active="home" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-700">
            {user.name.charAt(0)}
          </span>
          <div>
            <div className="text-lg font-bold text-slate-900">
              {user.name} さん
            </div>
            <div className="text-sm text-slate-500">{user.email}</div>
            <div className="mt-0.5 text-xs text-slate-400">
              {formatDate(user.createdAt)} 登録
              {user.role === "ADMIN" && (
                <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-xs font-medium text-white">
                  管理者
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Link
          href="/mypage/reviews"
          className="rounded-xl border border-slate-200 bg-white p-5 text-center transition hover:border-orange-300"
        >
          <div className="text-3xl font-bold text-orange-600">
            {reviewCount}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
            投稿した口コミ
          </div>
        </Link>
        <Link
          href="/mypage/favorites"
          className="rounded-xl border border-slate-200 bg-white p-5 text-center transition hover:border-orange-300"
        >
          <div className="text-3xl font-bold text-rose-500">
            {favoriteCount}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
            お気に入り
          </div>
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
          <div className="text-3xl font-bold text-slate-700">
            {commentCount}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
            コメント
          </div>
        </div>
      </div>

      {user.role === "ADMIN" && (
        <div className="mt-5 rounded-xl border border-slate-300 bg-slate-50 p-5">
          <p className="text-sm text-slate-700">
            管理者アカウントでログイン中です。
          </p>
          <Link
            href="/admin"
            className="mt-2 inline-block rounded-lg bg-slate-800 px-5 py-2 text-sm font-bold text-white hover:bg-slate-700"
          >
            管理画面を開く
          </Link>
        </div>
      )}
    </div>
  );
}
