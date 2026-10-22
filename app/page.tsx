import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { getCategories, getProducts } from "@/lib/data";

export default async function Home() {
  const [featured, categories, all] = await Promise.all([
    getProducts({ featured: true }),
    getCategories(),
    getProducts(),
  ]);
  const hero = featured[0] ?? all[0];
  const coverOf = (slug: string) => all.find((p) => p.category?.slug === slug);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16 md:pt-24 text-center">
        <p className="eyebrow animate-fade-up">Maison de canapés de créateurs</p>
        <p className="eyebrow text-stone mt-2 animate-fade-up">Paris</p>
        <h1 className="display text-[3.4rem] sm:text-7xl md:text-8xl lg:text-[8.5rem] mt-10 animate-fade-up [animation-delay:120ms]">
          L&apos;art de <em className="font-normal">s&apos;asseoir</em>.
        </h1>
        <p className="max-w-xl mx-auto mt-8 text-stone leading-relaxed animate-fade-up [animation-delay:240ms]">
          Six pièces, pas une de plus. Des canapés dessinés comme des objets, fabriqués à la commande
          et installés chez vous par nos soins.
        </p>
        <div className="mt-10 animate-fade-up [animation-delay:360ms]">
          <Link href="/boutique" className="btn btn-ghost">
            Découvrir la collection
          </Link>
        </div>
      </section>

      {hero && (
        <section className="mx-auto max-w-[1440px] px-5 md:px-10 mt-20">
          <Link href={`/produit/${hero.slug}`} className="group block relative">
            <ProductImage
              src={hero.images[0]?.url}
              alt={hero.images[0]?.alt ?? hero.name}
              tone={hero.variants[0]?.color_hex}
              seed={1}
              priority
              sizes="100vw"
              className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
            />
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 flex items-end justify-between bg-gradient-to-t from-ink/40 to-transparent text-paper">
              <div>
                <p className="eyebrow">La pièce du moment</p>
                <p className="display text-4xl md:text-6xl mt-2">{hero.name}</p>
              </div>
              <span className="eyebrow hidden sm:inline">Voir la pièce →</span>
            </div>
          </Link>
        </section>
      )}

      {/* Sélection */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 mt-32">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow text-stone">Sélection</p>
            <h2 className="display text-4xl md:text-6xl mt-3">Les pièces signatures</h2>
          </div>
          <Link href="/boutique" className="eyebrow link-underline shrink-0">
            Tout voir
          </Link>
        </div>
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Manifeste */}
      <section className="mt-32 bg-ivory">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="eyebrow text-stone">Manifeste</p>
            <p className="display text-4xl md:text-5xl mt-6 leading-[1.1]">
              Un canapé n&apos;est pas un meuble. C&apos;est l&apos;endroit où l&apos;on <em className="font-normal">vit</em>.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
            {[
              ["6", "pièces, une collection resserrée"],
              ["10 ans", "de garantie sur les structures"],
              ["0 €", "livraison & installation dès 1 500 €"],
            ].map(([n, l]) => (
              <div key={n} className="border-t border-ink pt-6">
                <p className="display text-4xl md:text-5xl">{n}</p>
                <p className="text-sm text-stone mt-3 leading-snug">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Univers */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 mt-32">
        <p className="eyebrow text-stone text-center">Univers</p>
        <h2 className="display text-4xl md:text-6xl mt-3 text-center">Trois façons de recevoir</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-14">
          {categories.map((c, i) => {
            const cover = coverOf(c.slug);
            return (
              <Link key={c.id} href={`/boutique?categorie=${c.slug}`} className="group block">
                <ProductImage
                  src={cover?.images[1]?.url ?? cover?.images[0]?.url}
                  alt={c.name}
                  seed={i}
                  tone={cover?.variants[0]?.color_hex}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-square"
                />
                <p className="display text-3xl mt-5">{c.name}</p>
                <p className="text-sm text-stone mt-1">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Concierge */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 mt-32">
        <div className="border border-ink p-10 md:p-16 grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <p className="eyebrow text-stone">Nouveau</p>
            <h2 className="display text-4xl md:text-5xl mt-3">Le Concierge</h2>
            <p className="mt-5 text-stone max-w-xl leading-relaxed">
              Décrivez votre pièce, vos habitudes, votre budget. Notre conseiller vous oriente vers la pièce juste,
              avec les bonnes dimensions et le bon tissu.
            </p>
          </div>
          <Link href="/concierge" className="btn btn-solid">
            Être conseillé
          </Link>
        </div>
      </section>
    </>
  );
}
