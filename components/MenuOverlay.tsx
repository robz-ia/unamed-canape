"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { EASE } from "./motion/Reveal";

const LINKS = [
  { href: "/boutique", label: "La collection", image: "/products/nuage/1.jpg" },
  { href: "/boutique?categorie=canapes", label: "Canapés", image: "/products/alma/2.jpg" },
  { href: "/boutique?categorie=sculpturales", label: "Pièces sculpturales", image: "/products/galet/2.jpg" },
  { href: "/boutique?categorie=convertibles", label: "Convertibles", image: "/products/rive-gauche/2.jpg" },
  { href: "/concierge", label: "Le Concierge", image: "/products/petale/2.jpg" },
  { href: "/maison", label: "La maison", image: "/products/meandre/2.jpg" },
];

type Props = { open: boolean; onClose: () => void; isLogged: boolean; isAdmin: boolean };

export default function MenuOverlay({ open, onClose, isLogged, isAdmin }: Props) {
  const [hover, setHover] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, lenis, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-ink text-paper"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="mx-auto max-w-[1600px] h-full px-5 md:px-10 flex flex-col">
            <div className="h-20 md:h-24 grid grid-cols-[1fr_auto_1fr] items-center">
              <button onClick={onClose} className="eyebrow justify-self-start link-underline">
                Fermer
              </button>
              <Link href="/" onClick={onClose} className="logo text-[1.35rem] sm:text-[1.7rem] md:text-[2rem]">
                Unamed Canapé.
              </Link>
              <span />
            </div>

            <div className="flex-1 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center pb-10 min-h-0">
              <nav>
                <ul>
                  {LINKS.map((l, i) => (
                    <li key={l.href} className="overflow-hidden">
                      <motion.div
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "110%" }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.06 }}
                      >
                        <Link
                          href={l.href}
                          onClick={onClose}
                          onMouseEnter={() => setHover(i)}
                          className="group flex items-baseline gap-5 py-1"
                        >
                          <span className="eyebrow !text-[0.6rem] text-paper/40 w-6">0{i + 1}</span>
                          <span className="display text-[2.6rem] sm:text-6xl xl:text-7xl transition-all duration-700 group-hover:italic group-hover:translate-x-3 text-paper/90 group-hover:text-paper">
                            {l.label}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
                <motion.div
                  className="flex gap-8 mt-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <Link href={isLogged ? "/compte" : "/connexion"} onClick={onClose} className="eyebrow link-underline">
                    {isLogged ? "Mon compte" : "Connexion"}
                  </Link>
                  <Link href="/panier" onClick={onClose} className="eyebrow link-underline">
                    Panier
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={onClose} className="eyebrow link-underline">
                      Tableau de bord
                    </Link>
                  )}
                </motion.div>
              </nav>

              <motion.div
                className="hidden lg:block relative h-[70vh] overflow-hidden"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={hover}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    <Image src={LINKS[hover].image} alt="" fill sizes="40vw" className="object-cover" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
