import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import DeleteForm from "@/components/DeleteForm";
import {
  updateUserRoleAction,
  deleteUserAction,
} from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "ユーザー管理",
};

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { reviews: true, favorites: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">ユーザー管理</h1>
      <p className="mt-1 text-sm text-slate-600">
        全{users.length}名の会員が登録されています。
      </p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">ユーザー</th>
              <th className="px-4 py-3 font-medium">権限</th>
              <th className="px-4 py-3 font-medium">口コミ</th>
              <th className="px-4 py-3 font-medium">お気に入り</th>
              <th className="px-4 py-3 font-medium">登録日</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isSelf = user.id === admin.id;
              return (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      {user.name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs font-normal text-slate-400">
                          （自分）
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "ADMIN" ? (
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-white">
                        管理者
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        一般会員
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {user._count.reviews}件
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {user._count.favorites}件
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <div className="flex items-center gap-3">
                        {user.role === "ADMIN" ? (
                          <form
                            action={updateUserRoleAction.bind(null, user.id, "USER")}
                            className="inline"
                          >
                            <button
                              type="submit"
                              className="text-xs font-medium text-slate-600 hover:underline"
                            >
                              一般会員にする
                            </button>
                          </form>
                        ) : (
                          <form
                            action={updateUserRoleAction.bind(null, user.id, "ADMIN")}
                            className="inline"
                          >
                            <button
                              type="submit"
                              className="text-xs font-medium text-orange-600 hover:underline"
                            >
                              管理者にする
                            </button>
                          </form>
                        )}
                        <DeleteForm
                          action={deleteUserAction.bind(null, user.id)}
                          confirmMessage={`「${user.name}」を削除しますか？このユーザーの口コミ・コメント・お気に入りも削除されます。`}
                          className="text-xs font-medium text-rose-600 hover:underline"
                        >
                          削除
                        </DeleteForm>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
