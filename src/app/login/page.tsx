import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
  description: "マチナビにログインして、口コミの投稿やお気に入り登録を利用しましょう。",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/mypage");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          ログイン
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          口コミの投稿やお気に入り登録にはログインが必要です
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="font-medium text-orange-600 hover:underline">
            新規会員登録
          </Link>
        </p>

        {/* デモ用アカウント案内 */}
        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="text-sm font-bold text-orange-800">
            🔑 デモ用アカウント
          </h2>
          <p className="mt-1 text-xs text-orange-700">
            以下のアカウントで機能をお試しいただけます。
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="rounded-lg bg-white px-3 py-2">
              <dt className="text-xs font-bold text-slate-500">
                管理者アカウント
              </dt>
              <dd className="mt-0.5 font-mono text-slate-800">
                admin@example.com ／ admin1234
              </dd>
            </div>
            <div className="rounded-lg bg-white px-3 py-2">
              <dt className="text-xs font-bold text-slate-500">
                一般会員アカウント
              </dt>
              <dd className="mt-0.5 font-mono text-slate-800">
                taro@example.com ／ password123
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
