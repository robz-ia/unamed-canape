import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Product } from "@/lib/types";

// Le skill Claude Code sert aussi de prompt système en production : une seule source de vérité.
const SKILL_PATH = path.join(process.cwd(), ".claude/skills/concierge-canape/SKILL.md");

export async function loadSkill() {
  const raw = await readFile(SKILL_PATH, "utf8");
  return raw.replace(/^---[\s\S]*?---\s*/, ""); // retire le frontmatter
}

export function catalogueForPrompt(products: Product[]) {
  return products
    .map((p) =>
      [
        `- ${p.name} (/produit/${p.slug}) — ${p.category?.name} — ${p.base_price} €`,
        `  ${p.tagline}. L${p.width_cm} × P${p.depth_cm} × H${p.height_cm} cm, ${p.seats} places.`,
        `  Matières : ${p.materials}. Délai : ${p.lead_time_weeks} semaines.`,
        `  Coloris : ${p.variants
          .map((v) => `${v.color_name} (${v.fabric}${v.price_delta ? `, +${v.price_delta} €` : ""}, stock ${v.stock})`)
          .join(", ")}`,
      ].join("\n")
    )
    .join("\n");
}

// Repli sans clé API : recommandation par règles simples, même format de sortie.
export function ruleBasedAnswer(message: string, products: Product[]) {
  const m = message.toLowerCase();
  const budget = Number((m.match(/(\d[\d\s.]{2,})\s*(?:€|euros?)/)?.[1] ?? "").replace(/[\s.]/g, "")) || Infinity;
  let pool = products.filter((p) => p.base_price <= budget);
  if (!pool.length) pool = [...products].sort((a, b) => a.base_price - b.base_price).slice(0, 1);

  const pick = (slug: string) => pool.find((p) => p.slug === slug);
  let p: Product | undefined;
  if (/dormir|lit|amis|invité|studio|convertible/.test(m)) p = pick("montaigne") ?? pick("rive-gauche");
  else if (/chat|chien|animal|enfant/.test(m)) p = pick("alma") ?? pick("petale");
  else if (/rond|courbe|organique|sculpt|original/.test(m)) p = pick("galet") ?? pick("petale");
  else if (/nordique|scandinave|nuage|cocon|moelleux/.test(m)) p = pick("nuage");
  else if (/rétro|retro|vintage|70/.test(m)) p = pick("rive-gauche");
  p ??= pool[0];

  const over = budget !== Infinity && p.base_price > budget;
  return `${over ? "Votre budget est un peu juste pour notre collection ; la pièce la plus proche est" : "Je vous orienterais vers"} le ${p.name} : ${p.tagline.toLowerCase()}, ${p.width_cm} cm de large, à partir de ${p.base_price} €. Dites-moi la largeur du mur disponible et si vous avez des animaux, je vous conseillerai le bon coloris. [${p.name}](/produit/${p.slug})`;
}
