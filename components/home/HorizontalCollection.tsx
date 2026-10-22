"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { price } from "@/lib/format";
import type { Product } from "@/lib/types";

// Galerie épinglée : le défilement vertical fait glisser la collection à l'horizontale.
export default function HorizontalCollection({ products }: { products: Product[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={section} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="mx-auto w-full max-w-[1600px] px-5 md:px-10 flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="eyebrow text-stone">La collection</p>
            <h2 className="display text-4xl md:text-6xl lg:text-7xl mt-3">
              Six pièces, <em>pas une de plus.</em>
            </h2>
          </div>
          <div className="w-48 hidden lg:block">
            <div className="h-px bg-ink/15">
              <motion.div style={{ scaleX: bar }} className="h-px bg-ink origin-left" />
            </div>
            <Link href="/boutique" className="eyebrow link-underline mt-4 inline-block">
              Tout voir
            </Link>
          </div>
        </div>

        <motion.div ref={track} style={{ x }} className="flex gap-6 md:gap-10 pl-5 md:pl-10 pr-[10vw] w-max">
          {products.map((p, i) => (
            <Link
              key={p.id}
              href={`/produit/${p.slug}`}
              data-cursor="Découvrir"
              className="group relative block shrink-0 w-[min(72vw,calc(56svh*0.8))]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                <Image
                  src={(p.images[1] ?? p.images[0]).url}
                  alt={(p.images[1] ?? p.images[0]).alt}
                  fill
                  sizes="(min-width: 1024px) 34vw, 72vw"
                  className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
                <span className="absolute top-5 left-5 eyebrow !text-[0.6rem] text-paper mix-blend-difference">
                  {String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-5 flex justify-between items-baseline gap-4">
                <p className="display text-3xl md:text-4xl transition-all duration-700 group-hover:italic">{p.name}</p>
                <p className="text-sm tabular-nums">{price(p.base_price)}</p>
              </div>
              <p className="text-sm text-stone mt-1">{p.tagline}</p>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
