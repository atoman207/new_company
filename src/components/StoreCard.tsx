import Link from "next/link";
import RatingStars from "./RatingStars";
import { truncate } from "@/lib/utils";

export type StoreCardData = {
  id: string;
  name: string;
  area: string;
  description: string;
  images: string[];
  categoryName: string;
  avgRating: number;
  reviewCount: number;
};

type Props = {
  store: StoreCardData;
  rank?: number;
};

const RANK_COLORS: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-slate-400 text-white",
  3: "bg-orange-700 text-white",
};

export default function StoreCard({ store, rank }: Props) {
  const image = store.images[0] ?? "/images/stores/placeholder.svg";

  return (
    <Link
      href={`/stores/${store.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {rank !== undefined && (
        <span
          className={`absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow ${
            RANK_COLORS[rank] ?? "bg-slate-700 text-white"
          }`}
        >
          {rank}位
        </span>
      )}
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={store.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700">
            {store.categoryName}
          </span>
          <span className="text-slate-500">{store.area}</span>
        </div>
        <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-orange-600">
          {store.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          <RatingStars rating={store.avgRating} size="sm" />
          <span className="text-sm font-bold text-orange-600">
            {store.avgRating > 0 ? store.avgRating.toFixed(1) : "－"}
          </span>
          <span className="text-xs text-slate-500">
            （{store.reviewCount}件）
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {truncate(store.description, 60)}
        </p>
      </div>
    </Link>
  );
}
