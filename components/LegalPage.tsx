import Reveal from "./motion/Reveal";
import SplitReveal from "./motion/SplitReveal";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

// Mise en page commune des pages légales : sommaire fixe à gauche, articles à droite.
export default function LegalPage({ eyebrow, title, updated, sections }: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-36 md:pt-48">
      <p className="eyebrow text-stone">{eyebrow}</p>
      <SplitReveal as="h1" immediate text={title} className="display text-[clamp(3rem,8vw,7rem)] leading-[0.95] mt-6" />
      <Reveal delay={0.2} y={16}>
        <p className="text-sm text-stone mt-6">Dernière mise à jour : {updated}</p>
        <p className="mt-8 max-w-2xl border-l border-ink pl-5 text-sm leading-relaxed">
          Unamed Canapé. est un site réalisé dans un cadre pédagogique. Aucune vente réelle n&apos;est conclue : les
          commandes passées sur le site sont fictives et aucun paiement n&apos;est encaissé.
        </p>
      </Reveal>

      <div className="grid lg:grid-cols-[260px_1fr] gap-12 lg:gap-24 mt-20 border-t border-ink pt-12">
        <nav className="hidden lg:block">
          <ol className="sticky top-32 space-y-3">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="eyebrow !text-[0.6rem] text-stone hover:text-ink transition-colors">
                  {String(i + 1).padStart(2, "0")} — {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-16 max-w-3xl">
          {sections.map((s, i) => (
            <Reveal key={s.id} as="section" y={24}>
              <div id={s.id} className="scroll-mt-32">
                <p className="eyebrow text-stone">Article {String(i + 1).padStart(2, "0")}</p>
                <h2 className="display text-3xl md:text-4xl mt-3">{s.title}</h2>
                <div className="mt-5 text-stone leading-relaxed space-y-4 [&_strong]:text-ink [&_strong]:font-medium">{s.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
