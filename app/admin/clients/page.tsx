import { date, price } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCustomers() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, created_at, orders ( total, status, created_at ), carts ( cart_items ( quantity ) )")
    .order("created_at", { ascending: false });

  const rows = (customers ?? []).map((c) => {
    const valid = c.orders.filter((o) => o.status !== "cancelled");
    const cart = (c.carts as unknown as { cart_items: { quantity: number }[] } | null)?.cart_items ?? [];
    return {
      ...c,
      count: valid.length,
      ltv: valid.reduce((s, o) => s + Number(o.total), 0),
      last: valid.map((o) => o.created_at).sort().at(-1),
      inCart: cart.reduce((s, i) => s + i.quantity, 0),
    };
  });

  return (
    <div>
      <h1 className="display text-5xl">Clients</h1>
      <p className="text-stone mt-3">{rows.length} comptes · valeur vie client moyenne {price(rows.length ? rows.reduce((s, r) => s + r.ltv, 0) / rows.length : 0)}</p>
      <div className="overflow-x-auto mt-8">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-stone border-b border-line">
              <th className="py-3 font-normal">Client</th>
              <th className="py-3 font-normal">Inscrit le</th>
              <th className="py-3 font-normal text-right">Commandes</th>
              <th className="py-3 font-normal text-right">Valeur vie client</th>
              <th className="py-3 font-normal text-right">Dans le panier</th>
              <th className="py-3 font-normal text-right">Dernier achat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line">
                <td className="py-3">
                  {[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}
                  {r.role === "admin" && <span className="eyebrow !text-[0.6rem] ml-2 text-stone">Admin</span>}
                  <p className="text-xs text-stone">{r.email}</p>
                </td>
                <td className="py-3 text-stone">{date(r.created_at)}</td>
                <td className="py-3 text-right">{r.count}</td>
                <td className="py-3 text-right">{price(r.ltv)}</td>
                <td className="py-3 text-right">{r.inCart || "—"}</td>
                <td className="py-3 text-right text-stone">{r.last ? date(r.last) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
