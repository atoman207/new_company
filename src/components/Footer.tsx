import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl">📍</span>
              <span className="text-lg font-bold text-white">{SITE_NAME}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              あなたの街のお店探しをもっと便利に。
              口コミとランキングで、ぴったりのお店が見つかる店舗情報ポータルサイトです。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">お店を探す</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/stores" className="hover:text-white">
                  店舗一覧
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="hover:text-white">
                  人気ランキング
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">会員サービス</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-white">
                  新規会員登録
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  ログイン
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="hover:text-white">
                  マイページ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 {SITE_NAME} All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
