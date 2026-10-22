"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import type { ProductImage as Img } from "@/lib/types";

// Photos détourées ou schémas : posés sur l'ivoire plutôt que recadrés.
const isFlat = (img: Img) => img.position === 1 || /dimension|positions|trois vues/i.test(img.alt);

export const showPhoto = (n: number) => window.dispatchEvent(new CustomEvent("uc:show-photo", { detail: n }));

export default function Gallery({ images, name }: { images: Img[]; name: string }) {
  const lenis = useLenis();
  const carousel = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);

  // Un coloris choisi amène sa photo à l'écran
  useEffect(() => {
    const go = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      const el = document.getElementById(`photo-${n}`);
      if (!el) return;
      if (window.matchMedia("(min-width: 1024px)").matches) lenis?.scrollTo(el, { offset: -110, duration: 1.4 });
      else carousel.current?.scrollTo({ left: (n - 1) * carousel.current.clientWidth, behavior: "smooth" });
    };
    window.addEventListener("uc:show-photo", go);
    return () => window.removeEventListener("uc:show-photo", go);
  }, [lenis]);

  const frame = (img: Img, i: number, sizes: string, mobile = false) => (
    <div key={img.id} id={mobile ? undefined : `photo-${img.position}`} className="relative aspect-[4/5] overflow-hidden bg-ivory">
      <Image
        src={img.url}
        alt={img.alt}
        fill
        sizes={sizes}
        priority={i === 0}
        className={isFlat(img) ? "object-contain p-[8%] mix-blend-multiply" : "object-cover"}
      />
    </div>
  );

  return (
    <>
      {/* Mobile : carrousel horizontal */}
      <div className="lg:hidden -mx-5">
        <div
          ref={carousel}
          onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth) + 1)}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div key={img.id} className="w-full shrink-0 snap-center">
              {frame(img, i, "100vw", true)}
            </div>
          ))}
        </div>
        <p className="eyebrow !text-[0.6rem] text-stone px-5 mt-3 tabular-nums">
          {String(current).padStart(2, "0")} / {String(images.length).padStart(2, "0")} — {name}
        </p>
      </div>

      {/* Bureau : photos empilées, révélées au défilement */}
      <div className="hidden lg:flex flex-col gap-5">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={i === 0 ? false : { clipPath: "inset(10% 0 10% 0)", opacity: 0.4 }}
            whileInView={{ clipPath: "inset(0% 0 0% 0)", opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {frame(img, i, "55vw")}
          </motion.div>
        ))}
      </div>
    </>
  );
}
