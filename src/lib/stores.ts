import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { averageRating } from "./utils";
import type { StoreCardData } from "@/components/StoreCard";

export type StoreWithRating = StoreCardData & {
  createdAt: Date;
  categorySlug: string;
};

export async function fetchStoresWithRating(
  where: Prisma.StoreWhereInput = {}
): Promise<StoreWithRating[]> {
  const stores = await prisma.store.findMany({
    where: { published: true, ...where },
    include: {
      category: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return stores.map((s) => ({
    id: s.id,
    name: s.name,
    area: s.area,
    description: s.description,
    images: s.images,
    categoryName: s.category.name,
    categorySlug: s.category.slug,
    avgRating: averageRating(s.reviews.map((r) => r.rating)),
    reviewCount: s.reviews.length,
    createdAt: s.createdAt,
  }));
}

export function sortStores(
  stores: StoreWithRating[],
  sort: string
): StoreWithRating[] {
  const list = [...stores];
  switch (sort) {
    case "reviews":
      return list.sort(
        (a, b) => b.reviewCount - a.reviewCount || b.avgRating - a.avgRating
      );
    case "new":
      return list.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    case "rating":
    default:
      return list.sort(
        (a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount
      );
  }
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { stores: { where: { published: true } } },
      },
    },
  });
}
