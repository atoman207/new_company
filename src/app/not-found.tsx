import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-6xl font-bold text-orange-600">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-900">
        ページが見つかりませんでした
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        お探しのページは削除されたか、URLが変更された可能性があります。
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
        >
          トップページへ
        </Link>
        <Link
          href="/stores"
          className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          お店を探す
        </Link>
      </div>
    </div>
  );
}
