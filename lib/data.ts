import { unstable_rethrow } from "next/navigation";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/lib/catalog";
import { readGuestCart } from "@/lib/guest-cart";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { CartLine, Category, Product } from "@/lib/types";

const PRODUCT_SELECT = `
  id, slug, name, tagline, description, story, base_price, compare_at_price,
  width_cm, depth_cm, height_cm, seat_height_cm, seats, materials, frame,
  lead_time_weeks, option1_name, option2_name, is_featured,
  category:categories!products_category_id_fkey ( slug, name ),
  memberships:product_categories ( option1, category:categories ( slug ) ),
  images:product_images ( id, url, alt, option1, option2, on_white, position ),
  variants:product_variants ( id, sku, option1, option2, swatch_hex, price_delta, stock, is_default, position )
`;

type RawMembership = { option1: string | null; category: { slug: string } | null };

function normalize(raw: Product): Product {
  const p = raw as unknown as Omit<Product, "memberships"> & { memberships: RawMembership[] };
  return {
    ...p,
    memberships: (p.memberships ?? []).map((m) => ({ slug: m.category?.slug ?? "", option1: m.option1 })),
    base_price: Number(p.base_price),
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    images: [...p.images].sort((a, b) => a.position - b.position),
    variants: [...p.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ ...v, price_delta: Number(v.price_delta) })),
  };
}

function fallbackProducts(opts: { category?: string; sort?: string; featured?: boolean }) {
  let list = FALLBACK_PRODUCTS.filter((p) => !opts.featured || p.is_featured)
    .filter((p) => !opts.category || p.memberships.some((m) => m.slug === opts.category))
    .map((p) => ({ ...p, focus: p.memberships.find((m) => m.slug === opts.category)?.option1 ?? null }));
  if (opts.sort === "prix-asc") list = [...list].sort((a, b) => a.base_price - b.base_price);
  else if (opts.sort === "prix-desc") list = [...list].sort((a, b) => b.base_price - a.base_price);
  else list = [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  return list;
}

export async function getProducts(opts: { category?: string; sort?: string; featured?: boolean } = {}) {
  if (!SUPABASE_CONFIGURED) return fallbackProducts(opts);
  try {
    return await fetchProducts(opts);
  } catch (error) {
    unstable_rethrow(error); // signaux internes de Next (rendu dynamique…) : ne pas les avaler
    console.error("Catalogue Supabase indisponible, catalogue local utilisé :", error);
    return fallbackProducts(opts);
  }
}

async function fetchProducts(opts: { category?: string; sort?: string; featured?: boolean }) {
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  if (opts.featured) query = query.eq("is_featured", true);
  // Appartenance n-n : un produit peut figurer dans plusieurs catégories
  let focus = new Map<string, string | null>();
  if (opts.category) {
    const { data: links } = await supabase
      .from("product_categories")
      .select("product_id, option1, category:categories!inner ( slug )")
      .eq("category.slug", opts.category);
    focus = new Map((links ?? []).map((l) => [l.product_id as string, l.option1 as string | null]));
    query = query.in("id", [...focus.keys()]);
  }

  if (opts.sort === "prix-asc") query = query.order("base_price", { ascending: true });
  else if (opts.sort === "prix-desc") query = query.order("base_price", { ascending: false });
  else query = query.order("is_featured", { ascending: false }).order("created_at");

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as Product[]).map(normalize).map((p) => ({ ...p, focus: focus.get(p.id) ?? null }));
}

export async function getProduct(slug: string) {
  const local = () => FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  if (!SUPABASE_CONFIGURED) return local();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) return local();
  return data ? normalize(data as unknown as Product) : null;
}

export async function getCategories() {
  if (!SUPABASE_CONFIGURED) return FALLBACK_CATEGORIES;
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, slug, name, description, cover_url").order("position");
  if (error) return FALLBACK_CATEGORIES;
  return (data ?? []) as Category[];
}

export async function getUser() {
  if (!SUPABASE_CONFIGURED) return null;
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

// Lignes du cookie qui existent encore dans le catalogue (les autres sont ignorées)
export async function validGuestLines() {
  const lines = await readGuestCart();
  if (!lines.length) return lines;
  const ids = new Set((await getProducts()).flatMap((p) => p.variants.map((v) => v.id)));
  return lines.filter((l) => ids.has(l.v));
}

export async function getCartCount() {
  const guest = async () => (await validGuestLines()).reduce((s, l) => s + l.q, 0);
  if (!SUPABASE_CONFIGURED) return guest();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return guest();
  const { data } = await supabase.from("carts").select("cart_items ( quantity )").eq("user_id", user.id).maybeSingle();
  const items = (data?.cart_items ?? []) as { quantity: number }[];
  return items.reduce((s, i) => s + i.quantity, 0);
}

// Lignes du panier invité, reconstituées à partir du catalogue
async function guestCartLines(): Promise<CartLine[]> {
  const lines = await readGuestCart();
  if (!lines.length) return [];
  const products = await getProducts();
  return lines.flatMap((l) => {
    for (const p of products) {
      const v = p.variants.find((x) => x.id === l.v);
      if (v) {
        const product = { id: p.id, slug: p.slug, name: p.name, base_price: p.base_price, images: p.images };
        return [{ id: v.id, quantity: Math.min(l.q, Math.max(v.stock, 1)), variant: { ...v, product } }];
      }
    }
    return []; // variante disparue du catalogue
  });
}

export async function findVariant(variantId: string) {
  for (const p of await getProducts()) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) return v;
  }
  return null;
}

export async function getCart(): Promise<CartLine[]> {
  if (!SUPABASE_CONFIGURED) return guestCartLines();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return guestCartLines();
  const { data } = await supabase
    .from("carts")
    .select(
      `cart_items ( id, quantity, added_at,
        variant:product_variants ( id, sku, option1, option2, swatch_hex, price_delta, stock, is_default, position,
          product:products ( id, slug, name, base_price, images:product_images ( id, url, alt, option1, option2, on_white, position ) ) ) )`
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
