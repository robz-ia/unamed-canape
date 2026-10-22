"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import MenuOverlay from "./MenuOverlay";

type Props = { count: number; isLogged: boolean; firstName: string | null; isAdmin: boolean };

// En-tête flottant : texte en « différence » (blanc sur image, noir sur ivoire),
// se retire quand on descend, revient quand on remonte.
export default function HeaderBar({ count, isLogged, firstName, isAdmin }: Props) {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 160 && y > prev);
  });

  return (
    <>
      <motion.header
        className="fixed top-0 inset-x-0 z-50 text-white mix-blend-difference"
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 h-20 md:h-24 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <button onClick={() => setOpen(true)} className="group flex items-center gap-3 justify-self-start" aria-label="Ouvrir le menu">
            <span className="flex flex-col gap-[5px]">
              <span className="block h-px w-7 bg-current transition-all duration-500 group-hover:w-5" />
              <span className="block h-px w-5 bg-current transition-all duration-500 group-hover:w-7" />
            </span>
            <span className="eyebrow hidden sm:inline">Menu</span>
          </button>

          <Link href="/" aria-label="Unamed Canapé — accueil" className="logo text-[1.15rem] sm:text-[1.7rem] md:text-[2rem] whitespace-nowrap">
            Unamed Canapé.
          </Link>

          <div className="flex items-center gap-5 md:gap-8 justify-self-end">
            {isAdmin && (
              <Link href="/admin" className="eyebrow hidden lg:inline link-underline">
                Admin
              </Link>
            )}
            <Link href={isLogged ? "/compte" : "/connexion"} className="eyebrow hidden md:inline link-underline">
              {isLogged ? firstName || "Compte" : "Compte"}
            </Link>
            <Link href="/panier" className="eyebrow link-underline whitespace-nowrap" aria-label={`Panier, ${count} article(s)`}>
              <span className="hidden sm:inline">Panier </span>
              <span className="tabular-nums">({count})</span>
            </Link>
          </div>
        </div>
      </motion.header>
      <MenuOverlay open={open} onClose={() => setOpen(false)} isLogged={isLogged} isAdmin={isAdmin} />
    </>
  );
}
