// 店舗プレースホルダー画像（SVG）を public/images/stores/ に生成するスクリプト
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public", "images", "stores");

const CATEGORIES = {
  gourmet: { label: "グルメ", emoji: "🍽️", from: "#fb923c", to: "#dc2626" },
  cafe: { label: "カフェ", emoji: "☕", from: "#d6a26b", to: "#78350f" },
  beauty: { label: "美容・サロン", emoji: "💇", from: "#f9a8d4", to: "#be185d" },
  shopping: { label: "ショッピング", emoji: "🛍️", from: "#93c5fd", to: "#1d4ed8" },
  leisure: { label: "レジャー・娯楽", emoji: "🎡", from: "#86efac", to: "#15803d" },
  health: { label: "健康・リラクゼーション", emoji: "💆", from: "#a5f3fc", to: "#0e7490" },
};

const VARIANTS = ["外観イメージ", "店内イメージ", "おすすめイメージ"];

function svg({ emoji, label, sub, from, to, id }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g${id})"/>
  <circle cx="120" cy="90" r="160" fill="#ffffff" opacity="0.08"/>
  <circle cx="700" cy="430" r="200" fill="#ffffff" opacity="0.08"/>
  <text x="400" y="235" font-size="110" text-anchor="middle">${emoji}</text>
  <text x="400" y="320" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif">${label}</text>
  <text x="400" y="365" font-size="22" fill="#ffffff" opacity="0.85" text-anchor="middle" font-family="'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif">${sub}</text>
</svg>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let id = 0;
for (const [slug, cat] of Object.entries(CATEGORIES)) {
  VARIANTS.forEach((variant, i) => {
    id += 1;
    const file = path.join(OUT_DIR, `${slug}-${i + 1}.svg`);
    fs.writeFileSync(
      file,
      svg({
        emoji: cat.emoji,
        label: cat.label,
        sub: variant,
        from: cat.from,
        to: cat.to,
        id,
      })
    );
    console.log(`created: ${file}`);
  });
}

// デフォルトプレースホルダー
fs.writeFileSync(
  path.join(OUT_DIR, "placeholder.svg"),
  svg({
    emoji: "🏬",
    label: "マチナビ",
    sub: "画像準備中",
    from: "#94a3b8",
    to: "#475569",
    id: "d",
  })
);
console.log("created: placeholder.svg");
