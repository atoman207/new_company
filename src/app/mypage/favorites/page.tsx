import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { averageRating } from "@/lib/utils";
import MypageNav from "@/components/MypageNav";
import StoreCard from "@/components/StoreCard";

export const metadata: Metadata = {
  title: "お気に入りの店舗",
};

export default async function FavoritesPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id, store: { published: true } },
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        include: {
          category: true,
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  const stores = favorites.map((f) => ({
    id: f.store.id,
    name: f.store.name,
    area: f.store.area,
    description: f.store.description,
    images: f.store.images,
    categoryName: f.store.category.name,
    avgRating: averageRating(f.store.reviews.map((r) => r.rating)),
    reviewCount: f.store.reviews.length,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">マイページ</h1>

      <div className="mt-5">
        <MypageNav active="favorites" />
      </div>

      {stores.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-sm text-slate-500">
            まだお気に入りに登録した店舗がありません。
          </p>
          <Link
            href="/stores"
            className="mt-3 inline-block rounded-lg bg-orange-600 px-5 py-2 text-sm font-bold text-white hover:bg-orange-700"
          >
            お店を探す
          </Link>
        </div>
      )}
    </div>
  );
}
