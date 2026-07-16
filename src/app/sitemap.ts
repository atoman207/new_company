import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// ビルド時ではなくリクエスト時に生成する（ビルド環境にDBがなくても失敗しない）
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
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
  ];

  let storeUrls: MetadataRoute.Sitemap = [];
  try {
    const stores = await prisma.store.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    });
    storeUrls = stores.map((store) => ({
      url: `${siteUrl}/stores/${store.id}`,
      lastModified: store.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DBに接続できない場合は静的ページのみのサイトマップを返す
  }

  return [...staticUrls, ...storeUrls];
}
