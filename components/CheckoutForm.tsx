"use client";

import { useActionState, useState, useTransition } from "react";
import { checkCoupon, placeOrder } from "@/app/actions";
import { price } from "@/lib/format";

type Address = { full_name: string; line1: string; line2: string | null; postal_code: string; city: string; country: string; phone: string | null };

export default function CheckoutForm({
  subtotal,
  defaultAddress,
  defaultName,
}: {
  subtotal: number;
  defaultAddress?: Address | null;
  defaultName: string;
}) {
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checking, startCheck] = useTransition();

  const discount = coupon?.discount ?? 0;
  const shipping = subtotal - discount >= 1500 ? 0 : 149;
  const total = subtotal - discount + shipping;

  const apply = () =>
    startCheck(async () => {
      setCouponError("");
      const res = await checkCoupon(code, subtotal);
      if ("error" in res) {
        setCoupon(null);
        setCouponError(res.error!);
      } else setCoupon(res as typeof coupon);
    });

  const a = defaultAddress;

  return (
    <form action={action} className="grid lg:grid-cols-[1fr_400px] gap-16">
      <div>
        <p className="eyebrow">1 — Livraison</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-6">
          <input name="full_name" required defaultValue={a?.full_name ?? defaultName} placeholder="Nom complet" className="field sm:col-span-2" />
          <input name="line1" required defaultValue={a?.line1} placeholder="Adresse" className="field sm:col-span-2" />
          <input name="line2" defaultValue={a?.line2 ?? ""} placeholder="Complément (étage, digicode…)" className="field sm:col-span-2" />
          <input name="postal_code" required defaultValue={a?.postal_code} placeholder="Code postal" inputMode="numeric" className="field" />
          <input name="city" required defaultValue={a?.city} placeholder="Ville" className="field" />
          <input name="country" defaultValue={a?.country ?? "France"} placeholder="Pays" className="field" />
          <input name="phone" defaultValue={a?.phone ?? ""} placeholder="Téléphone (pour le livreur)" className="field" />
          <textarea name="notes" rows={2} placeholder="Instructions de livraison (ascenseur, accès…)" className="field sm:col-span-2 resize-none" />
        </div>
        {!a && (
          <label className="flex items-center gap-3 mt-6 text-sm">
            <input type="checkbox" name="save_address" defaultChecked className="accent-ink" /> Enregistrer cette adresse
          </label>
        )}

        <p className="eyebrow mt-14">2 — Paiement</p>
        <div className="mt-6 border border-line p-6 text-sm text-stone leading-relaxed">
          Mode démonstration : aucun paiement réel n&apos;est effectué. La commande est enregistrée comme
          payée et le stock est mis à jour.
        </div>
      </div>

      <aside className="bg-ivory p-8 self-start lg:sticky lg:top-36">
        <p className="eyebrow">Code promo</p>
        <div className="flex gap-3 mt-3 border-b border-line">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="BIENVENUE10"
            className="flex-1 bg-transparent py-3 text-sm focus:outline-none"
          />
          <button type="button" onClick={apply} disabled={!code || checking} className="eyebrow disabled:opacity-40">
            {checking ? "…" : "Appliquer"}
          </button>
        </div>
        <input type="hidden" name="coupon" value={coupon?.code ?? ""} />
        {couponError && <p className="text-xs text-danger mt-2">{couponError}</p>}
        {coupon && <p className="text-xs text-success mt-2">{coupon.description}</p>}

        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Sous-total</dt><dd>{price(subtotal)}</dd></div>
          {discount > 0 && (
            <div className="flex justify-between text-success"><dt>Remise {coupon?.code}</dt><dd>− {price(discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt>Livraison & installation</dt><dd>{shipping === 0 ? "Offertes" : price(shipping)}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 mt-4">
            <dt className="display text-2xl">Total</dt>
            <dd className="display text-2xl">{price(total)}</dd>
          </div>
        </dl>

        {state?.error && <p className="text-sm text-danger mt-6">{state.error}</p>}
        <button disabled={pending} className="btn btn-solid w-full mt-8">
          {pending ? "Validation…" : `Confirmer — ${price(total)}`}
        </button>
      </aside>
    </form>
  );
}
