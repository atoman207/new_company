type Props = {
  rating: number;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "h-3.5 w-3.5",
  md: "h-4.5 w-4.5",
  lg: "h-6 w-6",
};

function Star({ fillPct, sizeClass }: { fillPct: number; sizeClass: string }) {
  return (
    <span className={`relative inline-block ${sizeClass}`}>
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full fill-slate-300">
        <path d="M12 2l2.9 6.26 6.86.83-5.07 4.7 1.34 6.77L12 17.2l-6.03 3.36 1.34-6.77-5.07-4.7 6.86-.83L12 2z" />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fillPct}%` }}
      >
        <svg viewBox="0 0 24 24" className={`h-full fill-amber-400 ${sizeClass}`}>
          <path d="M12 2l2.9 6.26 6.86.83-5.07 4.7 1.34 6.77L12 17.2l-6.03 3.36 1.34-6.77-5.07-4.7 6.86-.83L12 2z" />
        </svg>
      </span>
    </span>
  );
}

export default function RatingStars({ rating, size = "md" }: Props) {
  const sizeClass = SIZE_CLASS[size];
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`評価 ${rating}`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const pct = Math.min(Math.max((rating - i) * 100, 0), 100);
        return <Star key={i} fillPct={pct} sizeClass={sizeClass} />;
      })}
    </span>
  );
}
