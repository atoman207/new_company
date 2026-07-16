import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "管理画面",
    template: "%s｜マチナビ管理画面",
  },
  robots: { index: false, follow: false },
};

const MENU = [
  { href: "/admin", label: "📊 ダッシュボード" },
  { href: "/admin/stores", label: "🏬 店舗管理" },
  { href: "/admin/reviews", label: "💬 口コミ管理" },
  { href: "/admin/users", label: "👤 ユーザー管理" },
  { href: "/admin/categories", label: "🏷️ カテゴリ管理" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
      <aside className="lg:w-56 lg:flex-shrink-0">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="hidden px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-slate-400 lg:block">
            管理メニュー
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              ← サイトを表示
            </Link>
          </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
