"use client";

import { useState, useTransition } from "react";
import { adminToggleProduct, adminUpdateStock } from "@/app/actions";

export function StockInput({ variantId, stock }: { variantId: string; stock: number }) {
  const [value, setValue] = useState(stock);
  const [pending, start] = useTransition();
  const dirty = value !== stock;
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className={`w-16 border px-2 py-1 text-sm bg-transparent ${value <= 3 ? "border-danger/40" : "border-line"}`}
        aria-label="Stock"
      />
      {dirty && (
        <button disabled={pending} onClick={() => start(async () => void (await adminUpdateStock(variantId, value)))} className="eyebrow !text-[0.6rem] link-underline">
          {pending ? "…" : "OK"}
        </button>
      )}
    </div>
  );
}

export function ProductToggle({ productId, field, value, label }: { productId: string; field: "is_active" | "is_featured"; value: boolean; label: string }) {
  const [pending, start] = useTransition();
  return (
    <label className={`flex items-center gap-2 text-sm ${pending ? "opacity-40" : ""}`}>
      <input
        type="checkbox"
        defaultChecked={value}
        onChange={(e) => start(async () => void (await adminToggleProduct(productId, field, e.target.checked)))}
        className="accent-ink"
      />
      {label}
    </label>
  );
}
