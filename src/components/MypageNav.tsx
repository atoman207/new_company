import Link from "next/link";

type Props = {
  active: "home" | "reviews" | "favorites";
};

const TABS = [
  { key: "home", label: "マイページトップ", href: "/mypage" },
  { key: "reviews", label: "投稿した口コミ", href: "/mypage/reviews" },
  { key: "favorites", label: "お気に入り", href: "/mypage/favorites" },
] as const;

export default function MypageNav({ active }: Props) {
  return (
    <nav className="flex gap-1.5 overflow-x-auto border-b border-slate-200">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            active === tab.key
              ? "whitespace-nowrap border-b-2 border-orange-600 px-4 py-2.5 text-sm font-bold text-orange-600"
              : "whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-sm text-slate-600 hover:text-orange-600"
          }
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
