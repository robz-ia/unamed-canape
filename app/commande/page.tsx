import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { cartSubtotal, getCart, getUser, lineUnit } from "@/lib/data";
import { price } from "@/lib/format";
import { variantLabel } from "@/lib/variants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Commande" };

export default async function Commande() {
  const user = await getUser();
  if (!user) redirect("/connexion?next=/commande");
  const lines = await getCart();
  if (lines.length === 0) redirect("/panier");

  const supabase = await createClient();
  const { data: address } = await supabase
    .from("addresses")
    .select("full_name, line1, line2, postal_code, city, country, phone")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-32 md:pt-40">
      <h1 className="display text-5xl md:text-7xl">Commande</h1>
      <ul className="mt-8 mb-14 flex flex-wrap gap-x-8 gap-y-2 text-sm text-stone">
        {lines.map((l) => (
          <li key={l.id}>
            {l.quantity} × {l.variant.product.name} ({variantLabel(l.variant)}) — {price(lineUnit(l) * l.quantity)}
          </li>
        ))}
      </ul>
      <CheckoutForm
        subtotal={cartSubtotal(lines)}
        defaultAddress={address}
        defaultName={[user.first_name, user.last_name].filter(Boolean).join(" ")}
      />
    </div>
  );
}
