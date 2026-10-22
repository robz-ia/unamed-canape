import { createClient } from "@/lib/supabase/server";
import type { CartLine, Category, Product } from "@/lib/types";

const PRODUCT_SELECT = `
  id, slug, name, tagline, description, story, base_price, compare_at_price,
  width_cm, depth_cm, height_cm, seat_height_cm, seats, materials, frame,
  lead_time_weeks, is_featured,
  category:categories ( slug, name ),
  images:product_images ( id, url, alt, position ),
  variants:product_variants ( id, sku, color_name, color_hex, fabric, price_delta, stock, position )
`;

function normalize(p: Product): Product {
  return {
    ...p,
    base_price: Number(p.base_price),
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    images: [...p.images].sort((a, b) => a.position - b.position),
    variants: [...p.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ ...v, price_delta: Number(v.price_delta) })),
  };
}

export async function getProducts(opts: { category?: string; sort?: string; featured?: boolean } = {}) {
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  if (opts.featured) query = query.eq("is_featured", true);
  if (opts.category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", opts.category).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (opts.sort === "prix-asc") query = query.order("base_price", { ascending: true });
  else if (opts.sort === "prix-desc") query = query.order("base_price", { ascending: false });
  else query = query.order("is_featured", { ascending: false }).order("created_at");

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Product[]).map(normalize);
}

export async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  return data ? normalize(data as unknown as Product) : null;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, slug, name, description").order("position");
  return (data ?? []) as Category[];
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, role, created_at")
    .eq("id", user.id)
    .single();
  return profile as {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    role: "customer" | "admin";
    created_at: string;
  } | null;
}

export async function getCartCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase.from("carts").select("cart_items ( quantity )").eq("user_id", user.id).maybeSingle();
  const items = (data?.cart_items ?? []) as { quantity: number }[];
  return items.reduce((s, i) => s + i.quantity, 0);
}

export async function getCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("carts")
    .select(
      `cart_items ( id, quantity, added_at,
        variant:product_variants ( id, sku, color_name, color_hex, fabric, price_delta, stock, position,
          product:products ( id, slug, name, base_price, images:product_images ( id, url, alt, position ) ) ) )`
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const lines = ((data?.cart_items ?? []) as unknown as (CartLine & { added_at: string })[])
    .sort((a, b) => a.added_at.localeCompare(b.added_at))
    .map((l) => ({
      ...l,
      variant: {
        ...l.variant,
        price_delta: Number(l.variant.price_delta),
        product: {
          ...l.variant.product,
          base_price: Number(l.variant.product.base_price),
          images: [...l.variant.product.images].sort((a, b) => a.position - b.position),
        },
      },
    }));
  return lines;
}

export const lineUnit = (l: CartLine) => l.variant.product.base_price + l.variant.price_delta;
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((s, l) => s + lineUnit(l) * l.quantity, 0);
export const shippingFor = (amount: number) => (amount >= 1500 ? 0 : 149);
