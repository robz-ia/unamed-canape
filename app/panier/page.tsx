import type { Metadata } from "next";
import Link from "next/link";
import CartLineRow from "@/components/CartLineRow";
import { cartSubtotal, getCart, getUser, shippingFor } from "@/lib/data";
import { price } from "@/lib/format";

export const metadata: Metadata = { title: "Panier" };

export default async function Panier() {
  const user = await getUser();
  const lines = await getCart();
  const subtotal = cartSubtotal(lines);
  const shipping = shippingFor(subtotal);

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16">
      <h1 className="display text-5xl md:text-7xl">Votre panier</h1>

      {!user ? (
        <div className="mt-16 py-24 text-center border-y border-line">
          <p className="text-stone">Connectez-vous pour retrouver votre panier, sur tous vos appareils.</p>
          <Link href="/connexion?next=/panier" className="btn btn-solid mt-8">
            Se connecter
          </Link>
        </div>
      ) : lines.length === 0 ? (
        <div className="mt-16 py-24 text-center border-y border-line">
          <p className="text-stone">Votre panier est vide pour l&apos;instant.</p>
          <Link href="/boutique" className="btn btn-ghost mt-8">
            Découvrir la collection
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid lg:grid-cols-[1fr_380px] gap-16">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((l, i) => (
              <CartLineRow key={l.id} line={l} index={i} />
            ))}
          </ul>
          <aside className="bg-ivory p-8 self-start lg:sticky lg:top-36">
            <p className="eyebrow">Récapitulatif</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt>Sous-total</dt>
                <dd>{price(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Livraison & installation</dt>
                <dd>{shipping === 0 ? "Offertes" : price(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 mt-4 text-base">
                <dt className="display text-2xl">Total</dt>
                <dd className="display text-2xl">{price(subtotal + shipping)}</dd>
              </div>
            </dl>
            <p className="text-xs text-stone mt-3">Code promo applicable à l&apos;étape suivante.</p>
            <Link href="/commande" className="btn btn-solid w-full mt-8">
              Passer commande
            </Link>
            <ul className="mt-8 space-y-2 text-xs text-stone">
              <li>— Paiement sécurisé, 3 fois sans frais</li>
              <li>— Retours gratuits sous 30 jours</li>
              <li>— Panier sauvegardé sur votre compte</li>
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
