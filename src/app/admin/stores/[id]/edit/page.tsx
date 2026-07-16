import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoreForm from "@/components/StoreForm";

export const metadata: Metadata = {
  title: "店舗情報の編集",
};

type Params = Promise<{ id: string }>;

export default async function EditStorePage(props: { params: Params }) {
  const { id } = await props.params;

  const [store, categories] = await Promise.all([
    prisma.store.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!store) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        店舗情報の編集：{store.name}
      </h1>
      <div className="mt-5">
        <StoreForm categories={categories} store={store} />
      </div>
    </div>
  );
}
