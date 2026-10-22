"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { removeCartItem, updateCartItem } from "@/app/actions";
import ProductImage from "./ProductImage";
import { price } from "@/lib/format";
import type { CartLine } from "@/lib/types";

export default function CartLineRow({ line, index }: { line: CartLine; index: number }) {
  const [pending, start] = useTransition();
  const [qty, setQty] = useOptimistic(line.quantity);
  const p = line.variant.product;
  const unit = p.base_price + line.variant.price_delta;
  const max = Math.min(line.variant.stock, 10);

  const change = (n: number) =>
    start(async () => {
      setQty(n);
      await updateCartItem(line.id, n);
    });

  return (
    <li className={`py-8 grid grid-cols-[96px_1fr] sm:grid-cols-[140px_1fr_auto] gap-6 transition-opacity ${pending ? "opacity-50" : ""}`}>
      <Link href={`/produit/${p.slug}`}>
        <ProductImage src={p.images[0]?.url} alt={p.name} seed={index} tone={line.variant.color_hex} sizes="140px" className="aspect-square" />
      </Link>
      <div>
        <Link href={`/produit/${p.slug}`} className="display text-2xl">
          {p.name}
        </Link>
        <p className="text-sm text-stone mt-1 flex items-center gap-2">
          <span className="size-3 rounded-full border border-line inline-block" style={{ background: line.variant.color_hex }} />
          {line.variant.color_name} · {line.variant.fabric}
        </p>
        <p className="text-sm mt-1">{price(unit)}</p>
        <div className="mt-5 flex items-center gap-6">
          <div className="flex items-center border border-line">
            <button onClick={() => change(qty - 1)} className="px-3 py-1.5" aria-label="Diminuer">
              −
            </button>
            <span className="w-7 text-center text-sm">{qty}</span>
            <button onClick={() => change(Math.min(qty + 1, max))} disabled={qty >= max} className="px-3 py-1.5 disabled:opacity-30" aria-label="Augmenter">
              +
            </button>
          </div>
          <button onClick={() => start(() => removeCartItem(line.id))} className="eyebrow text-stone hover:text-ink">
            Retirer
          </button>
        </div>
      </div>
      <p className="hidden sm:block display text-xl">{price(unit * qty)}</p>
    </li>
  );
}
