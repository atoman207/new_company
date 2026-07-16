export const SITE_NAME = "マチナビ";
export const SITE_DESCRIPTION =
  "マチナビは、あなたの街のお店探しをもっと便利にする店舗情報ポータルサイトです。口コミ・ランキング・詳細検索でぴったりのお店が見つかります。";

export const AREAS = [
  "東京・渋谷",
  "東京・新宿",
  "東京・銀座",
  "横浜",
  "大阪・梅田",
  "大阪・難波",
  "京都",
  "名古屋",
  "福岡",
  "札幌",
] as const;

export const SORT_OPTIONS = [
  { value: "rating", label: "評価が高い順" },
  { value: "reviews", label: "口コミが多い順" },
  { value: "new", label: "新着順" },
] as const;

export const PER_PAGE = 9;
