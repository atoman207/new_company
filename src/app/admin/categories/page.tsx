import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import DeleteForm from "@/components/DeleteForm";
import CategoryForm from "@/components/CategoryForm";
import { deleteCategoryAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "カテゴリ管理",
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { stores: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">カテゴリ管理</h1>

      <div className="mt-5">
        <CategoryForm />
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">カテゴリ名</th>
              <th className="px-4 py-3 font-medium">スラッグ</th>
              <th className="px-4 py-3 font-medium">店舗数</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-800">
                  {category.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{category.slug}</td>
                <td className="px-4 py-3 text-slate-600">
                  {category._count.stores}件
                </td>
                <td className="px-4 py-3">
                  {category._count.stores === 0 ? (
                    <DeleteForm
                      action={deleteCategoryAction.bind(null, category.id)}
                      confirmMessage={`カテゴリ「${category.name}」を削除しますか？`}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      削除
                    </DeleteForm>
                  ) : (
                    <span className="text-xs text-slate-400">
                      店舗があるため削除不可
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  カテゴリが登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
