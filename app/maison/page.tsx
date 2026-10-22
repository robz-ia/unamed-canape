import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "La maison" };

const CHAPTERS = [
  ["01", "Moins, mais mieux", "Six pièces seulement. Chacune est dessinée, testée, assise des centaines de fois avant d'entrer dans la collection."],
  ["02", "Fabriqué à la commande", "Aucun stock dormant : votre canapé est assemblé pour vous, dans le coloris choisi, en quatre à huit semaines."],
  ["03", "Installé chez vous", "Nos livreurs montent, déballent et installent la pièce là où vous le souhaitez, puis repartent avec les emballages."],
];

export default function Maison() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16">
      <div className="max-w-4xl">
        <p className="eyebrow text-stone">Notre histoire</p>
        <h1 className="display text-5xl md:text-8xl mt-6">
          Un nom laissé <em className="font-normal">vide</em>, pour que la pièce parle d&apos;elle-même.
        </h1>
      </div>
      <div className="grid md:grid-cols-3 gap-12 mt-24 border-t border-ink pt-12">
        {CHAPTERS.map(([n, t, d]) => (
          <div key={n}>
            <p className="eyebrow text-stone">{n}</p>
            <p className="display text-3xl mt-4">{t}</p>
            <p className="text-stone mt-4 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-24 text-center">
        <Link href="/boutique" className="btn btn-solid">Voir la collection</Link>
      </div>
    </div>
  );
}
