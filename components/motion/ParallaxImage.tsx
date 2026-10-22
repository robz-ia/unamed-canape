"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EASE } from "./Reveal";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  strength?: number; // amplitude de la parallaxe en %
  contain?: boolean; // photo détourée sur fond blanc : on la pose sur l'ivoire
};

// Image révélée par un rideau puis animée en parallaxe au défilement.
export default function ParallaxImage({ src, alt, className = "", sizes = "100vw", priority, strength = 10, contain }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden bg-ivory ${className}`}
      initial={{ clipPath: "inset(12% 8% 12% 8%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.6, ease: EASE }}
    >
      <motion.div style={{ y }} className="absolute inset-[-12%]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={contain ? "object-contain mix-blend-multiply p-[10%]" : "object-cover"}
        />
      </motion.div>
    </motion.div>
  );
}
