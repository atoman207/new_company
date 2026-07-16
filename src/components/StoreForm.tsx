"use client";

import { useActionState, useRef, useState } from "react";
import { saveStoreAction, type StoreFormState } from "@/lib/actions/admin";
import { AREAS } from "@/lib/constants";

type StoreData = {
  id: string;
  name: string;
  description: string;
  address: string;
  area: string;
  phone: string | null;
  businessHours: string | null;
  closedDays: string | null;
  budget: string | null;
  website: string | null;
  access: string | null;
  categoryId: string;
  published: boolean;
  images: string[];
};

type Props = {
  categories: { id: string; name: string }[];
  store?: StoreData;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export default function StoreForm({ categories, store }: Props) {
  const [state, formAction, isPending] = useActionState<StoreFormState, FormData>(
    saveStoreAction,
    {}
  );
  const [images, setImages] = useState<string[]>(store?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "アップロードに失敗しました。");
      } else {
        setImages((prev) => [...prev, ...data.urls]);
      }
    } catch {
      setUploadError("アップロードに失敗しました。");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      {store && <input type="hidden" name="id" value={store.id} />}
      {images.map((img) => (
        <input key={img} type="hidden" name="images" value={img} />
      ))}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            店舗名 <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            defaultValue={store?.name}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">
            カテゴリ <span className="text-rose-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={store?.categoryId ?? ""}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="area" className="block text-sm font-medium text-slate-700">
            エリア <span className="text-rose-500">*</span>
          </label>
          <select
            id="area"
            name="area"
            required
            defaultValue={store?.area ?? ""}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            店舗説明 <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            defaultValue={store?.description}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-slate-700">
            住所 <span className="text-rose-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            name="address"
            required
            defaultValue={store?.address}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            電話番号
          </label>
          <input
            id="phone"
            type="text"
            name="phone"
            defaultValue={store?.phone ?? ""}
            placeholder="03-1234-5678"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-slate-700">
            予算目安
          </label>
          <input
            id="budget"
            type="text"
            name="budget"
            defaultValue={store?.budget ?? ""}
            placeholder="例：1,000円〜2,000円"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="businessHours" className="block text-sm font-medium text-slate-700">
            営業時間
          </label>
          <input
            id="businessHours"
            type="text"
            name="businessHours"
            defaultValue={store?.businessHours ?? ""}
            placeholder="例：11:00〜22:00"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="closedDays" className="block text-sm font-medium text-slate-700">
            定休日
          </label>
          <input
            id="closedDays"
            type="text"
            name="closedDays"
            defaultValue={store?.closedDays ?? ""}
            placeholder="例：毎週水曜日"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="access" className="block text-sm font-medium text-slate-700">
            アクセス
          </label>
          <input
            id="access"
            type="text"
            name="access"
            defaultValue={store?.access ?? ""}
            placeholder="例：渋谷駅から徒歩5分"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-700">
            公式サイトURL
          </label>
          <input
            id="website"
            type="url"
            name="website"
            defaultValue={store?.website ?? ""}
            placeholder="https://example.com"
            className={inputClass}
          />
        </div>

        {/* 画像アップロード */}
        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-slate-700">
            店舗画像
          </span>
          <div className="mt-2 flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={img} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`店舗画像${i + 1}`}
                  className="h-24 w-32 rounded-lg border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  aria-label="画像を削除"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow hover:bg-rose-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500">
              <span className="text-2xl leading-none">＋</span>
              <span className="text-xs">{uploading ? "アップロード中…" : "画像を追加"}</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploadError && (
            <p className="mt-2 text-sm text-rose-600">{uploadError}</p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            JPG / PNG / WebP / GIF、1枚あたり5MBまで。複数選択できます。
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="published"
              defaultChecked={store?.published ?? true}
              className="h-4 w-4 rounded border-slate-300 accent-orange-600"
            />
            サイトに公開する
          </label>
        </div>
      </div>

      {state.error && (
        <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="rounded-lg bg-orange-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {isPending ? "保存中…" : store ? "変更を保存" : "店舗を登録"}
        </button>
      </div>
    </form>
  );
}
