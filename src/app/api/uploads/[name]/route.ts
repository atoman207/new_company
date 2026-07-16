import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // パストラバーサル対策：ファイル名のみ許可
  if (name !== path.basename(name) || name.includes("..")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(name).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
