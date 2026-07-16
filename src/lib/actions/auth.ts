"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";

export type AuthState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name || !email || !password) {
    return { error: "すべての項目を入力してください。" };
  }
  if (name.length > 30) {
    return { error: "ニックネームは30文字以内で入力してください。" };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "メールアドレスの形式が正しくありません。" };
  }
  if (password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください。" };
  }
  if (password !== passwordConfirm) {
    return { error: "パスワード（確認）が一致しません。" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "このメールアドレスは既に登録されています。" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
