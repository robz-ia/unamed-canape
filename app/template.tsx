"use client";

import { motion } from "motion/react";

// Fondu à l'arrivée sur une page. Opacité seulement : une transformation casserait
// les éléments position: fixed / sticky des pages.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
