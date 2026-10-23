"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { findVariant, validGuestLines } from "@/lib/data";
import { readGuestCart, writeGuestCart } from "@/lib/guest-cart";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type FormState = { error?: string; ok?: string } | undefined;

const DEMO_ERROR = "Base de données non connectée (mode démo) : les comptes seront actifs une fois Supabase configuré.";

// Utilisateur connecté, ou null (invité / mode démo)
async function currentUser() {
  if (!SUPABASE_CONFIGURED) return { supabase: null, user: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// À la connexion : le panier invité rejoint le panier du compte
async function mergeGuestCart(supabase: Awaited<ReturnType<typeof createClient>>) {
  const lines = await validGuestLines();
  for (const l of lines) await supabase.rpc("add_to_cart", { p_variant_id: l.v, p_quantity: l.q });
  await writeGuestCart([]);
}

const safeNext = (next: FormDataEntryValue | null) => {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/compte";
};

// ---------------------------------------------------------------------
// Authentification
// ---------------------------------------------------------------------
export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  if (!SUPABASE_CONFIGURED) return { error: DEMO_ERROR };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password")),
  });
  if (error) return { error: "Identifiants incorrects." };
  await mergeGuestCart(supabase);
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  if (!SUPABASE_CONFIGURED) return { error: DEMO_ERROR };
  const password = String(formData.get("password"));
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")).trim(),
    password,
    options: {
      data: {
        first_name: String(formData.get("first_name")).trim(),
        last_name: String(formData.get("last_name")).trim(),
      },
    },
  });
  if (error) return { error: error.message.includes("registered") ? "Un compte existe déjà avec cet e-mail." : error.message };
  if (!data.session) return { ok: "Compte créé. Confirmez votre adresse e-mail pour vous connecter." };
  await mergeGuestCart(supabase);

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée." };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: String(formData.get("first_name")).trim() || null,
      last_name: String(formData.get("last_name")).trim() || null,
      phone: String(formData.get("phone")).trim() || null,
    })
    .eq("id", user.id);
  if (error) return { error: "Impossible d'enregistrer." };
  revalidatePath("/compte");
  return { ok: "Informations enregistrées." };
}

// ---------------------------------------------------------------------
// Panier
// ---------------------------------------------------------------------
export async function addToCart(variantId: string, quantity: number) {
  const { supabase, user } = await currentUser();

  if (supabase && user) {
    const { data, error } = await supabase.rpc("add_to_cart", { p_variant_id: variantId, p_quantity: quantity });
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { count: data as number };
  }

  // Invité : panier en cookie, mêmes règles que la base (stock, 10 max)
  const variant = await findVariant(variantId);
  if (!variant) return { error: "Cette configuration n'existe plus." };
  if (variant.stock === 0) return { error: "Cette configuration est momentanément épuisée." };
  const lines = await validGuestLines();
  const line = lines.find((l) => l.v === variantId);
  const qty = Math.min((line?.q ?? 0) + quantity, variant.stock, 10);
  const next = line ? lines.map((l) => (l.v === variantId ? { ...l, q: qty } : l)) : [...lines, { v: variantId, q: qty }];
  await writeGuestCart(next);
  revalidatePath("/", "layout");
  return { count: next.reduce((s, l) => s + l.q, 0) };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { supabase, user } = await currentUser();
  if (supabase && user) {
    if (quantity < 1) {
      await supabase.from("cart_items").delete().eq("id", itemId);
    } else {
      const { data: item } = await supabase.from("cart_items").select("variant:product_variants ( stock )").eq("id", itemId).single();
      const stock = (item?.variant as unknown as { stock: number } | null)?.stock ?? 10;
      await supabase.from("cart_items").update({ quantity: Math.min(quantity, stock, 10) }).eq("id", itemId);
    }
  } else {
    // Invité : l'identifiant de ligne est celui de la variante
    const variant = await findVariant(itemId);
    const lines = await readGuestCart();
    await writeGuestCart(
      quantity < 1 || !variant
        ? lines.filter((l) => l.v !== itemId)
        : lines.map((l) => (l.v === itemId ? { ...l, q: Math.min(quantity, variant.stock, 10) } : l))
    );
  }
  revalidatePath("/", "layout");
}

export async function removeCartItem(itemId: string) {
  return updateCartItem(itemId, 0);
}

export async function checkCoupon(code: string, subtotal: number) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_coupon", { p_code: code, p_subtotal: subtotal });
  if (error) return { error: error.message };
  const row = (data as { code: string; discount: number; description: string }[])[0];
  return { code: row.code, discount: Number(row.discount), description: row.description };
}

// ---------------------------------------------------------------------
// Commande
// ---------------------------------------------------------------------
export async function placeOrder(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/commande");

  const address = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    line1: String(formData.get("line1") ?? "").trim(),
    line2: String(formData.get("line2") ?? "").trim(),
    postal_code: String(formData.get("postal_code") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    country: String(formData.get("country") ?? "France").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };

  if (!/^\d{5}$/.test(address.postal_code) && address.country === "France") {
    return { error: "Code postal invalide." };
  }

  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_address: address,
    p_coupon: String(formData.get("coupon") ?? "") || null,
    p_notes: String(formData.get("notes") ?? "") || null,
  });
  if (error) return { error: error.message };

  if (formData.get("save_address") === "on") {
    const { count } = await supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    await supabase.from("addresses").insert({ ...address, user_id: user.id, is_default: !count });
  }

  revalidatePath("/", "layout");
  redirect(`/commande/confirmation/${orderId}`);
}

// ---------------------------------------------------------------------
// Analytics & newsletter
// ---------------------------------------------------------------------
async function sessionId() {
  const jar = await cookies();
  return jar.get("uc_sid")?.value ?? null;
}

export async function logProductView(productId: string) {
  if (!SUPABASE_CONFIGURED) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("product_views").insert({
    product_id: productId,
    user_id: user?.id ?? null,
    session_id: await sessionId(),
  });
}

export async function subscribeNewsletter(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email")).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email, source: String(formData.get("source") ?? "footer") });
  if (error && error.code !== "23505") return { error: "Inscription impossible pour le moment." };
  return { ok: "Merci. Vous recevrez nos prochaines pièces en avant-première." };
}

// ---------------------------------------------------------------------
// Administration (RLS : seules les requêtes d'un admin passent)
// ---------------------------------------------------------------------
export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function adminUpdateStock(variantId: string, stock: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .update({ stock: Math.max(0, Math.floor(stock)) })
    .eq("id", variantId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/boutique");
  return { ok: true };
}

export async function adminToggleProduct(productId: string, field: "is_active" | "is_featured", value: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ [field]: value }).eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
