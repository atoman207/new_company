import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { logoutAction } from "@/lib/actions/auth";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-2xl">📍</span>
          <span className="text-xl font-bold tracking-tight text-orange-600">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/stores"
            className="text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            お店を探す
          </Link>
          <Link
            href="/ranking"
            className="text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            ランキング
          </Link>
          {user ? (
            <>
              <Link
                href="/mypage"
                className="text-sm font-medium text-slate-700 hover:text-orange-600"
              >
                マイページ
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-slate-700 hover:text-orange-600"
                >
                  管理画面
                </Link>
              )}
              <span className="text-sm text-slate-500">
                {user.name} さん
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-orange-600"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-orange-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>

        <MobileMenu
          user={user ? { name: user.name, role: user.role } : null}
        />
      </div>
    </header>
  );
}
