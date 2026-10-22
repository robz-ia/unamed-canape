"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";

type Item = { href: string; name: string; description: string | null; count: number; image: string };

// Liste d'univers : au survol, une image suit le curseur.
export default function CategoryList({ items }: { items: Item[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20 });
  const sy = useSpring(y, { stiffness: 150, damping: 20 });

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
      onMouseLeave={() => setHover(null)}
    >
      <ul className="border-t border-ink">
        {items.map((it, i) => (
          <li key={it.href} className="border-b border-line">
            <Link
              href={it.href}
              onMouseEnter={() => setHover(i)}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-4 md:gap-10 py-8 md:py-10"
            >
              <span className="eyebrow !text-[0.6rem] text-stone w-8">0{i + 1}</span>
              <span>
                <span className="display block text-[2.3rem] sm:text-5xl md:text-7xl lg:text-8xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:italic group-hover:translate-x-4">
                  {it.name}
                </span>
                <span className="block text-sm text-stone mt-3 md:hidden">{it.description}</span>
              </span>
              <span className="eyebrow text-stone group-hover:text-ink transition-colors hidden sm:inline">
                {it.count} pièce{it.count > 1 ? "s" : ""} →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-40 hidden md:block w-[22vw] max-w-[340px] aspect-[4/5] overflow-hidden"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hover === null ? 0 : 1, scale: hover === null ? 0.6 : 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="popLayout">
          {hover !== null && (
            <motion.div
              key={hover}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Image src={items[hover].image} alt="" fill sizes="340px" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
