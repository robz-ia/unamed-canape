"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ProductImage as Img } from "@/lib/types";

// Photos de la variante choisie. `setKey` change quand le jeu de photos change.
const slide = {
  enter: (d: number) => ({ x: `${d * 18}%`, opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (d: number) => ({ x: `${d * -18}%`, opacity: 0 }),
};

type Props = { images: Img[]; name: string; setKey: string; direction: number };

// Changer d'option fait glisser les photos dans le sens du choix (comme un swipe).
export default function Gallery({ images, name, setKey, direction }: Props) {
  const carousel = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);

  // Nouveau jeu de photos : le carrousel mobile repart de la première
  useEffect(() => {
    carousel.current?.scrollTo({ left: 0 });
  }, [setKey]);

  const frame = (img: Img, i: number, sizes: string) => (
    <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
      <Image
        src={img.url}
        alt={img.alt}
        fill
        sizes={sizes}
        priority={i === 0}
        className={
          img.on_white
            ? "object-contain p-[8%] mix-blend-multiply"
            : "object-cover"
        }
      />
    </div>
  );

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={setKey}
          custom={direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Mobile : carrousel horizontal */}
          <div className="lg:hidden -mx-5">
            <div
              ref={carousel}
              data-lenis-prevent-horizontal
              onScroll={(e) =>
                setCurrent(
                  Math.round(
                    e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
                  ) + 1,
                )
              }
              className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((img, i) => (
                <div key={img.id} className="w-full shrink-0 snap-center">
                  {frame(img, i, "100vw")}
                </div>
              ))}
            </div>
            <p className="eyebrow !text-[0.6rem] text-stone px-5 mt-3 tabular-nums">
              {String(Math.min(current, images.length)).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")} — {name}
            </p>
          </div>

          {/* Bureau : photos empilées, révélées au défilement */}
          <div className="hidden lg:flex flex-col gap-5">
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={
                  i === 0
                    ? false
                    : { clipPath: "inset(10% 0 10% 0)", opacity: 0.4 }
                }
                whileInView={{ clipPath: "inset(0% 0 0% 0)", opacity: 1 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {frame(img, i, "55vw")}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
