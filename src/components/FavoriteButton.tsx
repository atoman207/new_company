"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/lib/actions/favorite";

type Props = {
  storeId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
};

export default function FavoriteButton({
  storeId,
  initialFavorited,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setOptimisticFavorited] = useOptimistic(initialFavorited);

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      setOptimisticFavorited(!favorited);
      await toggleFavoriteAction(storeId);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
        favorited
          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${favorited ? "fill-rose-500" : "fill-none stroke-current stroke-2"}`}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      {favorited ? "お気に入り登録済み" : "お気に入りに追加"}
    </button>
  );
}
