import StatusSelect from "@/components/admin/StatusSelect";
import { date, price } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";
import Link from "next/link";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const supabase = await createClient();
  let q = supabase
    .from("orders")
    .select("id, order_number, status, total, discount, coupon_code, created_at, shipping_address, customer:profiles ( email, first_name, last_name ), order_items ( quantity, product_name, variant_label )")
    .order("created_at", { ascending: false })
    .limit(100);
  if (statut && statut in STATUS_LABEL) q = q.eq("status", statut);
  const { data: orders } = await q;

  return (
    <div>
      <h1 className="display text-5xl">Commandes</h1>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
        <Link href="/admin/commandes" className={`eyebrow ${!statut ? "underline underline-offset-8" : "text-stone"}`}>Toutes</Link>
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
          <Link key={s} href={`/admin/commandes?statut=${s}`} className={`eyebrow ${statut === s ? "underline underline-offset-8" : "text-stone"}`}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto mt-8">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-stone border-b border-line">
              <th className="py-3 font-normal">N°</th>
              <th className="py-3 font-normal">Client</th>
              <th className="py-3 font-normal">Articles</th>
              <th className="py-3 font-normal">Date</th>
              <th className="py-3 font-normal text-right">Total</th>
              <th className="py-3 font-normal text-right">Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => {
              const c = o.customer as unknown as { email: string; first_name: string | null; last_name: string | null };
              const addr = o.shipping_address as { city: string };
              return (
                <tr key={o.id} className="border-b border-line align-top">
                  <td className="py-4">{o.order_number}</td>
                  <td className="py-4">
                    {[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email}
                    <p className="text-xs text-stone">{c.email} · {addr.city}</p>
                  </td>
                  <td className="py-4">
                    {o.order_items.map((i, k) => (
                      <p key={k}>{i.quantity} × {i.product_name} <span className="text-stone">({i.variant_label})</span></p>
                    ))}
                  </td>
                  <td className="py-4 text-stone">{date(o.created_at)}</td>
                  <td className="py-4 text-right">
                    {price(o.total)}
                    {o.coupon_code && <p className="text-xs text-stone">{o.coupon_code}</p>}
                  </td>
                  <td className="py-4 text-right">
                    <StatusSelect orderId={o.id} status={o.status as OrderStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!orders?.length && <p className="text-stone py-10">Aucune commande.</p>}
      </div>
    </div>
  );
}
