import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import Gallery from "@/components/Gallery";
import ProductCard from "@/components/ProductCard";
import ViewTracker from "@/components/ViewTracker";
import { getProduct, getProducts } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: product.name, description: product.tagline } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const others = (await getProducts()).filter((p) => p.id !== product.id).slice(0, 3);

  const specs = [
    ["Dimensions", product.width_cm && `L ${product.width_cm} × P ${product.depth_cm} × H ${product.height_cm} cm`],
    ["Hauteur d'assise", product.seat_height_cm && `${product.seat_height_cm} cm`],
    ["Places", product.seats],
    ["Revêtement", product.materials],
    ["Structure", product.frame],
    ["Délai de fabrication", `${product.lead_time_weeks} semaines`],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10">
      <ViewTracker productId={product.id} />
      <nav className="eyebrow text-stone flex gap-3 mb-10">
        <Link href="/boutique" className="hover:text-ink">Collection</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/boutique?categorie=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-12 lg:gap-20">
        <Gallery images={product.images} name={product.name} tone={product.variants[0]?.color_hex} modelUrl={product.model_url} />

        <div className="lg:sticky lg:top-36 self-start">
          <p className="eyebrow text-stone">{product.category?.name}</p>
          <h1 className="display text-6xl md:text-7xl mt-3">{product.name}</h1>
          <p className="mt-3 text-stone">{product.tagline}</p>
          {product.compare_at_price && (
            <p className="mt-4 text-sm">
              <span className="line-through text-stone mr-2">
                {new Intl.NumberFormat("fr-FR").format(product.compare_at_price)} €
              </span>
              <span className="eyebrow">Prix de lancement</span>
            </p>
          )}

          <div className="mt-10">
            <AddToCart variants={product.variants} basePrice={product.base_price} />
          </div>

          <p className="mt-10 leading-relaxed">{product.description}</p>

          <div className="mt-10 border-t border-line">
            <details className="group border-b border-line" open>
              <summary className="flex justify-between py-5 cursor-pointer list-none eyebrow">
                Caractéristiques <span className="group-open:rotate-45 transition">+</span>
              </summary>
              <dl className="pb-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
                {specs.map(([k, v]) => (
                  <div key={k as string} className="contents">
                    <dt className="text-stone">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </details>
            {product.story && (
              <details className="group border-b border-line">
                <summary className="flex justify-between py-5 cursor-pointer list-none eyebrow">
                  L&apos;histoire de la pièce <span className="group-open:rotate-45 transition">+</span>
                </summary>
                <p className="pb-6 text-sm leading-relaxed text-stone">{product.story}</p>
              </details>
            )}
            <details className="group border-b border-line">
              <summary className="flex justify-between py-5 cursor-pointer list-none eyebrow">
                Livraison & retours <span className="group-open:rotate-45 transition">+</span>
              </summary>
              <p className="pb-6 text-sm leading-relaxed text-stone">
                Livraison et installation dans la pièce de votre choix, offertes dès 1 500 €. Emballages repris.
                Retours gratuits sous 30 jours.
              </p>
            </details>
          </div>
        </div>
      </div>

      <section className="mt-32">
        <h2 className="display text-4xl md:text-5xl mb-12">Vous aimerez aussi</h2>
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
