"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions";
import { price } from "@/lib/format";
import type { Variant } from "@/lib/types";

export default function AddToCart({ variants, basePrice }: { variants: Variant[]; basePrice: number }) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selected, setSelected] = useState(firstAvailable?.id);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const variant = variants.find((v) => v.id === selected);
  const unit = basePrice + (variant?.price_delta ?? 0);
  const soldOut = !variant || variant.stock === 0;

  const submit = () =>
    start(async () => {
      if (!variant) return;
      const res = await addToCart(variant.id, qty);
      if ("needsAuth" in res) return router.push(`/connexion?next=${pathname}`);
      if ("error" in res) return setMsg({ type: "error", text: res.error! });
      setMsg({ type: "ok", text: `Ajouté au panier — ${res.count} article${res.count! > 1 ? "s" : ""}` });
    });

  return (
    <div>
      <p className="display text-3xl">{price(unit * qty)}</p>
      {qty > 1 && <p className="text-xs text-stone mt-1">{price(unit)} l&apos;unité</p>}

      <div className="mt-10">
        <div className="flex justify-between">
          <p className="eyebrow">Coloris</p>
          <p className="text-sm text-stone">
            {variant?.color_name} · {variant?.fabric}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setSelected(v.id);
                setMsg(null);
              }}
              title={`${v.color_name}${v.stock === 0 ? " — épuisé" : ""}`}
              aria-label={v.color_name}
              aria-pressed={selected === v.id}
              className={`relative size-11 rounded-full border transition ${selected === v.id ? "border-ink ring-1 ring-ink ring-offset-4 ring-offset-paper" : "border-line"} ${v.stock === 0 ? "opacity-40" : ""}`}
              style={{ background: v.color_hex }}
            >
              {v.price_delta > 0 && (
                <span className="absolute -top-2 -right-3 text-[0.6rem] bg-paper border border-line px-1">+{v.price_delta}€</span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs mt-4 h-4 text-stone">
          {variant && variant.stock === 0 && "Épuisé — disponible sur commande prochainement."}
          {variant && variant.stock > 0 && variant.stock <= 3 && `Plus que ${variant.stock} en stock.`}
          {variant && variant.stock > 3 && "En stock — fabrication sous quelques semaines."}
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <div className="flex items-center border border-ink">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 h-full" aria-label="Diminuer">
            −
          </button>
          <span className="w-8 text-center text-sm" aria-live="polite">
            {qty}
          </span>
          <button
            onClick={() => setQty(Math.min(qty + 1, variant?.stock || 1, 10))}
            className="px-4 h-full"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>
        <button onClick={submit} disabled={pending || soldOut} className="btn btn-solid flex-1">
          {pending ? "Ajout…" : soldOut ? "Épuisé" : "Ajouter au panier"}
        </button>
      </div>

      {msg && (
        <div className={`mt-4 text-sm flex justify-between items-center ${msg.type === "error" ? "text-danger" : ""}`}>
          <span>{msg.text}</span>
          {msg.type === "ok" && (
            <Link href="/panier" className="eyebrow link-underline">
              Voir le panier →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
