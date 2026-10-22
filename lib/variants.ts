import type { Product, ProductImage, Variant } from "@/lib/types";

export const variantLabel = (v: Pick<Variant, "option1" | "option2">) => (v.option2 ? `${v.option1} · ${v.option2}` : v.option1);

export const defaultVariant = (p: Product) => p.variants.find((v) => v.is_default) ?? p.variants.find((v) => v.stock > 0) ?? p.variants[0];

export const fromPrice = (p: Product) => p.base_price + (p.variants.length ? Math.min(...p.variants.map((v) => v.price_delta)) : 0);

export const hasPriceRange = (p: Product) => new Set(p.variants.map((v) => v.price_delta)).size > 1;

// Valeurs distinctes d'une option, dans l'ordre des variantes, avec leur pastille éventuelle.
export function optionValues(p: Product, index: 1 | 2) {
  const seen = new Map<string, string | null>();
  for (const v of p.variants) {
    const value = index === 1 ? v.option1 : v.option2;
    if (value && !seen.has(value)) seen.set(value, v.swatch_hex && isColorOption(p, index) ? v.swatch_hex : null);
  }
  return [...seen].map(([value, hex]) => ({ value, hex }));
}

export const isColorOption = (p: Product, index: 1 | 2) => /coloris|couleur/i.test((index === 1 ? p.option1_name : p.option2_name) ?? "");

// Photos à montrer pour une variante : communes + propres à ses options.
export const imagesFor = (images: ProductImage[], v?: Pick<Variant, "option1" | "option2">) =>
  images.filter((img) => !v || ((!img.option1 || img.option1 === v.option1) && (!img.option2 || img.option2 === v.option2)));

export const coverFor = (p: Product, v = defaultVariant(p)) => imagesFor(p.images, v)[0] ?? p.images[0];
