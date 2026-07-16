"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type ReviewState = { error?: string; success?: boolean };

export async function createReviewAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "口コミを投稿するにはログインが必要です。" };
  }

  const storeId = String(formData.get("storeId") ?? "");
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!storeId) return { error: "店舗が見つかりません。" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "評価（1〜5）を選択してください。" };
  }
  if (!title) return { error: "タイトルを入力してください。" };
  if (title.length > 60) {
    return { error: "タイトルは60文字以内で入力してください。" };
  }
  if (!body) return { error: "口コミ本文を入力してください。" };
  if (body.length > 2000) {
    return { error: "口コミ本文は2000文字以内で入力してください。" };
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store || !store.published) {
    return { error: "店舗が見つかりません。" };
  }

  const existing = await prisma.review.findUnique({
    where: { userId_storeId: { userId: user.id, storeId } },
  });
  if (existing) {
    return { error: "この店舗にはすでに口コミを投稿済みです。" };
  }

  await prisma.review.create({
    data: { rating, title, body, userId: user.id, storeId },
  });

  revalidatePath(`/stores/${storeId}`);
  return { success: true };
}

export async function deleteReviewAction(reviewId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return;
  if (review.userId !== user.id && user.role !== "ADMIN") return;

  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath(`/stores/${review.storeId}`);
  revalidatePath("/mypage/reviews");
}

export type CommentState = { error?: string; success?: boolean };

export async function createCommentAction(
  _prev: CommentState,
  formData: FormData
): Promise<CommentState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "コメントを投稿するにはログインが必要です。" };
  }

  const reviewId = String(formData.get("reviewId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!body) return { error: "コメントを入力してください。" };
  if (body.length > 500) {
    return { error: "コメントは500文字以内で入力してください。" };
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return { error: "口コミが見つかりません。" };

  await prisma.comment.create({
    data: { body, userId: user.id, reviewId },
  });

  revalidatePath(`/stores/${review.storeId}`);
  return { success: true };
}

export async function deleteCommentAction(commentId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { review: { select: { storeId: true } } },
  });
  if (!comment) return;
  if (comment.userId !== user.id && user.role !== "ADMIN") return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/stores/${comment.review.storeId}`);
}
