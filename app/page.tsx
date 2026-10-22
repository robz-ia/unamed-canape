import Link from "next/link";
import CategoryList from "@/components/home/CategoryList";
import Counter from "@/components/home/Counter";
import CollectionCarousel from "@/components/home/CollectionCarousel";
import HeroGallery, { type Frame } from "@/components/home/HeroGallery";
import StickyChapters from "@/components/home/StickyChapters";
import Reveal from "@/components/motion/Reveal";
import ScrollText from "@/components/motion/ScrollText";
import SplitReveal from "@/components/motion/SplitReveal";
import { getCategories, getProducts } from "@/lib/data";

// Mur de galerie du hero : position, taille et profondeur (parallaxe) de chaque pièce.
const FRAMES: Frame[] = [
  { slug: "galet", name: "Galet", image: "/products/galet/2.jpg", className: "left-[-8%] top-[9%] w-[32vw] md:left-[4%] md:top-[17%] md:w-[17vw]", aspect: "aspect-[4/5]", depth: 0.9, mobile: true },
  { slug: "nuage", name: "Nuage", image: "/products/nuage/1.jpg", className: "right-[-6%] top-[8%] w-[28vw] md:right-[5%] md:top-[12%] md:w-[14vw]", aspect: "aspect-[3/4]", depth: 0.6, mobile: true },
  { slug: "rive-gauche", name: "Rive Gauche", image: "/products/rive-gauche/3.jpg", className: "left-[25%] top-[11%] w-[8vw]", aspect: "aspect-[4/5]", depth: 0.3 },
  { slug: "petale", name: "Pétale", image: "/products/petale/2.jpg", className: "left-[-4%] bottom-[9%] w-[30vw] md:left-[14%] md:bottom-[9%] md:w-[11vw]", aspect: "aspect-square", depth: 0.45, mobile: true },
  { slug: "alma", name: "Alma", image: "/products/alma/2.jpg", className: "right-[-10%] bottom-[7%] w-[44vw] md:right-[9%] md:bottom-[8%] md:w-[20vw]", aspect: "aspect-[4/3]", depth: 1, mobile: true },
  { slug: "meandre", name: "Méandre", image: "/products/meandre/2.jpg", className: "right-[33%] bottom-[6%] w-[8.5vw]", aspect: "aspect-[3/4]", depth: 0.5 },
];

const CHAPTERS = [
  {
    title: "Le *dessin.*",
    text: "Chaque pièce naît d'un croquis à la main. On cherche une ligne, une courbe, une assise — puis on retire tout ce qui n'est pas nécessaire.",
    image: "/products/galet/2.jpg",
  },
  {
    title: "La *matière.*",
    text: "Bouclé dense, chénille veloutée, cuir huilé qui se patine avec les années. Des matières choisies pour être touchées, pas seulement regardées.",
    image: "/products/rive-gauche/2.jpg",
  },
  {
    title: "Chez *vous.*",
    text: "Fabriquée à la commande, votre pièce est livrée, déballée et installée dans la pièce de votre choix. Nous repartons avec les emballages.",
    image: "/products/nuage/1.jpg",
  },
];

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const universes = categories.map((c) => ({
    href: `/boutique?categorie=${c.slug}`,
    name: c.name,
    description: c.description,
    count: products.filter((p) => p.memberships.some((m) => m.slug === c.slug)).length,
    image: c.cover_url ?? "/products/alma/2.jpg",
  }));

  return (
    <>
      <HeroGallery frames={FRAMES} />

      {/* Manifeste */}
      <section className="mx-auto max-w-[1600px] px-5 md:px-10 py-40 md:py-56">
        <p className="eyebrow text-stone mb-10">Manifeste</p>
        <ScrollText
          className="display text-[2.4rem] leading-[1.12] md:text-6xl lg:text-7xl md:leading-[1.08] max-w-[18ch] md:max-w-none"
          text="Un canapé n'est pas un meuble. C'est l'endroit où l'on lit, où l'on reçoit, où l'on s'endort un dimanche. Nous en dessinons six, et nous les fabriquons pour vous."
        />
      </section>

      <CollectionCarousel products={products} />

      {/* Chapitres */}
      <div className="mt-16">
        <StickyChapters chapters={CHAPTERS} />
      </div>

      {/* Chiffres */}
      <section className="mx-auto max-w-[1600px] px-5 md:px-10 mt-32">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-ink">
          {[
            { n: 6, s: "", l: "pièces, une collection resserrée" },
            { n: 10, s: " ans", l: "de garantie sur les structures" },
            { n: 30, s: " jours", l: "pour changer d'avis" },
            { n: 1500, s: " €", l: "livraison & installation offertes dès" },
          ].map((k, i) => (
            <Reveal key={k.l} delay={i * 0.1} className="pt-8 pb-10 pr-6 border-b border-line lg:border-b-0">
              <p className="display text-5xl md:text-7xl">
                <Counter to={k.n} suffix={k.s} />
              </p>
              <p className="text-sm text-stone mt-4 max-w-[22ch]">{k.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Univers */}
      <section className="mx-auto max-w-[1600px] px-5 md:px-10 mt-40">
        <div className="flex items-end justify-between mb-12">
          <SplitReveal text="Trois façons de *recevoir.*" className="display text-5xl md:text-7xl max-w-[12ch]" />
          <p className="eyebrow text-stone hidden md:block">Univers</p>
        </div>
        <CategoryList items={universes} />
      </section>

      {/* Concierge */}
      <section className="mt-40 bg-ink text-paper">
        <div className="mx-auto max-w-[1100px] px-5 md:px-10 py-32 md:py-44 flex flex-col items-center text-center">
          <Reveal>
            <p className="eyebrow text-paper/40">Le Concierge</p>
          </Reveal>
          <SplitReveal
            text="Décrivez votre pièce. *Nous trouvons la vôtre.*"
            className="display text-5xl md:text-7xl lg:text-8xl mt-8 leading-[0.98]"
          />
          <Reveal delay={0.2} className="flex flex-col items-center">
            <p className="text-paper/60 leading-relaxed max-w-xl mt-10">
              Surface, habitudes, animaux, budget : notre conseiller connaît chaque pièce, chaque configuration et chaque
              stock en temps réel. Il vous oriente vers la bonne, avec les bonnes dimensions.
            </p>
            <Link href="/concierge" className="btn btn-light mt-12">
              Être conseillé
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
