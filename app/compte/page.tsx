import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import ProfileForm from "@/components/ProfileForm";
import { getUser } from "@/lib/data";
import { date, price, shortDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Mon compte" };

const STEPS: OrderStatus[] = ["paid", "preparing", "shipped", "delivered"];
const EVENT_LABEL = { add: "Ajout", update: "Quantité modifiée", remove: "Retrait", checkout: "Commandé" } as const;

export default async function Compte() {
  const user = await getUser();
  if (!user) redirect("/connexion?next=/compte");
  const supabase = await createClient();

  const [{ data: orders }, { data: events }, { data: addresses }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, status, total, discount, created_at, order_items ( product_name, variant_label, quantity, line_total )")
      .order("created_at", { ascending: false }),
    supabase
      .from("cart_events")
      .select("id, event, quantity, created_at, variant:product_variants ( color_name, product:products ( name, slug ) )")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("addresses").select("id, full_name, line1, postal_code, city, is_default").order("is_default", { ascending: false }),
  ]);

  const spent = (orders ?? []).filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-stone">Client depuis le {date(user.created_at)}</p>
          <h1 className="display text-5xl md:text-7xl mt-3">Bonjour {user.first_name ?? ""}.</h1>
        </div>
        <form action={signOut}>
          <button className="eyebrow link-underline">Se déconnecter</button>
        </form>
      </div>

      <div className="grid grid-cols-3 border-y border-line mt-12 divide-x divide-line">
        {[
          ["Commandes", String(orders?.length ?? 0)],
          ["Montant total", price(spent)],
          ["Adresses", String(addresses?.length ?? 0)],
        ].map(([l, v]) => (
          <div key={l} className="py-6 px-4 md:px-8">
            <p className="eyebrow text-stone">{l}</p>
            <p className="display text-3xl md:text-4xl mt-2">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-16 mt-16">
        <section>
          <h2 className="display text-3xl">Mes commandes</h2>
          {!orders?.length && (
            <p className="text-stone mt-6">
              Aucune commande pour le moment. <Link href="/boutique" className="underline underline-offset-4 text-ink">Découvrir la collection</Link>
            </p>
          )}
          <ul className="mt-6 space-y-6">
            {orders?.map((o) => {
              const step = STEPS.indexOf(o.status as OrderStatus);
              return (
                <li key={o.id} className="border border-line p-6 md:p-8">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="eyebrow">{o.order_number}</p>
                      <p className="text-sm text-stone mt-1">{date(o.created_at)}</p>
                    </div>
                    <p className="display text-2xl">{price(o.total)}</p>
                  </div>
                  <ul className="mt-5 text-sm space-y-1">
                    {o.order_items.map((i, k) => (
                      <li key={k} className="flex justify-between">
                        <span>{i.quantity} × {i.product_name} <span className="text-stone">— {i.variant_label}</span></span>
                        <span>{price(i.line_total)}</span>
                      </li>
                    ))}
                  </ul>
                  {o.status === "cancelled" ? (
                    <p className="eyebrow text-danger mt-6">Commande annulée</p>
                  ) : (
                    <ol className="mt-7 grid grid-cols-4 gap-2">
                      {STEPS.map((s, i) => (
                        <li key={s}>
                          <div className={`h-px ${i <= step ? "bg-ink" : "bg-line"}`} />
                          <p className={`eyebrow !text-[0.6rem] mt-2 ${i <= step ? "" : "text-stone"}`}>{STATUS_LABEL[s]}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-14">
          <section>
            <h2 className="display text-3xl">Mes informations</h2>
            <div className="mt-4">
              <ProfileForm profile={user} />
            </div>
          </section>

          {!!addresses?.length && (
            <section>
              <h2 className="display text-3xl">Adresses</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {addresses.map((a) => (
                  <li key={a.id} className="border-b border-line pb-3">
                    {a.full_name} — {a.line1}, {a.postal_code} {a.city}
                    {a.is_default && <span className="eyebrow ml-2 text-stone">Par défaut</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="display text-3xl">Historique du panier</h2>
            <ul className="mt-4 text-sm divide-y divide-line">
              {events?.map((e) => {
                const v = e.variant as unknown as { color_name: string; product: { name: string; slug: string } } | null;
                return (
                  <li key={e.id} className="py-3 flex justify-between gap-4">
                    <span>
                      <span className="eyebrow !text-[0.6rem] text-stone mr-2">{EVENT_LABEL[e.event as keyof typeof EVENT_LABEL]}</span>
                      {v ? <Link href={`/produit/${v.product.slug}`}>{v.product.name} · {v.color_name}</Link> : "Pièce retirée"}
                      {e.event !== "remove" && <span className="text-stone"> × {e.quantity}</span>}
                    </span>
                    <span className="text-stone shrink-0">{shortDate(e.created_at)}</span>
                  </li>
                );
              })}
              {!events?.length && <li className="py-3 text-stone">Aucune activité.</li>}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
