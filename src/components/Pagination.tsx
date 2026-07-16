import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
};

function pageHref(
  basePath: string,
  searchParams: Record<string, string>,
  page: number
) {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="ページ送り">
      {currentPage > 1 && (
        <Link
          href={pageHref(basePath, searchParams, currentPage - 1)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          前へ
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(basePath, searchParams, p)}
          className={
            p === currentPage
              ? "rounded-md bg-orange-600 px-3.5 py-2 text-sm font-bold text-white"
              : "rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
          }
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={pageHref(basePath, searchParams, currentPage + 1)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
