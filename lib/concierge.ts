import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Product } from "@/lib/types";
import { fromPrice, variantLabel } from "@/lib/variants";

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
        `- ${p.name} (/produit/${p.slug}) — ${p.category?.name} — à partir de ${fromPrice(p)} €`,
        `  ${p.tagline}. L${p.width_cm} × P${p.depth_cm} × H${p.height_cm} cm, ${p.seats} places.`,
        `  Matières : ${p.materials}. Délai : ${p.lead_time_weeks} semaines.`,
        `  Configurations (${[p.option1_name, p.option2_name].filter(Boolean).join(" / ")}) : ${p.variants
          .map((v) => `${variantLabel(v)} = ${p.base_price + v.price_delta} € (stock ${v.stock})`)
          .join(" ; ")}`,
      ].join("\n")
    )
    .join("\n");
}

// Repli sans clé API : recommandation par règles simples, même format de sortie.
export function ruleBasedAnswer(message: string, products: Product[]) {
  const m = message.toLowerCase();
  const budget = Number((m.match(/(\d[\d\s.]{2,})\s*(?:€|euros?)/)?.[1] ?? "").replace(/[\s.]/g, "")) || Infinity;
  let pool = products.filter((p) => fromPrice(p) <= budget);
  if (!pool.length) pool = [...products].sort((a, b) => a.base_price - b.base_price).slice(0, 1);

  const pick = (slug: string) => pool.find((p) => p.slug === slug);
  let p: Product | undefined;
  if (/dormir|lit|amis|invité|studio|convertible/.test(m)) p = pick("rive-gauche");
  else if (/chat|chien|animal|enfant/.test(m)) p = pick("alma") ?? pick("rive-gauche");
  else if (/fauteuil|lecture|une place|pivot/.test(m)) p = pick("petale");
  else if (/courbe|incurv|grand salon|spacieux/.test(m)) p = pick("meandre") ?? pick("galet");
  else if (/rond|organique|sculpt|original/.test(m)) p = pick("galet") ?? pick("petale");
  else if (/nordique|scandinave|nuage|cocon|moelleux/.test(m)) p = pick("nuage");
  else if (/rétro|retro|vintage|70/.test(m)) p = pick("rive-gauche");
  p ??= pool[0];

  const over = budget !== Infinity && fromPrice(p) > budget;
  return `${over ? "Votre budget est un peu juste pour notre collection ; la pièce la plus proche est" : "Je vous orienterais vers"} le ${p.name} : ${p.tagline.toLowerCase()}, ${p.width_cm} cm de large, à partir de ${fromPrice(p)} €. Dites-moi la largeur du mur disponible et si vous avez des animaux, je vous conseillerai le bon coloris. [${p.name}](/produit/${p.slug})`;
}
