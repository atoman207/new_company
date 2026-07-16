"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type ReviewState } from "@/lib/actions/review";

type Props = {
  storeId: string;
};

const RATING_LABELS = ["", "不満", "やや不満", "普通", "満足", "大満足"];

export default function ReviewForm({ storeId }: Props) {
  const [state, formAction, isPending] = useActionState<ReviewState, FormData>(
    createReviewAction,
    {}
  );
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-bold text-emerald-700">
          口コミを投稿しました。ありがとうございます！
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-base font-bold text-slate-900">口コミを投稿する</h3>

      <input type="hidden" name="storeId" value={storeId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700">
          評価 <span className="text-rose-500">*</span>
        </label>
        <div className="mt-1.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`星${n}つ`}
              className="p-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-8 w-8 transition ${
                  n <= (hover || rating) ? "fill-amber-400" : "fill-slate-300"
                }`}
              >
                <path d="M12 2l2.9 6.26 6.86.83-5.07 4.7 1.34 6.77L12 17.2l-6.03 3.36 1.34-6.77-5.07-4.7 6.86-.83L12 2z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-slate-600">
            {rating > 0 ? RATING_LABELS[rating] : "タップして選択"}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="review-title" className="block text-sm font-medium text-slate-700">
          タイトル <span className="text-rose-500">*</span>
        </label>
        <input
          id="review-title"
          type="text"
          name="title"
          maxLength={60}
          placeholder="例：雰囲気もサービスも大満足でした"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="review-body" className="block text-sm font-medium text-slate-700">
          口コミ本文 <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={5}
          maxLength={2000}
          placeholder="実際に利用した感想を書いてください"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {state.error && (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-lg bg-orange-600 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {isPending ? "投稿中…" : "口コミを投稿する"}
      </button>
    </form>
  );
}
