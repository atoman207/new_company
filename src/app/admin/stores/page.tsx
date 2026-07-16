import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DeleteForm from "@/components/DeleteForm";
import { deleteStoreAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "店舗管理",
};

export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { reviews: true, favorites: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">店舗管理</h1>
        <Link
          href="/admin/stores/new"
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
        >
          ＋ 新規登録
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">店舗名</th>
              <th className="px-4 py-3 font-medium">カテゴリ</th>
              <th className="px-4 py-3 font-medium">エリア</th>
              <th className="px-4 py-3 font-medium">口コミ</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 font-medium">登録日</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/stores/${store.id}`}
                    className="font-bold text-slate-800 hover:text-orange-600"
                  >
                    {store.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {store.category.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{store.area}</td>
                <td className="px-4 py-3 text-slate-600">
                  {store._count.reviews}件
                </td>
                <td className="px-4 py-3">
                  {store.published ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      公開中
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      非公開
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDate(store.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/stores/${store.id}/edit`}
                      className="text-xs font-medium text-orange-600 hover:underline"
                    >
                      編集
                    </Link>
                    <DeleteForm
                      action={deleteStoreAction.bind(null, store.id)}
                      confirmMessage={`「${store.name}」を削除しますか？口コミ・お気に入りも削除されます。`}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      削除
                    </DeleteForm>
                  </div>
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  店舗が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
