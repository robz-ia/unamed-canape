// Génère un historique réaliste (clients, commandes, vues, paniers) pour que le
// tableau de bord admin ait des KPIs parlants lors de la démo.
// Usage : node --env-file=.env.local scripts/seed-demo.mjs
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const FIRST = ["Camille", "Louis", "Inès", "Hugo", "Léa", "Arthur", "Jeanne", "Gabriel", "Chloé", "Raphaël", "Alice", "Jules"];
const LAST = ["Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefèvre", "Roux", "Fournier", "Girard", "Bonnet"];
const CITIES = [["75011", "Paris"], ["69002", "Lyon"], ["33000", "Bordeaux"], ["13008", "Marseille"], ["44000", "Nantes"], ["75016", "Paris"]];

const rand = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rand(a.length)];
const daysAgo = (d) => new Date(Date.now() - d * 864e5 - rand(864e5)).toISOString();

const { data: variants, error } = await supabase
  .from("product_variants")
  .select("id, color_name, fabric, price_delta, product:products ( id, name, base_price, images:product_images ( url, position ) )");
if (error) throw error;

// 1. Clients de démonstration
const password = process.env.DEMO_PASSWORD ?? randomUUID();
const customers = [];
for (let i = 0; i < FIRST.length; i++) {
  const email = `demo.${FIRST[i].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@unamedcanape.test`;
  const { data } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: FIRST[i], last_name: LAST[i] },
  });
  let id = data?.user?.id;
  if (!id) {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    id = list.users.find((u) => u.email === email)?.id;
  }
  if (id) {
    customers.push({ id, name: `${FIRST[i]} ${LAST[i]}` });
    await supabase.from("profiles").update({ created_at: daysAgo(20 + rand(70)) }).eq("id", id);
  }
}
console.log(`✓ ${customers.length} clients`);

// 2. Commandes sur 90 jours (plus denses récemment)
const STATUSES = ["delivered", "delivered", "shipped", "preparing", "paid", "cancelled"];
let orders = 0;
for (let i = 0; i < 46; i++) {
  const c = pick(customers);
  const age = Math.floor(Math.pow(Math.random(), 1.6) * 89);
  const lines = Array.from({ length: Math.random() < 0.15 ? 2 : 1 }, () => pick(variants));
  const subtotal = lines.reduce((s, v) => s + Number(v.product.base_price) + Number(v.price_delta), 0);
  const discount = Math.random() < 0.2 ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal - discount >= 1500 ? 0 : 149;
  const [postal_code, city] = pick(CITIES);
  const status = age < 4 ? pick(["paid", "preparing"]) : age < 12 ? pick(["preparing", "shipped", "delivered"]) : pick(STATUSES);

  const { data: order, error: oe } = await supabase
    .from("orders")
    .insert({
      user_id: c.id,
      status,
      subtotal,
      discount,
      shipping,
      total: subtotal - discount + shipping,
      coupon_code: discount ? "BIENVENUE10" : null,
      shipping_address: { full_name: c.name, line1: `${1 + rand(80)} rue de la Paix`, postal_code, city, country: "France" },
      created_at: daysAgo(age),
    })
    .select("id")
    .single();
  if (oe) throw oe;
  await supabase.from("order_items").insert(
    lines.map((v) => ({
      order_id: order.id,
      product_id: v.product.id,
      variant_id: v.id,
      product_name: v.product.name,
      variant_label: `${v.color_name} · ${v.fabric}`,
      image_url: v.product.images.sort((a, b) => a.position - b.position)[0]?.url,
      unit_price: Number(v.product.base_price) + Number(v.price_delta),
      quantity: 1,
    }))
  );
  orders++;
}
console.log(`✓ ${orders} commandes`);

// 3. Vues produit (visiteurs anonymes + clients) et événements panier
const products = [...new Map(variants.map((v) => [v.product.id, v.product])).values()];
const views = Array.from({ length: 900 }, () => {
  const age = Math.floor(Math.pow(Math.random(), 1.3) * 89);
  return { product_id: pick(products).id, session_id: `demo-${rand(380)}`, viewed_at: daysAgo(age) };
});
for (let i = 0; i < views.length; i += 300) await supabase.from("product_views").insert(views.slice(i, i + 300));
const events = Array.from({ length: 120 }, () => ({
  user_id: pick(customers).id,
  variant_id: pick(variants).id,
  event: "add",
  quantity: 1,
  created_at: daysAgo(rand(60)),
}));
await supabase.from("cart_events").insert(events);
console.log(`✓ ${views.length} vues, ${events.length} ajouts panier`);

// 4. Inscriptions newsletter
await supabase
  .from("newsletter_subscribers")
  .upsert(Array.from({ length: 64 }, (_, i) => ({ email: `lettre${i}@exemple.fr`, source: "demo", created_at: daysAgo(rand(90)) })));
console.log("✓ newsletter — terminé.");
