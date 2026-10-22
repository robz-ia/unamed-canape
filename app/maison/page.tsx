import type { Metadata } from "next";
import Link from "next/link";
import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal from "@/components/motion/Reveal";
import ScrollText from "@/components/motion/ScrollText";
import SplitReveal from "@/components/motion/SplitReveal";

export const metadata: Metadata = { title: "La maison" };

const CHAPTERS = [
  ["01", "Moins, mais mieux", "Six pièces seulement. Chacune est dessinée, testée, assise des centaines de fois avant d'entrer dans la collection."],
  ["02", "Fabriqué à la commande", "Aucun stock dormant : votre canapé est assemblé pour vous, dans le coloris choisi, en quatre à huit semaines."],
  ["03", "Installé chez vous", "Nos livreurs montent, déballent et installent la pièce là où vous le souhaitez, puis repartent avec les emballages."],
];

export default function Maison() {
  return (
    <div className="pt-36 md:pt-48">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow text-stone">Notre histoire</p>
        <SplitReveal
          as="h1"
          immediate
          text="Un nom laissé *vide,* pour que la pièce parle d'elle-même."
          className="display text-[clamp(3rem,8vw,8rem)] leading-[0.95] mt-8 max-w-[14ch]"
        />
      </div>

      <div className="mt-24 px-5 md:px-10">
        <ParallaxImage src="/products/meandre/2.jpg" alt="Le canapé Méandre dans un salon" className="h-[70vh] md:h-[100vh]" priority />
      </div>

      <section className="mx-auto max-w-[1600px] px-5 md:px-10 py-40">
        <ScrollText
          className="display text-[2.2rem] leading-[1.15] md:text-6xl md:leading-[1.1]"
          text="Nous avons commencé par une question simple : pourquoi un beau canapé devrait-il être introuvable, hors de prix, ou livré dans un carton à monter soi-même ? Nous avons répondu avec six pièces."
        />
      </section>

      <section className="mx-auto max-w-[1600px] px-5 md:px-10 grid md:grid-cols-3 gap-14 border-t border-ink pt-14">
        {CHAPTERS.map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 0.12}>
            <p className="eyebrow text-stone">{n}</p>
            <p className="display text-4xl mt-5">{t}</p>
            <p className="text-stone mt-5 leading-relaxed">{d}</p>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-[1600px] px-5 md:px-10 mt-40 grid md:grid-cols-2 gap-8">
        <ParallaxImage src="/products/rive-gauche/3.jpg" alt="Le convertible Rive Gauche en cuir huilé" className="aspect-[4/5]" strength={8} />
        <ParallaxImage src="/products/galet/3.jpg" alt="Le canapé Galet et ses fauteuils" className="aspect-[4/5] md:mt-40" strength={8} />
      </section>

      <div className="text-center mt-32">
        <Link href="/boutique" className="btn btn-solid">
          Voir la collection
        </Link>
      </div>
    </div>
  );
}
