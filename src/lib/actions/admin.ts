"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type StoreFormState = { error?: string };

export async function saveStoreAction(
  _prev: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const businessHours = String(formData.get("businessHours") ?? "").trim();
  const closedDays = String(formData.get("closedDays") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const access = String(formData.get("access") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const published = formData.get("published") === "on";
  const images = formData
    .getAll("images")
    .map((v) => String(v))
    .filter(Boolean);

  if (!name) return { error: "店舗名を入力してください。" };
  if (!description) return { error: "店舗説明を入力してください。" };
  if (!address) return { error: "住所を入力してください。" };
  if (!area) return { error: "エリアを選択してください。" };
  if (!categoryId) return { error: "カテゴリを選択してください。" };

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) return { error: "カテゴリが見つかりません。" };

  const data = {
    name,
    description,
    address,
    area,
    phone: phone || null,
    businessHours: businessHours || null,
    closedDays: closedDays || null,
    budget: budget || null,
    website: website || null,
    access: access || null,
    categoryId,
    published,
    images,
  };

  if (id) {
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) return { error: "店舗が見つかりません。" };
    await prisma.store.update({ where: { id }, data });
  } else {
    await prisma.store.create({ data });
  }

  revalidatePath("/stores");
  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}

export async function deleteStoreAction(storeId: string) {
  await requireAdmin();
  await prisma.store.delete({ where: { id: storeId } });
  revalidatePath("/stores");
  revalidatePath("/admin/stores");
}

export async function adminDeleteReviewAction(reviewId: string) {
  await requireAdmin();
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return;
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath(`/stores/${review.storeId}`);
  revalidatePath("/admin/reviews");
}

export async function updateUserRoleAction(userId: string, role: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;
  if (role !== "USER" && role !== "ADMIN") return;
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export type CategoryState = { error?: string; success?: boolean };

export async function createCategoryAction(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();

  if (!name) return { error: "カテゴリ名を入力してください。" };
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return { error: "スラッグは半角英数字とハイフンで入力してください。" };
  }

  const dup = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (dup) return { error: "同じ名前またはスラッグのカテゴリが既に存在します。" };

  const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
  await prisma.category.create({
    data: { name, slug, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();
  const count = await prisma.store.count({ where: { categoryId } });
  if (count > 0) return;
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
}
