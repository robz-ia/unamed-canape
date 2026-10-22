"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { EASE } from "../motion/Reveal";
import SplitReveal from "../motion/SplitReveal";
import { useIntroDelay } from "../motion/useIntroDelay";

export type Frame = {
  slug: string;
  name: string;
  image: string;
  className: string;
  aspect: string;
  depth: number;
  mobile?: boolean;
};

function FloatingFrame({
  f,
  i,
  mx,
  my,
  scroll,
  delay,
}: {
  f: Frame;
  i: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  scroll: MotionValue<number>;
  delay: number;
}) {
  const x = useTransform(mx, (v) => v * 40 * f.depth);
  const y = useTransform(my, (v) => v * 30 * f.depth);
  const drift = useTransform(scroll, [0, 1], [0, -320 * f.depth]);

  return (
    <motion.div
      style={{ y: drift }}
      className={`absolute ${f.className} ${f.mobile ? "" : "hidden md:block"}`}
    >
      <motion.div style={{ x, y }}>
        <Link
          href={`/produit/${f.slug}`}
          className="group block"
          aria-label={f.name}
        >
          <motion.div
            className={`relative w-full overflow-hidden bg-ivory ${f.aspect}`}
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{
              duration: 1.5,
              ease: [0.76, 0, 0.24, 1],
              delay: delay + i * 0.12,
            }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: EASE, delay: delay + i * 0.12 }}
            >
              <Image
                src={f.image}
                alt={f.name}
                fill
                sizes="(min-width: 768px) 20vw, 40vw"
                priority={i < 3}
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
              />
            </motion.div>
          </motion.div>
          <span className="eyebrow !text-[0.6rem] mt-2 block text-stone opacity-0 -translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            {f.name} →
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// Hero « mur de galerie » : titre centré, les pièces flottent autour à différentes profondeurs.
export default function HeroGallery({ frames }: { frames: Frame[] }) {
  const ref = useRef<HTMLElement>(null);
  const delay = useIntroDelay(0.1);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const tx = useTransform(mx, (v) => v * -18);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[680px] overflow-hidden bg-paper"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set((e.clientX - r.left) / r.width - 0.5);
        rawY.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {frames.map((f, i) => (
        <FloatingFrame
          key={f.slug}
          f={f}
          i={i}
          mx={mx}
          my={my}
          scroll={scrollYProgress}
          delay={delay}
        />
      ))}

      <motion.div
        style={{ y: titleY, opacity: titleOpacity, x: tx }}
        className="relative z-10 h-full flex items-center justify-center text-center px-5 pointer-events-none"
      >
        {/* Mobile : panneau ivoire pour que le texte reste lisible au-dessus des photos. Bureau : les photos restent en marge. */}
        <motion.div
          className="flex flex-col items-center bg-paper/80 backdrop-blur-xl px-7 py-10 shadow-[0_30px_80px_-40px_rgba(18,17,16,0.25)] md:bg-transparent md:backdrop-blur-none md:shadow-none md:p-0"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay }}
        >
          <motion.p
            className="eyebrow !text-[0.6rem] sm:!text-[0.6875rem] text-stone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: delay + 0.2 }}
          >
            Maison de canapés de créateurs — Paris
          </motion.p>
          <SplitReveal
            as="h1"
            immediate
            delay={delay + 0.3}
            text="L'art de"
            className="display text-[clamp(3.2rem,9vw,9rem)] leading-[0.92] mt-6 sm:mt-8"
          />
          <SplitReveal
            as="p"
            immediate
            delay={delay + 0.45}
            text="*s'asseoir.*"
            className="display text-[clamp(3.2rem,9vw,9rem)] leading-[0.92]"
          />
          <motion.div
            className="mt-8 sm:mt-10 flex flex-col items-center gap-7 pointer-events-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: delay + 0.9 }}
          >
            <p className="text-stone max-w-xs sm:max-w-sm leading-relaxed text-sm sm:text-base">
              Six pièces de créateurs, fabriquées à la commande et installées
              chez vous.
            </p>
            <Link href="/boutique" className="btn btn-ghost">
              Découvrir la collection
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: titleOpacity }}
        className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1.4 }}
      >
        <span className="eyebrow !text-[0.6rem] text-stone">Défiler</span>
        <span className="block h-10 w-px bg-ink/15 overflow-hidden">
          <span className="block h-full w-full bg-ink animate-scroll-cue" />
        </span>
      </motion.div>
    </section>
  );
}
