import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stores = await prisma.store.findMany({
    where: { published: true },
    select: { id: true, updatedAt: true },
  });

  const storeUrls: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${siteUrl}/stores/${store.id}`,
    lastModified: store.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/stores`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/ranking`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...storeUrls,
  ];
}
