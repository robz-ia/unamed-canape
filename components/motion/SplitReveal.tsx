"use client";

import { motion } from "motion/react";
import { EASE } from "./Reveal";

// *texte en italique* : peut couvrir plusieurs mots
function parse(text: string) {
  return text.split(" ").reduce<{ out: { word: string; italic: boolean }[]; open: boolean }>(
    (acc, w) => {
      const open = acc.open || w.startsWith("*");
      acc.out.push({ word: w.replace(/\*/g, ""), italic: open });
      return { out: acc.out, open: open && !w.endsWith("*") };
    },
    { out: [], open: false }
  ).out;
}

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p";
  immediate?: boolean; // animer au montage plutôt qu'à l'entrée dans l'écran
};

// Titre révélé mot à mot, chaque mot sortant d'un masque. *mot* = italique.
export default function SplitReveal({ text, className, delay = 0, stagger = 0.06, as = "h2", immediate }: Props) {
  const Tag = motion[as];
  const words = parse(text);
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };

  return (
    <Tag className={className} initial="hidden" {...trigger} aria-label={text.replace(/\*/g, "")}>
      {words.map(({ word: clean, italic }, i) => {
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
            <motion.span
              className={`inline-block ${italic ? "italic" : ""}`}
              variants={{
                hidden: { y: "110%", rotate: 4 },
                show: { y: "0%", rotate: 0, transition: { duration: 1.2, ease: EASE, delay: delay + i * stagger } },
              }}
            >
              {clean}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
