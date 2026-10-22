import Link from "next/link";
import RevenueChart from "@/components/admin/RevenueChart";
import { price, shortDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

type Kpis = {
  period_days: number;
  revenue: number; revenue_prev: number; orders: number; orders_prev: number; aov: number;
  customers_total: number; customers_new: number; visitors: number; product_views: number;
  add_to_cart: number; conversion_rate: number; abandoned_carts: number; abandoned_value: number; newsletter: number;
  series: { day: string; revenue: number; orders: number }[];
  top_products: { name: string; units: number; revenue: number }[];
  most_viewed: { name: string; views: number }[];
  orders_by_status: Partial<Record<OrderStatus, number>>;
  low_stock: { name: string; label: string; sku: string; stock: number }[];
  recent_orders: { id: string; order_number: string; status: OrderStatus; total: number; created_at: string; customer: string }[];
};

const PERIODS = [7, 30, 90];

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev) return <span className="text-xs text-stone">—</span>;
  const d = ((cur - prev) / prev) * 100;
  return (
    <span className={`text-xs ${d >= 0 ? "text-success" : "text-danger"}`}>
      {d >= 0 ? "▲" : "▼"} {Math.abs(d).toFixed(0)} % vs période préc.
    </span>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  const days = PERIODS.includes(Number((await searchParams).periode)) ? Number((await searchParams).periode) : 30;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_kpis", { p_days: days });
  if (error) return <p className="text-danger">{error.message}</p>;
  const k = data as Kpis;

  const tiles = [
    { label: "Chiffre d'affaires", value: price(k.revenue), sub: <Delta cur={k.revenue} prev={k.revenue_prev} /> },
    { label: "Commandes", value: k.orders, sub: <Delta cur={k.orders} prev={k.orders_prev} /> },
    { label: "Panier moyen", value: price(k.aov), sub: <span className="text-xs text-stone">par commande</span> },
    { label: "Taux de conversion", value: `${k.conversion_rate} %`, sub: <span className="text-xs text-stone">{k.visitors} visiteurs uniques</span> },
    { label: "Clients", value: k.customers_total, sub: <span className="text-xs text-stone">+{k.customers_new} sur la période</span> },
    { label: "Ajouts au panier", value: k.add_to_cart, sub: <span className="text-xs text-stone">{k.product_views} vues produit</span> },
    { label: "Paniers abandonnés", value: k.abandoned_carts, sub: <span className="text-xs text-stone">{price(k.abandoned_value)} en attente</span> },
    { label: "Newsletter", value: k.newsletter, sub: <span className="text-xs text-stone">inscrits</span> },
  ];

  const statusTotal = Object.values(k.orders_by_status).reduce((s, n) => s + (n ?? 0), 0) || 1;
  const maxTop = Math.max(...k.top_products.map((p) => Number(p.revenue)), 1);

  return (
    <div className="space-y-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-5xl">Indicateurs clés</h1>
        <div className="flex border border-ink">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin?periode=${p}`}
              className={`eyebrow px-4 py-2 ${p === days ? "bg-ink text-paper" : ""}`}
            >
              {p} jours
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-line">
        {tiles.map((t) => (
          <div key={t.label} className="border-r border-b border-line p-6">
            <p className="eyebrow text-stone">{t.label}</p>
            <p className="display text-3xl md:text-4xl mt-3">{t.value}</p>
            <div className="mt-2">{t.sub}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="eyebrow mb-6">Chiffre d&apos;affaires par jour — {days} derniers jours</h2>
        <RevenueChart data={k.series} />
      </section>

      <div className="grid lg:grid-cols-2 gap-16">
        <section>
          <h2 className="eyebrow mb-6">Meilleures ventes (CA)</h2>
          <ul className="space-y-4">
            {k.top_products.map((p) => (
              <li key={p.name}>
                <div className="flex justify-between text-sm">
                  <span>{p.name} <span className="text-stone">· {p.units} vendus</span></span>
                  <span>{price(p.revenue)}</span>
                </div>
                <div className="h-1.5 bg-ivory mt-2">
                  <div className="h-full bg-ink rounded-r-[4px]" style={{ width: `${(Number(p.revenue) / maxTop) * 100}%` }} />
                </div>
              </li>
            ))}
            {!k.top_products.length && <li className="text-sm text-stone">Aucune vente sur la période.</li>}
          </ul>
        </section>

        <section>
          <h2 className="eyebrow mb-6">Commandes par statut</h2>
          <ul className="space-y-4">
            {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => {
              const n = k.orders_by_status[s] ?? 0;
              return (
                <li key={s}>
                  <div className="flex justify-between text-sm">
                    <span>{STATUS_LABEL[s]}</span>
                    <span>{n}</span>
                  </div>
                  <div className="h-1.5 bg-ivory mt-2">
                    <div className="h-full bg-ink rounded-r-[4px]" style={{ width: `${(n / statusTotal) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
        <section className="lg:col-span-2">
          <div className="flex justify-between mb-6">
            <h2 className="eyebrow">Dernières commandes</h2>
            <Link href="/admin/commandes" className="eyebrow link-underline">Tout voir</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone border-b border-line">
                <th className="py-3 font-normal">N°</th>
                <th className="py-3 font-normal">Client</th>
                <th className="py-3 font-normal hidden sm:table-cell">Date</th>
                <th className="py-3 font-normal">Statut</th>
                <th className="py-3 font-normal text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {k.recent_orders.map((o) => (
                <tr key={o.id} className="border-b border-line">
                  <td className="py-3">{o.order_number}</td>
                  <td className="py-3">{o.customer}</td>
                  <td className="py-3 hidden sm:table-cell text-stone">{shortDate(o.created_at)}</td>
                  <td className="py-3">{STATUS_LABEL[o.status]}</td>
                  <td className="py-3 text-right">{price(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="space-y-12">
          <section>
            <h2 className="eyebrow mb-6">Stock faible</h2>
            <ul className="text-sm divide-y divide-line border-y border-line">
              {k.low_stock.map((v) => (
                <li key={v.sku} className="py-3 flex justify-between">
                  <span>{v.name} <span className="text-stone">· {v.label}</span></span>
                  <span className={v.stock === 0 ? "text-danger" : ""}>{v.stock === 0 ? "Épuisé" : v.stock}</span>
                </li>
              ))}
              {!k.low_stock.length && <li className="py-3 text-stone">Rien à signaler.</li>}
            </ul>
          </section>
          <section>
            <h2 className="eyebrow mb-6">Pièces les plus vues</h2>
            <ol className="text-sm space-y-2">
              {k.most_viewed.map((p, i) => (
                <li key={p.name} className="flex justify-between">
                  <span><span className="text-stone mr-3">{i + 1}.</span>{p.name}</span>
                  <span className="text-stone">{p.views} vues</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
