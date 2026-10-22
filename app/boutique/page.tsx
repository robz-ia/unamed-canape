import type { Metadata } from "next";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "La collection" };

const SORTS = [
  { value: "", label: "Sélection" },
  { value: "prix-asc", label: "Prix ↑" },
  { value: "prix-desc", label: "Prix ↓" },
];

export default async function Boutique({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; tri?: string }>;
}) {
  const { categorie, tri } = await searchParams;
  const [products, categories] = await Promise.all([getProducts({ category: categorie, sort: tri }), getCategories()]);
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

  const title = current ? current.name : "La *collection.*";

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-36 md:pt-48">
      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end pb-16">
        <SplitReveal key={title} as="h1" immediate text={title} className="display text-[clamp(3.5rem,11vw,10rem)] leading-[0.9]" />
        <Reveal delay={0.3} y={16}>
          <p className="text-stone max-w-xs leading-relaxed md:text-right">
            {current?.description ?? "Six pièces dessinées pour durer, fabriquées à la commande et installées chez vous."}
          </p>
        </Reveal>
      </div>

      <FilterBar
        count={products.length}
        tabs={[
          { href: href({ categorie: undefined }), label: "Tout", active: !categorie },
          ...categories.map((c) => ({ href: href({ categorie: c.slug }), label: c.name, active: categorie === c.slug })),
        ]}
        sorts={SORTS.map((s) => ({ href: href({ tri: s.value || undefined }), label: s.label, active: (tri ?? "") === s.value }))}
      />

      <div key={`${categorie}-${tri}`} className="grid gap-x-8 gap-y-24 sm:grid-cols-2 lg:grid-cols-3 mt-16">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
      {products.length === 0 && <p className="text-center text-stone py-24">Aucune pièce dans cet univers pour le moment.</p>}
    </div>
  );
}
