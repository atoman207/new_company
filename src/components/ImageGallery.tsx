"use client";

import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export default function ImageGallery({ images, alt }: Props) {
  const list = images.length > 0 ? images : ["/images/stores/placeholder.svg"];
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={list[selected]}
          alt={`${alt}の写真${selected + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === selected ? "border-orange-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`写真${i + 1}を表示`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
