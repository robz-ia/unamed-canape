"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { price } from "@/lib/format";
import type { Product } from "@/lib/types";
import { coverFor, defaultVariant, fromPrice, hasPriceRange, imagesFor } from "@/lib/variants";
import Reveal from "../motion/Reveal";

// Carrousel manuel : on le fait défiler soi-même (glisser, swipe, flèches). Rien n'est automatique.
export default function CollectionCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const progress = useMotionValue(0);
  const bar = useSpring(progress, { stiffness: 200, damping: 30 });

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 400) + 32), behavior: "smooth" });
  };

  return (
    <section className="py-32 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 flex items-end justify-between gap-6 mb-12">
        <Reveal>
          <p className="eyebrow text-stone">La collection</p>
          <h2 className="display text-4xl md:text-6xl lg:text-7xl mt-3">
            Six pièces, <em>pas une de plus.</em>
          </h2>
        </Reveal>
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden md:block w-40 h-px bg-ink/15">
            <motion.div style={{ scaleX: bar }} className="h-px bg-ink origin-left" />
          </div>
          <div className="flex gap-2">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                onClick={() => step(d)}
                aria-label={d < 0 ? "Pièce précédente" : "Pièce suivante"}
                className="size-12 rounded-full border border-line flex items-center justify-center transition-colors duration-500 hover:bg-ink hover:text-paper hover:border-ink"
              >
                {d < 0 ? "←" : "→"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={track}
        data-lenis-prevent-horizontal
        onScroll={(e) => {
          const el = e.currentTarget;
          progress.set(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { active: true, startX: e.clientX, startScroll: track.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.active || !track.current) return;
          const dx = e.clientX - d.startX;
          if (Math.abs(dx) > 4 && !d.moved) {
            d.moved = true;
            setDragging(true);
          }
          if (d.moved) track.current.scrollLeft = d.startScroll - dx;
        }}
        onPointerUp={() => {
          drag.current.active = false;
          setDragging(false);
        }}
        onPointerLeave={() => {
          drag.current.active = false;
          setDragging(false);
        }}
        onClickCapture={(e) => {
          // un glisser ne doit pas ouvrir la fiche
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className={`flex gap-8 overflow-x-auto px-5 md:px-10 scroll-px-5 md:scroll-px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none ${dragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"}`}
      >
        {products.map((p, i) => {
          const def = defaultVariant(p);
          const cover = coverFor(p, def);
          const mood = imagesFor(p.images, def).find((im) => !im.on_white) ?? p.images.find((im) => !im.on_white) ?? cover;
          return (
            <Link
              key={p.id}
              href={`/produit/${p.slug}`}
              data-card
              draggable={false}
              className="group block shrink-0 snap-start w-[78vw] sm:w-[46vw] lg:w-[30vw] xl:w-[26vw]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                <Image
                  src={mood.url}
                  alt={mood.alt}
                  fill
                  draggable={false}
                  sizes="(min-width: 1280px) 26vw, (min-width: 1024px) 30vw, 78vw"
                  className={`transition-transform duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] ${mood.on_white ? "object-contain p-[8%] mix-blend-multiply" : "object-cover"}`}
                />
                <span className="absolute top-5 left-5 eyebrow !text-[0.6rem] text-paper mix-blend-difference">
                  {String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-5 flex justify-between items-baseline gap-4">
                <p className="display text-3xl md:text-4xl transition-all duration-700 group-hover:italic">{p.name}</p>
                <p className="text-sm tabular-nums shrink-0">
                  {hasPriceRange(p) && <span className="text-stone">dès </span>}
                  {price(fromPrice(p))}
                </p>
              </div>
              <p className="text-sm text-stone mt-1">{p.tagline}</p>
            </Link>
          );
        })}
        <span className="shrink-0 w-1" aria-hidden />
      </div>
    </section>
  );
}
