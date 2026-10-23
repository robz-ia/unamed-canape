import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import ProductImage from "@/components/ProductImage";
import { getUser } from "@/lib/data";
import { date, price } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

type ShippingAddress = {
  full_name: string;
  line1: string;
  line2?: string | null;
  postal_code: string;
  city: string;
  country?: string;
  phone?: string | null;
};

const dateTime = (d: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("order_number").eq("id", id).maybeSingle();
  return { title: order ? `Commande ${order.order_number}` : "Commande" };
}

export default async function CommandeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/connexion?next=/compte/commandes/${id}`);

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, subtotal, discount, shipping, total, coupon_code, created_at, shipping_address,
      order_items ( product_name, variant_label, image_url, unit_price, quantity, line_total ),
      order_status_history ( status, changed_at )`
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const addr = order.shipping_address as ShippingAddress;
  const history = [...(order.order_status_history ?? [])].sort((a, b) =>
    a.changed_at.localeCompare(b.changed_at)
  );
  const status = order.status as OrderStatus;

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-32 md:pt-40">
      <Link href="/compte" className="eyebrow link-underline text-stone">
        Mon compte
      </Link>

      <SplitReveal
        as="h1"
        immediate
        text="Suivi de *commande.*"
        className="display text-5xl md:text-7xl mt-8"
      />

      <Reveal delay={0.15} y={16}>
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-8">
          <div>
            <p className="eyebrow">{order.order_number}</p>
            <p className="text-stone mt-2">{date(order.created_at)}</p>
          </div>
          <p className="eyebrow">{STATUS_LABEL[status]}</p>
        </div>
      </Reveal>

      <div className="mt-14 grid lg:grid-cols-[1fr_380px] gap-16 lg:gap-20">
        <div className="space-y-16">
          <section>
            <h2 className="display text-3xl">Articles</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {order.order_items.map((item, i) => (
                <Reveal
                  key={i}
                  as="li"
                  delay={0.1 + i * 0.08}
                  y={20}
                  className="py-8 grid grid-cols-[96px_1fr] sm:grid-cols-[140px_1fr_auto] gap-6 items-center"
                >
                  <ProductImage
                    src={item.image_url ?? undefined}
                    alt={item.product_name}
                    seed={i}
                    sizes="140px"
                    className="aspect-square"
                  />
                  <div>
                    <p className="display text-2xl">{item.product_name}</p>
                    <p className="text-sm text-stone mt-1">{item.variant_label}</p>
                    <p className="text-sm mt-2">
                      {price(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="display text-xl sm:text-right">{price(item.line_total)}</p>
                </Reveal>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="display text-3xl">Historique</h2>
            {history.length === 0 ? (
              <p className="text-stone mt-6">Aucun changement de statut enregistré.</p>
            ) : (
              <ol className="mt-8 border-l border-line ml-2 pl-8 space-y-8">
                {history.map((entry, i) => (
                  <Reveal key={i} as="li" delay={0.1 + i * 0.08} y={16} className="relative">
                    <span className="absolute -left-[calc(2rem+5px)] top-1.5 size-2.5 rounded-full bg-ink border-2 border-paper" />
                    <p className="eyebrow">{STATUS_LABEL[entry.status as OrderStatus]}</p>
                    <p className="text-sm text-stone mt-1">{dateTime(entry.changed_at)}</p>
                  </Reveal>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-36 self-start">
          <Reveal delay={0.2} className="bg-ivory p-8">
            <p className="eyebrow">Livraison</p>
            <address className="mt-4 text-sm not-italic leading-relaxed">
              <span className="block">{addr.full_name}</span>
              <span className="block mt-2 text-stone">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
                <br />
                {addr.postal_code} {addr.city}
                {addr.country ? `, ${addr.country}` : ""}
              </span>
              {addr.phone && <span className="block mt-2 text-stone">{addr.phone}</span>}
            </address>
          </Reveal>

          <Reveal delay={0.28} className="bg-ivory p-8">
            <p className="eyebrow">Récapitulatif</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt>Sous-total</dt>
                <dd>{price(order.subtotal)}</dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-stone">
                  <dt>
                    Réduction
                    {order.coupon_code ? ` (${order.coupon_code})` : ""}
                  </dt>
                  <dd>− {price(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Livraison & installation</dt>
                <dd>{Number(order.shipping) === 0 ? "Offertes" : price(order.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 mt-4 text-base">
                <dt className="display text-2xl">Total</dt>
                <dd className="display text-2xl">{price(order.total)}</dd>
              </div>
            </dl>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
