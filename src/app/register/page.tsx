import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "新規会員登録",
  description: "マチナビの会員登録は無料です。登録すると口コミの投稿やお気に入り登録が利用できます。",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/mypage");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          新規会員登録
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          無料で登録して、口コミ投稿やお気に入り機能を使いましょう
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-orange-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
