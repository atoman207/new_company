import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { fetchStoresWithRating, sortStores, getCategories } from "@/lib/stores";
import { AREAS, PER_PAGE, SORT_OPTIONS } from "@/lib/constants";
import SearchForm from "@/components/SearchForm";
import StoreCard from "@/components/StoreCard";
import Pagination from "@/components/Pagination";
import Link from "next/link";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  area?: string;
  sort?: string;
  page?: string;
}>;

export async function generateMetadata(props: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q, category, area } = await props.searchParams;
  const parts = [q, area].filter(Boolean);
  const title = parts.length > 0 ? `「${parts.join("・")}」の検索結果` : "店舗を探す";
  return {
    title: category ? `${title}（カテゴリ絞り込み）` : title,
    description:
      "エリア・カテゴリ・キーワードから、あなたにぴったりのお店を検索できます。",
  };
}

export default async function StoresPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const q = params.q?.trim() ?? "";
  const categorySlug = params.category ?? "";
  const area = params.area ?? "";
  const sort = params.sort ?? "rating";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.StoreWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (area && (AREAS as readonly string[]).includes(area)) {
    where.area = area;
  }

  const [categories, allStores] = await Promise.all([
    getCategories(),
    fetchStoresWithRating(where),
  ]);

  const sorted = sortStores(allStores, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const baseParams: Record<string, string> = {};
  if (q) baseParams.q = q;
  if (categorySlug) baseParams.category = categorySlug;
  if (area) baseParams.area = area;
  if (sort !== "rating") baseParams.sort = sort;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-slate-500" aria-label="パンくずリスト">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-700">店舗一覧</span>
      </nav>

      <h1 className="mt-3 text-2xl font-bold text-slate-900">
        {activeCategory ? `${activeCategory.name}のお店` : "店舗を探す"}
        {area && `（${area}）`}
      </h1>
      {q && (
        <p className="mt-1 text-sm text-slate-600">
          「{q}」の検索結果
        </p>
      )}

      <div className="mt-5">
        <SearchForm
          categories={categories}
          defaultQ={q}
          defaultCategory={categorySlug}
          defaultArea={area}
          defaultSort={sort !== "rating" ? sort : ""}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <span className="text-lg font-bold text-orange-600">
            {sorted.length}
          </span>{" "}
          件のお店が見つかりました
        </p>
        <div className="flex gap-1.5">
          {SORT_OPTIONS.map((opt) => {
            const p = new URLSearchParams(baseParams);
            if (opt.value === "rating") {
              p.delete("sort");
            } else {
              p.set("sort", opt.value);
            }
            const qs = p.toString();
            return (
              <Link
                key={opt.value}
                href={qs ? `/stores?${qs}` : "/stores"}
                className={
                  sort === opt.value
                    ? "rounded-full bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white"
                    : "rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                }
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {paged.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-lg font-bold text-slate-700">
            条件に一致するお店が見つかりませんでした
          </p>
          <p className="mt-2 text-sm text-slate-500">
            キーワードや絞り込み条件を変更してお試しください。
          </p>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/stores"
        searchParams={baseParams}
      />
    </div>
  );
}
