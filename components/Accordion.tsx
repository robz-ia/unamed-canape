"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function Accordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-line">
      {items.map((it, i) => (
        <div key={it.title} className="border-b border-line">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center py-5 eyebrow" aria-expanded={open === i}>
            {it.title}
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.4 }} className="text-base font-light">
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pb-6 text-sm leading-relaxed text-stone">{it.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
