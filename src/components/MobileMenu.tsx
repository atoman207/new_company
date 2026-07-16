"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

type Props = {
  user: { name: string; role: string } | null;
};

export default function MobileMenu({ user }: Props) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="メニューを開く"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white shadow-lg">
          <nav className="flex flex-col px-4 py-2">
            <Link
              href="/stores"
              onClick={close}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
            >
              お店を探す
            </Link>
            <Link
              href="/ranking"
              onClick={close}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
            >
              ランキング
            </Link>
            {user ? (
              <>
                <Link
                  href="/mypage"
                  onClick={close}
                  className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
                >
                  マイページ
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={close}
                    className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
                  >
                    管理画面
                  </Link>
                )}
                <div className="py-3 text-sm text-slate-500">
                  {user.name} さんとしてログイン中
                </div>
                <form action={logoutAction} className="pb-3">
                  <button
                    type="submit"
                    className="w-full rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-700"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="py-3 text-sm font-medium text-orange-600"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
