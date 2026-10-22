import { cookies } from "next/headers";

// Panier invité : on peut ajouter des pièces sans compte. Il vit dans un cookie
// et rejoint le panier en base dès la connexion (voir mergeGuestCart dans actions.ts).
export type GuestLine = { v: string; q: number };

const NAME = "uc_cart";

export async function readGuestCart(): Promise<GuestLine[]> {
  const raw = (await cookies()).get(NAME)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l): l is GuestLine => typeof l?.v === "string" && Number.isInteger(l?.q) && l.q > 0)
      .slice(0, 20)
      .map((l) => ({ v: l.v, q: Math.min(l.q, 10) }));
  } catch {
    return [];
  }
}

// À n'appeler que depuis une server action ou une route (écriture de cookie).
export async function writeGuestCart(lines: GuestLine[]) {
  const jar = await cookies();
  if (lines.length === 0) jar.delete(NAME);
  else jar.set(NAME, JSON.stringify(lines), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
