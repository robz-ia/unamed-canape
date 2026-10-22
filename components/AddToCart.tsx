"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { addToCart } from "@/app/actions";
import { price } from "@/lib/format";
import type { Variant } from "@/lib/types";
import { showPhoto } from "./Gallery";

type Props = {
  variants: Variant[];
  basePrice: number;
  name: string;
  cover?: string;
};

export default function AddToCart({ variants, basePrice, name, cover }: Props) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selected, setSelected] = useState(firstAvailable?.id);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ count: number } | null>(null);
  const [portal, setPortal] = useState(false); // monté au premier ajout, après hydratation
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const variant = variants.find((v) => v.id === selected);
  const unit = basePrice + (variant?.price_delta ?? 0);
  const soldOut = !variant || variant.stock === 0;

  useEffect(() => {
    if (drawer) lenis?.stop();
    else lenis?.start();
  }, [drawer, lenis]);

  const choose = (v: Variant) => {
    setSelected(v.id);
    setError(null);
    if (v.image_position) showPhoto(v.image_position);
  };

  const submit = () =>
    start(async () => {
      if (!variant) return;
      const res = await addToCart(variant.id, qty);
      if ("needsAuth" in res) return router.push(`/connexion?next=${pathname}`);
      if ("error" in res) return setError(res.error!);
      setPortal(true);
      setDrawer({ count: res.count! });
    });

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={unit * qty}
            className="display text-4xl tabular-nums"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {price(unit * qty)}
          </motion.p>
        </AnimatePresence>
        {qty > 1 && (
          <p className="text-xs text-stone">soit {price(unit)} l&apos;unité</p>
        )}
      </div>

      <div className="mt-10">
        <div className="flex justify-between items-baseline">
          <p className="eyebrow">Coloris</p>
          <p className="text-sm text-stone">
            {variant?.color_name} · {variant?.fabric}
            {variant &&
              variant.price_delta > 0 &&
              ` · +${price(variant.price_delta)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 mt-5">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => choose(v)}
              title={`${v.color_name}${v.stock === 0 ? " — épuisé" : ""}`}
              aria-label={v.color_name}
              aria-pressed={selected === v.id}
              className="relative size-10 rounded-full p-[3px] transition-transform duration-500 hover:scale-110"
            >
              <span
                className="block size-full rounded-full ring-1 ring-black/10"
                style={{ background: v.color_hex }}
              />
              {selected === v.id && (
                <motion.span
                  layoutId="swatch-ring"
                  className="absolute inset-[-3px] rounded-full ring-1 ring-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {v.stock === 0 && (
                <span className="absolute inset-0 m-auto h-px w-full rotate-45 bg-ink/50" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs mt-5 text-stone min-h-4">
          {variant &&
            variant.stock === 0 &&
            "Épuisé — de retour prochainement."}
          {variant &&
            variant.stock > 0 &&
            variant.stock <= 3 &&
            `Plus que ${variant.stock} pièces disponibles.`}
          {variant &&
            variant.stock > 3 &&
            "Disponible — fabrication à la commande."}
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <div className="flex items-center border border-line">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-4 h-full text-stone hover:text-ink"
            aria-label="Diminuer"
          >
            −
          </button>
          <span
            className="w-6 text-center text-sm tabular-nums"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            onClick={() => setQty(Math.min(qty + 1, variant?.stock || 1, 10))}
            className="px-4 h-full text-stone hover:text-ink"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>
        <button
          onClick={submit}
          disabled={pending || soldOut}
          className="btn btn-solid flex-1 !py-5"
        >
          {pending ? "Un instant…" : soldOut ? "Épuisé" : "Ajouter au panier"}
        </button>
      </div>
      {error && <p className="text-sm text-danger mt-4">{error}</p>}

      {/* Panneau de confirmation (portail : hors des conteneurs animés) */}
      {portal &&
        createPortal(
          <AnimatePresence>
            {drawer && (
              <>
                <motion.div
                  className="fixed inset-0 z-[80] bg-ink/30 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDrawer(null)}
                />
                <motion.aside
                  className="fixed top-0 right-0 bottom-0 z-[81] w-full max-w-md bg-paper p-8 md:p-10 flex flex-col"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                  <div className="flex justify-between items-center">
                    <p className="eyebrow">Ajouté au panier</p>
                    <button
                      onClick={() => setDrawer(null)}
                      className="eyebrow link-underline"
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="mt-10 flex gap-5">
                    <div className="relative w-28 aspect-[4/5] bg-ivory shrink-0">
                      {cover && (
                        <Image
                          src={cover}
                          alt={name}
                          fill
                          sizes="112px"
                          className="object-contain p-2 mix-blend-multiply"
                        />
                      )}
                    </div>
                    <div>
                      <p className="display text-3xl">{name}</p>
                      <p className="text-sm text-stone mt-2">
                        {variant?.color_name} · {variant?.fabric}
                      </p>
                      <p className="text-sm mt-1">
                        {qty} × {price(unit)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-stone mt-10">
                    Votre panier contient {drawer.count} article
                    {drawer.count > 1 ? "s" : ""}. Il est sauvegardé sur votre
                    compte.
                  </p>
                  <div className="mt-auto flex flex-col gap-3">
                    <Link href="/panier" className="btn btn-solid w-full">
                      Voir le panier
                    </Link>
                    <button
                      onClick={() => setDrawer(null)}
                      className="btn btn-ghost w-full"
                    >
                      Continuer la visite
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
