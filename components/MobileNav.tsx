"use client";

import Link from "next/link";
import { useState } from "react";

type Props = { items: { href: string; label: string }[]; isLogged: boolean; isAdmin: boolean };

export default function MobileNav({ items, isLogged, isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className="flex flex-col gap-1.5 p-2 -mr-2">
        <span className={`block h-px w-6 bg-ink transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
        <span className={`block h-px w-6 bg-ink transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
      </button>
      {open && (
        <div onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)} className="fixed inset-x-0 top-[121px] bottom-0 bg-paper z-50 px-6 py-10 flex flex-col gap-7 animate-fade-up">
          {items.map((n) => (
            <Link key={n.href} href={n.href} className="display text-4xl">
              {n.label}
            </Link>
          ))}
          <div className="h-px bg-line my-2" />
          <Link href={isLogged ? "/compte" : "/connexion"} className="eyebrow">
            {isLogged ? "Mon compte" : "Connexion / inscription"}
          </Link>
          {isAdmin && (
            <Link href="/admin" className="eyebrow">
              Tableau de bord
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
