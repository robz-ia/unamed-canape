"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE } from "../motion/Reveal";
import SplitReveal from "../motion/SplitReveal";

export type Slide = { slug: string; name: string; tagline: string; image: string };

const DURATION = 5200;

// Hero « showroom » : les pièces détourées défilent derrière un titre monumental.
export default function HeroShowroom({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [i, slides.length]);

  const s = slides[i];

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-paper">
      {/* Pièce */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 flex items-center justify-center pt-16">
        <div className="relative w-[96vw] md:w-[70vw] max-w-[1250px] aspect-[3/2]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={s.slug}
              className="absolute inset-0"
              initial={{ opacity: 0, x: 80, scale: 0.94, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -80, scale: 0.96, filter: "blur(8px)" }}
              transition={{ duration: 1.4, ease: EASE }}
            >
              <Image src={s.image} alt={s.name} fill priority sizes="(min-width: 768px) 70vw, 96vw" className="object-contain mix-blend-multiply" />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Titre */}
      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 h-full mx-auto max-w-[1600px] px-5 md:px-10 flex flex-col pointer-events-none">
        <motion.p
          className="eyebrow text-center pt-28 md:pt-32 text-stone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Maison de canapés de créateurs — Paris
        </motion.p>
        <div className="flex-1 flex flex-col justify-between pt-[5vh] pb-44 md:pb-[17vh]">
          <SplitReveal as="h1" immediate delay={0.2} text="L'art de" className="display text-[clamp(4rem,14vw,14rem)] leading-[0.85]" />
          <SplitReveal
            as="p"
            immediate
            delay={0.45}
            text="*s'asseoir.*"
            className="display text-[clamp(4rem,14vw,14rem)] leading-[0.85] self-end"
          />
        </div>
      </motion.div>

      {/* Légende + progression */}
      <motion.div style={{ opacity: fade }} className="absolute z-20 bottom-0 inset-x-0">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 pb-8 md:pb-10 grid grid-cols-[1fr_auto] md:grid-cols-3 items-end gap-6">
          <div className="min-h-[3.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <p className="eyebrow">
                  N° {String(i + 1).padStart(2, "0")} — {s.name}
                </p>
                <p className="text-sm text-stone mt-1">{s.tagline}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-2 mt-4">
              {slides.map((sl, k) => (
                <button key={sl.slug} onClick={() => setI(k)} aria-label={sl.name} className="h-6 w-10 flex items-center pointer-events-auto">
                  <span className="relative block h-px w-full bg-ink/15 overflow-hidden">
                    {k === i && (
                      <motion.span
                        className="absolute inset-0 bg-ink origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: DURATION / 1000, ease: "linear" }}
                      />
                    )}
                    {k < i && <span className="absolute inset-0 bg-ink" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-3">
            <span className="eyebrow !text-[0.6rem] text-stone">Défiler</span>
            <span className="block h-12 w-px bg-ink/15 overflow-hidden">
              <span className="block h-full w-full bg-ink animate-scroll-cue" />
            </span>
          </div>
          <Link href={`/produit/${s.slug}`} className="eyebrow link-underline justify-self-end pointer-events-auto">
            Voir la pièce →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
