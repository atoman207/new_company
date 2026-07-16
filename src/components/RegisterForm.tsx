"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "@/lib/actions/auth";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    registerAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          ニックネーム
        </label>
        <input
          id="name"
          type="text"
          name="name"
          required
          maxLength={30}
          placeholder="例：グルメ太郎"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="taro@example.com"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          パスワード（8文字以上）
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>
      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700">
          パスワード（確認）
        </label>
        <input
          id="passwordConfirm"
          type="password"
          name="passwordConfirm"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-orange-600 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
      >
        {isPending ? "登録中…" : "無料で会員登録"}
      </button>
    </form>
  );
}
