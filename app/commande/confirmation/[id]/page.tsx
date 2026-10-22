import Link from "next/link";
import { notFound } from "next/navigation";
import { price } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function Confirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, total, shipping_address, order_items ( product_name, variant_label, quantity )")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();
  const addr = order.shipping_address as { full_name: string; line1: string; postal_code: string; city: string };

  return (
    <div className="mx-auto max-w-3xl px-5 pt-40 text-center">
      <p className="eyebrow text-stone">Commande {order.order_number}</p>
      <h1 className="display text-5xl md:text-7xl mt-6">Merci.</h1>
      <p className="mt-8 text-stone leading-relaxed">
        Votre commande de {price(order.total)} est confirmée. Nos artisans lancent la fabrication ; nous vous
        contacterons pour convenir d&apos;un créneau de livraison au {addr.line1}, {addr.postal_code} {addr.city}.
      </p>
      <ul className="mt-10 border-y border-line divide-y divide-line text-sm">
        {order.order_items.map((i, k) => (
          <li key={k} className="py-4 flex justify-between">
            <span>{i.product_name}</span>
            <span className="text-stone">{i.variant_label} × {i.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="mt-12 flex justify-center gap-4">
        <Link href="/compte" className="btn btn-solid">Suivre ma commande</Link>
        <Link href="/boutique" className="btn btn-ghost">Continuer</Link>
      </div>
    </div>
  );
}
