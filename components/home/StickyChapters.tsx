"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE } from "../motion/Reveal";
import SplitReveal from "../motion/SplitReveal";

type Chapter = { title: string; text: string; image: string };

function ChapterBlock({ c, i, onActive }: { c: Chapter; i: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);

  return (
    <div ref={ref} className="min-h-[85vh] flex flex-col justify-center py-16">
      <p className="eyebrow text-stone">Chapitre {String(i + 1).padStart(2, "0")}</p>
      <SplitReveal text={c.title} className="display text-5xl md:text-7xl mt-5" />
      <motion.p
        className="mt-8 text-lg text-stone leading-relaxed max-w-md"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE, delay: 0.3 }}
      >
        {c.text}
      </motion.p>
      <div className="lg:hidden relative aspect-[4/5] mt-10 overflow-hidden">
        <Image src={c.image} alt="" fill sizes="100vw" className="object-cover" />
      </div>
    </div>
  );
}

// Récit en chapitres : l'image reste épinglée et change au fil du texte.
export default function StickyChapters({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="mx-auto max-w-[1600px] px-5 md:px-10 grid lg:grid-cols-2 gap-10 lg:gap-24">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen flex items-center">
          <div className="relative w-full h-[80vh] overflow-hidden bg-ivory">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
                animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
              >
                <Image src={chapters[active].image} alt="" fill sizes="50vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
            <span className="absolute bottom-5 right-5 eyebrow !text-[0.6rem] text-paper mix-blend-difference">
              {String(active + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
      <div>
        {chapters.map((c, i) => (
          <ChapterBlock key={c.title} c={c} i={i} onActive={setActive} />
        ))}
      </div>
    </section>
  );
}
