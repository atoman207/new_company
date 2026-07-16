"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCommentAction, type CommentState } from "@/lib/actions/review";

type Props = {
  reviewId: string;
};

export default function CommentForm({ reviewId }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<CommentState, FormData>(
    createCommentAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-orange-600 hover:underline"
      >
        コメントする
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mt-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <textarea
        name="body"
        rows={2}
        maxLength={500}
        autoFocus
        placeholder="この口コミにコメントする"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
      />
      {state.error && (
        <p className="mt-1 text-sm text-rose-600">{state.error}</p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-orange-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {isPending ? "送信中…" : "コメントを送信"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
