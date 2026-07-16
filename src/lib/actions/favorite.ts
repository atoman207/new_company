"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function toggleFavoriteAction(storeId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_storeId: { userId: user.id, storeId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_storeId: { userId: user.id, storeId } },
    });
  } else {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return;
    await prisma.favorite.create({
      data: { userId: user.id, storeId },
    });
  }

  revalidatePath(`/stores/${storeId}`);
  revalidatePath("/mypage/favorites");
}
