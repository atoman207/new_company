import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import StoreForm from "@/components/StoreForm";

export const metadata: Metadata = {
  title: "店舗の新規登録",
};

export default async function NewStorePage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">店舗の新規登録</h1>
      <div className="mt-5">
        <StoreForm categories={categories} />
      </div>
    </div>
  );
}
