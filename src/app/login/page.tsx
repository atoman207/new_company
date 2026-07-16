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
      </div>
    </div>
  );
}
