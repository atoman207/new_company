import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "ファイルが選択されていません。" },
      { status: 400 }
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: `対応していないファイル形式です（${ext}）。JPG / PNG / WebP / GIF のみアップロードできます。` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください。" },
        { status: 400 }
      );
    }
    const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    urls.push(`/api/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
