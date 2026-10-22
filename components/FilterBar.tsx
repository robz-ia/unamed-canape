"use client";

import Link from "next/link";
import { motion } from "motion/react";

type Tab = { href: string; label: string; active: boolean };

// Onglets dont le soulignement glisse d'un choix à l'autre.
export default function FilterBar({ tabs, sorts, count }: { tabs: Tab[]; sorts: Tab[]; count: number }) {
  return (
    <div className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-y border-line -mx-5 md:-mx-10 px-5 md:px-10">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between py-5">
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} scroll={false} className={`relative eyebrow pb-1.5 transition-colors ${t.active ? "text-ink" : "text-stone hover:text-ink"}`}>
              {t.label}
              {t.active && <motion.span layoutId="filter-line" className="absolute left-0 right-0 -bottom-px h-px bg-ink" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
            </Link>
          ))}
        </nav>
        <div className="flex gap-6 items-center">
          <span className="eyebrow text-stone tabular-nums">
            {String(count).padStart(2, "0")} pièce{count > 1 ? "s" : ""}
          </span>
          <span className="h-4 w-px bg-line" />
          {sorts.map((s) => (
            <Link key={s.href} href={s.href} scroll={false} className={`relative eyebrow pb-1.5 transition-colors ${s.active ? "text-ink" : "text-stone hover:text-ink"}`}>
              {s.label}
              {s.active && <motion.span layoutId="sort-line" className="absolute left-0 right-0 -bottom-px h-px bg-ink" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
