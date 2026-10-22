import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Accordion from "@/components/Accordion";
import AddToCart from "@/components/AddToCart";
import Gallery from "@/components/Gallery";
import ProductCard from "@/components/ProductCard";
import ViewTracker from "@/components/ViewTracker";
import Reveal from "@/components/motion/Reveal";
import SplitReveal from "@/components/motion/SplitReveal";
import { getProduct, getProducts } from "@/lib/data";
import { price } from "@/lib/format";

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
    ["Fabrication", `${product.lead_time_weeks} semaines, à la commande`],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-24 md:pt-32">
      <ViewTracker productId={product.id} />

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-20">
        <Gallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 self-start lg:pb-10">
          <nav className="eyebrow !text-[0.6rem] text-stone flex gap-2">
            <Link href="/boutique" className="hover:text-ink transition-colors">Collection</Link>
            <span>/</span>
            {product.category && (
              <Link href={`/boutique?categorie=${product.category.slug}`} className="hover:text-ink transition-colors">
                {product.category.name}
              </Link>
            )}
          </nav>

          <SplitReveal as="h1" immediate text={product.name} className="display text-6xl md:text-8xl mt-6" />
          <Reveal delay={0.2} y={16}>
            <p className="mt-4 text-stone text-lg">{product.tagline}</p>
            {product.compare_at_price && (
              <p className="mt-3 text-sm">
                <span className="line-through text-stone mr-3 tabular-nums">{price(product.compare_at_price)}</span>
                <span className="eyebrow">Prix de lancement</span>
              </p>
            )}
          </Reveal>

          <Reveal delay={0.3} y={16} className="mt-10">
            <AddToCart
              variants={product.variants}
              basePrice={product.base_price}
              name={product.name}
              cover={product.images[0]?.url}
            />
          </Reveal>

          <Reveal delay={0.4} y={16}>
            <p className="mt-12 leading-relaxed">{product.description}</p>
            <div className="mt-10">
              <Accordion
                items={[
                  {
                    title: "Caractéristiques",
                    content: (
                      <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
                        {specs.map(([k, v]) => (
                          <div key={k as string} className="contents">
                            <dt>{k}</dt>
                            <dd className="text-ink">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    ),
                  },
                  ...(product.story ? [{ title: "L'histoire de la pièce", content: product.story }] : []),
                  {
                    title: "Livraison & retours",
                    content:
                      "Livraison et installation dans la pièce de votre choix, offertes dès 1 500 €. Emballages repris. Retours gratuits sous 30 jours.",
                  },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </div>

      <section className="mt-40">
        <div className="flex items-end justify-between mb-14">
          <SplitReveal text="Vous aimerez *aussi.*" className="display text-5xl md:text-7xl" />
          <Link href="/boutique" className="eyebrow link-underline hidden md:inline">
            Toute la collection
          </Link>
        </div>
        <div className="grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
