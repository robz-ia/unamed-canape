import Link from "next/link";
import { ProductToggle, StockInput } from "@/components/admin/StockInput";
import { price } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProducts() {
  const supabase = await createClient();
  const [{ data: products }, { data: sales }] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, base_price, is_active, is_featured, category:categories ( name ), variants:product_variants ( id, sku, color_name, color_hex, stock, price_delta, position )")
      .order("name"),
    supabase.from("order_items").select("product_id, quantity, line_total"),
  ]);

  const stats = new Map<string, { units: number; revenue: number }>();
  sales?.forEach((s) => {
    if (!s.product_id) return;
    const cur = stats.get(s.product_id) ?? { units: 0, revenue: 0 };
    stats.set(s.product_id, { units: cur.units + s.quantity, revenue: cur.revenue + Number(s.line_total) });
  });

  return (
    <div>
      <h1 className="display text-5xl">Produits & stock</h1>
      <div className="mt-10 space-y-6">
        {products?.map((p) => {
          const st = stats.get(p.id);
          return (
            <div key={p.id} className="border border-line p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <Link href={`/produit/${p.slug}`} className="display text-3xl">{p.name}</Link>
                  <p className="text-sm text-stone mt-1">
                    {(p.category as unknown as { name: string })?.name} · {price(p.base_price)} · {st?.units ?? 0} vendus · {price(st?.revenue ?? 0)}
                  </p>
                </div>
                <div className="flex gap-6">
                  <ProductToggle productId={p.id} field="is_active" value={p.is_active} label="En ligne" />
                  <ProductToggle productId={p.id} field="is_featured" value={p.is_featured} label="Mise en avant" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[...p.variants].sort((a, b) => a.position - b.position).map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-3 bg-ivory px-4 py-3">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="size-3 rounded-full border border-line" style={{ background: v.color_hex }} />
                      {v.color_name}
                      <span className="text-xs text-stone">{v.sku}</span>
                    </span>
                    <StockInput variantId={v.id} stock={v.stock} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
