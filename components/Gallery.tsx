"use client";

import { useState } from "react";
import ProductImage from "./ProductImage";
import type { ProductImage as Img } from "@/lib/types";

export default function Gallery({ images, name, tone }: { images: Img[]; name: string; tone?: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ id: "x", url: "", alt: name, position: 0 }];
  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-3">
        {list.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            aria-label={`Vue ${i + 1}`}
            className={`w-20 md:w-24 transition-opacity ${active === i ? "opacity-100 outline outline-1 outline-ink outline-offset-2" : "opacity-50 hover:opacity-100"}`}
          >
            <ProductImage src={img.url || undefined} alt={img.alt} seed={i} tone={tone} sizes="96px" className="aspect-square" />
          </button>
        ))}
      </div>
      <ProductImage
        key={active}
        src={list[active].url || undefined}
        alt={list[active].alt}
        seed={active}
        tone={tone}
        priority
        sizes="(min-width: 1024px) 55vw, 100vw"
        className="flex-1 aspect-[4/5] animate-fade-up"
      />
    </div>
  );
}
