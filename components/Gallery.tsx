"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ProductImage from "./ProductImage";
import type { ProductImage as Img } from "@/lib/types";

const Viewer3D = dynamic(() => import("./Viewer3D"), { ssr: false });

type Props = { images: Img[]; name: string; tone?: string; modelUrl?: string | null };

export default function Gallery({ images, name, tone, modelUrl }: Props) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"photo" | "3d">(modelUrl ? "3d" : "photo");
  const list = images.length ? images : [{ id: "x", url: "", alt: name, position: 0 }];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
        {modelUrl && (
          <button
            onClick={() => setMode("3d")}
            aria-label="Vue 3D"
            className={`w-20 md:w-24 aspect-square shrink-0 border flex flex-col items-center justify-center gap-1 transition ${mode === "3d" ? "border-ink" : "border-line opacity-60 hover:opacity-100"}`}
          >
            <span className="display text-2xl leading-none">3D</span>
            <span className="eyebrow !text-[0.55rem]">360°</span>
          </button>
        )}
        {list.map((img, i) => (
          <button
            key={img.id}
            onClick={() => {
              setActive(i);
              setMode("photo");
            }}
            aria-label={`Vue ${i + 1}`}
            className={`w-20 md:w-24 shrink-0 transition-opacity ${mode === "photo" && active === i ? "opacity-100 outline outline-1 outline-ink outline-offset-2" : "opacity-50 hover:opacity-100"}`}
          >
            <ProductImage src={img.url || undefined} alt={img.alt} seed={i} tone={tone} sizes="96px" className="aspect-square" />
          </button>
        ))}
      </div>
      <div className="flex-1 aspect-square relative">
        {mode === "3d" && modelUrl ? (
          <Viewer3D src={modelUrl} alt={`${name} en 3D`} poster={list[0].url || undefined} />
        ) : (
          <ProductImage
            key={active}
            src={list[active].url || undefined}
            alt={list[active].alt}
            seed={active}
            tone={tone}
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="absolute inset-0 animate-fade-up"
          />
        )}
        {modelUrl && mode === "photo" && (
          <button onClick={() => setMode("3d")} className="btn btn-solid !py-2.5 !px-5 absolute bottom-4 right-4">
            Voir en 3D
          </button>
        )}
      </div>
    </div>
  );
}
