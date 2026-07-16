"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
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
          パスワード
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="8文字以上"
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
        {isPending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
