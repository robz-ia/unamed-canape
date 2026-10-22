import Link from "next/link";
import CategoryList from "@/components/home/CategoryList";
import Counter from "@/components/home/Counter";
import HeroShowroom from "@/components/home/HeroShowroom";
import HorizontalCollection from "@/components/home/HorizontalCollection";
import StickyChapters from "@/components/home/StickyChapters";
import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal from "@/components/motion/Reveal";
import ScrollText from "@/components/motion/ScrollText";
import SplitReveal from "@/components/motion/SplitReveal";
import { getCategories, getProducts } from "@/lib/data";

// Pièces dont la couverture est détourée sur fond blanc : elles passent dans le hero.
const HERO = ["galet", "alma", "rive-gauche", "petale"];

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

  const slides = HERO.map((slug) => products.find((p) => p.slug === slug))
    .filter((p) => !!p)
    .map((p) => ({ slug: p.slug, name: p.name, tagline: p.tagline, image: p.images[0].url }));

  const universes = categories.map((c) => {
    const inCat = products.filter((p) => p.category?.slug === c.slug);
    return {
      href: `/boutique?categorie=${c.slug}`,
      name: c.name,
      description: c.description,
      count: inCat.length,
      image: (inCat[0]?.images[1] ?? inCat[0]?.images[0])?.url ?? "/products/nuage/1.jpg",
    };
  });

  return (
    <>
      <HeroShowroom slides={slides} />

      {/* Manifeste */}
      <section className="mx-auto max-w-[1600px] px-5 md:px-10 py-40 md:py-56">
        <p className="eyebrow text-stone mb-10">Manifeste</p>
        <ScrollText
          className="display text-[2.4rem] leading-[1.12] md:text-6xl lg:text-7xl md:leading-[1.08] max-w-[18ch] md:max-w-none"
          text="Un canapé n'est pas un meuble. C'est l'endroit où l'on lit, où l'on reçoit, où l'on s'endort un dimanche. Nous en dessinons six, et nous les fabriquons pour vous."
        />
      </section>

      <HorizontalCollection products={products} />

      {/* Plein cadre */}
      <section className="mt-40 px-5 md:px-10">
        <ParallaxImage src="/products/alma/2.jpg" alt="Le canapé Alma en chénille crème dans un salon" className="h-[80vh] md:h-[110vh]" strength={12} />
        <div className="mx-auto max-w-[1600px] grid md:grid-cols-2 gap-10 mt-12">
          <Reveal>
            <p className="eyebrow text-stone">Pièce du moment</p>
            <p className="display text-5xl md:text-6xl mt-4">Alma</p>
          </Reveal>
          <Reveal delay={0.15} className="md:pt-8">
            <p className="text-stone leading-relaxed max-w-md">
              Des coussins boudinés en chénille, 50 cm de profondeur d&apos;assise, et une longueur qui se compose de
              180 à 390 cm. La pièce que l&apos;on garde vingt ans.
            </p>
            <Link href="/produit/alma" className="btn btn-ghost mt-8">
              Découvrir Alma
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Chapitres */}
      <div className="mt-40">
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
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-32 md:py-44 grid lg:grid-cols-[1.4fr_1fr] gap-16 items-end">
          <div>
            <p className="eyebrow text-paper/40">Le Concierge</p>
            <SplitReveal
              text="Décrivez votre pièce. *Nous trouvons la vôtre.*"
              className="display text-5xl md:text-7xl lg:text-8xl mt-6 leading-[0.95]"
            />
          </div>
          <Reveal delay={0.2}>
            <p className="text-paper/60 leading-relaxed max-w-md">
              Surface, habitudes, animaux, budget : notre conseiller connaît chaque pièce, chaque coloris et chaque
              stock en temps réel. Il vous oriente vers la bonne, avec les bonnes dimensions.
            </p>
            <Link href="/concierge" className="btn btn-light mt-10">
              Être conseillé
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
