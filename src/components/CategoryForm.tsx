"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCategoryAction,
  type CategoryState,
} from "@/lib/actions/admin";

export default function CategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<CategoryState, FormData>(
    createCategoryAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-base font-bold text-slate-900">
        カテゴリを追加する
      </h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="name"
          required
          placeholder="カテゴリ名（例：グルメ）"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        <input
          type="text"
          name="slug"
          required
          pattern="[a-z0-9-]+"
          placeholder="スラッグ（例：gourmet）"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {isPending ? "追加中…" : "追加"}
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-2 text-sm text-emerald-600">
          カテゴリを追加しました。
        </p>
      )}
    </form>
  );
}
