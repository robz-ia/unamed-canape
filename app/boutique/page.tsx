import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "La collection" };

const SORTS = [
  { value: "", label: "Sélection" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];

export default async function Boutique({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; tri?: string }>;
}) {
  const { categorie, tri } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ category: categorie, sort: tri }),
    getCategories(),
  ]);
  const current = categories.find((c) => c.slug === categorie);

  const href = (params: { categorie?: string; tri?: string }) => {
    const q = new URLSearchParams();
    const c = "categorie" in params ? params.categorie : categorie;
    const t = "tri" in params ? params.tri : tri;
    if (c) q.set("categorie", c);
    if (t) q.set("tri", t);
    const s = q.toString();
    return s ? `/boutique?${s}` : "/boutique";
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16">
      <div className="text-center">
        <p className="eyebrow text-stone">{current ? "Univers" : "Boutique"}</p>
        <h1 className="display text-5xl md:text-7xl mt-4">{current?.name ?? "La collection"}</h1>
        <p className="text-stone mt-5 max-w-lg mx-auto">
          {current?.description ?? "Six pièces dessinées pour durer, fabriquées à la commande."}
        </p>
      </div>

      <div className="mt-14 py-5 border-y border-line flex flex-col md:flex-row gap-5 md:items-center justify-between">
        <div className="flex flex-wrap gap-x-7 gap-y-3">
          <Link href={href({ categorie: undefined })} className={`eyebrow ${!categorie ? "underline underline-offset-8" : "text-stone hover:text-ink"}`}>
            Tout
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={href({ categorie: c.slug })}
              className={`eyebrow ${categorie === c.slug ? "underline underline-offset-8" : "text-stone hover:text-ink"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-6 items-center">
          <span className="eyebrow text-stone">{products.length} pièce{products.length > 1 ? "s" : ""}</span>
          <span className="h-4 w-px bg-line" />
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={href({ tri: s.value || undefined })}
              className={`eyebrow ${(tri ?? "") === s.value ? "text-ink" : "text-stone hover:text-ink"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 mt-14">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
      {products.length === 0 && <p className="text-center text-stone py-24">Aucune pièce dans cet univers pour le moment.</p>}
    </div>
  );
}
