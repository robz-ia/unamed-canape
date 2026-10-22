"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { EASE } from "./Reveal";

const WORD = "Unamed Canapé";

// Intro de première visite : le nom s'écrit, puis le rideau se lève.
export default function Preloader() {
  const [show, setShow] = useState(true);
  const lenis = useLenis();

  const seen = useRef<boolean | null>(null);

  useEffect(() => {
    // Lu une seule fois (le double montage du mode strict ne doit pas relire la valeur)
    if (seen.current === null) {
      try {
        seen.current = sessionStorage.getItem("uc_intro") === "1";
        sessionStorage.setItem("uc_intro", "1");
      } catch {
        seen.current = false;
      }
    }
    if (seen.current) return; // déjà masquée en CSS (.intro-seen)
    const t = setTimeout(() => setShow(false), 2100);
    return () => clearTimeout(t);
  }, []);

  // Pas de défilement pendant l'intro
  useEffect(() => {
    if (!lenis) return;
    if (show && !document.documentElement.classList.contains("intro-seen")) lenis.stop();
    else lenis.start();
  }, [show, lenis]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="preloader fixed inset-0 z-[100] bg-ink text-paper flex items-center justify-center"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <p className="logo text-[11vw] md:text-[7vw] overflow-hidden flex" aria-label="Unamed Canapé.">
            {WORD.split("").map((c, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.045 }}
              >
                {c === " " ? " " : c}
              </motion.span>
            ))}
            <motion.span
              className="inline-block text-stone"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 1 }}
            >
              .
            </motion.span>
          </p>
          <motion.span
            className="absolute bottom-10 left-1/2 -translate-x-1/2 h-px w-40 bg-paper/20 overflow-hidden"
            initial={{ opacity: 1 }}
          >
            <motion.span
              className="block h-full bg-paper origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
            />
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
