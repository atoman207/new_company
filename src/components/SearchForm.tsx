"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AREAS } from "@/lib/constants";

type Props = {
  categories: { id: string; name: string; slug: string }[];
  defaultQ?: string;
  defaultCategory?: string;
  defaultArea?: string;
  defaultSort?: string;
  variant?: "hero" | "bar";
};

export default function SearchForm({
  categories,
  defaultQ = "",
  defaultCategory = "",
  defaultArea = "",
  defaultSort = "",
  variant = "bar",
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory);
  const [area, setArea] = useState(defaultArea);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (area) params.set("area", area);
    if (defaultSort) params.set("sort", defaultSort);
    router.push(`/stores?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isHero
          ? "flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg sm:p-5"
          : "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="店名・キーワードで検索"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus:border-orange-500 focus:outline-none"
          aria-label="カテゴリ"
        >
          <option value="">カテゴリを選択</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus:border-orange-500 focus:outline-none"
          aria-label="エリア"
        >
          <option value="">エリアを選択</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          検索する
        </button>
      </div>
    </form>
  );
}
