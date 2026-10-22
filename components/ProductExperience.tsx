"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { addToCart } from "@/app/actions";
import { price } from "@/lib/format";
import type { Product } from "@/lib/types";
import {
  defaultVariant,
  imagesFor,
  optionValues,
  variantLabel,
} from "@/lib/variants";
import Gallery from "./Gallery";

type Props = {
  product: Product;
  header: React.ReactNode;
  details: React.ReactNode;
};

function OptionGroup({
  name,
  values,
  selected,
  onPick,
  index,
  available,
}: {
  name: string;
  values: { value: string; hex: string | null }[];
  selected: string | null;
  onPick: (v: string) => void;
  index: 1 | 2;
  available: (value: string) => boolean;
}) {
  const swatches = values.every((v) => v.hex);
  return (
    <div className="mt-9">
      <div className="flex justify-between items-baseline">
        <p className="eyebrow">{name}</p>
        <p className="text-sm text-stone">{selected}</p>
      </div>
      {swatches ? (
        <div className="flex flex-wrap gap-4 mt-5">
          {values.map(({ value, hex }) => (
            <button
              key={value}
              onClick={() => onPick(value)}
              title={value}
              aria-label={value}
              aria-pressed={selected === value}
              disabled={!available(value)}
              className="relative size-10 rounded-full p-[3px] transition-transform duration-500 hover:scale-110 disabled:opacity-30"
            >
              <span
                className="block size-full rounded-full ring-1 ring-black/10"
                style={{ background: hex! }}
              />
              {selected === value && (
                <motion.span
                  layoutId={`ring-${index}`}
                  className="absolute inset-[-3px] rounded-full ring-1 ring-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 mt-5">
          {values.map(({ value }) => (
            <button
              key={value}
              onClick={() => onPick(value)}
              aria-pressed={selected === value}
              disabled={!available(value)}
              className={`relative px-5 py-3 text-sm border transition-colors duration-500 disabled:opacity-30 ${selected === value ? "border-ink" : "border-line text-stone hover:text-ink hover:border-stone"}`}
            >
              {value}
              {selected === value && (
                <motion.span
                  layoutId={`pill-${index}`}
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Fiche produit : options (format, longueur, coloris…) → variante → photos et prix.
export default function ProductExperience({ product, header, details }: Props) {
  const initial = defaultVariant(product);
  const [o1, setO1] = useState(initial.option1);
  const [o2, setO2] = useState<string | null>(initial.option2);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ count: number } | null>(null);
  const [portal, setPortal] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const variant =
    product.variants.find(
      (v) => v.option1 === o1 && (v.option2 ?? null) === o2,
    ) ?? initial;
  const images = useMemo(
    () => imagesFor(product.images, variant),
    [product.images, variant],
  );
  const setKey = images.map((i) => i.id).join("|");
  const unit = product.base_price + variant.price_delta;
  const soldOut = variant.stock === 0;

  const values1 = optionValues(product, 1);
  const values2 = product.option2_name ? optionValues(product, 2) : [];

  useEffect(() => {
    if (drawer) lenis?.stop();
    else lenis?.start();
  }, [drawer, lenis]);

  // Changer d'option remonte en haut de la galerie si on l'avait quittée
  const onChange = () => {
    setError(null);
    setQty(1);
    if (
      window.scrollY > 300 &&
      window.matchMedia("(min-width: 1024px)").matches
    )
      lenis?.scrollTo(0, { duration: 1.2 });
  };

  const pick1 = (value: string) => {
    setO1(value);
    // si la combinaison n'existe pas, on prend la première disponible pour cette valeur
    if (
      !product.variants.some(
        (v) => v.option1 === value && (v.option2 ?? null) === o2,
      )
    ) {
      setO2(product.variants.find((v) => v.option1 === value)?.option2 ?? null);
    }
    onChange();
  };
  const pick2 = (value: string) => {
    setO2(value);
    onChange();
  };

  const submit = () =>
    start(async () => {
      const res = await addToCart(variant.id, qty);
      if ("needsAuth" in res) return router.push(`/connexion?next=${pathname}`);
      if ("error" in res) return setError(res.error!);
      setPortal(true);
      setDrawer({ count: res.count! });
    });

  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-20">
      <Gallery images={images} name={product.name} setKey={setKey} />

      <div className="lg:sticky lg:top-28 self-start lg:pb-10">
        {header}

        <div className="mt-10 flex items-baseline gap-3 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={unit * qty}
              className="display text-4xl tabular-nums"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {price(unit * qty)}
            </motion.p>
          </AnimatePresence>
          {qty > 1 && (
            <p className="text-xs text-stone">
              soit {price(unit)} l&apos;unité
            </p>
          )}
        </div>

        <OptionGroup
          name={product.option1_name}
          values={values1}
          selected={o1}
          onPick={pick1}
          index={1}
          available={(value) =>
            product.variants.some((v) => v.option1 === value)
          }
        />
        {product.option2_name && (
          <OptionGroup
            name={product.option2_name}
            values={values2}
            selected={o2}
            onPick={pick2}
            index={2}
            available={(value) =>
              product.variants.some(
                (v) => v.option1 === o1 && v.option2 === value,
              )
            }
          />
        )}

        <p className="text-xs mt-6 text-stone min-h-4">
          {soldOut &&
            "Épuisé dans cette configuration — de retour prochainement."}
          {!soldOut &&
            variant.stock <= 3 &&
            `Plus que ${variant.stock} pièce${variant.stock > 1 ? "s" : ""} dans cette configuration.`}
          {!soldOut &&
            variant.stock > 3 &&
            `Disponible — fabrication en ${product.lead_time_weeks} semaines.`}
        </p>

        <div className="mt-6 flex gap-3">
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
              onClick={() => setQty(Math.min(qty + 1, variant.stock || 1, 10))}
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

        {details}
      </div>

      {/* Confirmation (portail : hors des conteneurs animés) */}
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
                      {images[0] && (
                        <Image
                          src={images[0].url}
                          alt={product.name}
                          fill
                          sizes="112px"
                          className={
                            images[0].on_white
                              ? "object-contain p-2 mix-blend-multiply"
                              : "object-cover"
                          }
                        />
                      )}
                    </div>
                    <div>
                      <p className="display text-3xl">{product.name}</p>
                      <p className="text-sm text-stone mt-2">
                        {variantLabel(variant)}
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
