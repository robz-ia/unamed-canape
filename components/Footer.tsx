import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import Reveal from "./motion/Reveal";

const COLS = [
  { title: "Collection", links: [["/boutique?categorie=canapes", "Canapés"], ["/boutique?categorie=convertibles", "Convertibles"], ["/boutique?categorie=sculpturales", "Pièces sculpturales"]] },
  { title: "Maison", links: [["/maison", "Notre histoire"], ["/concierge", "Le Concierge"], ["/compte", "Mon compte"]] },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-40 overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-24">
        <div className="grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-paper/40">La lettre</p>
            <p className="display text-4xl md:text-5xl mt-6 leading-[1.1]">
              Les nouvelles pièces, <em>avant tout le monde.</em>
            </p>
            <div className="mt-10 max-w-md">
              <NewsletterForm dark />
            </div>
          </Reveal>
          <div className="lg:col-span-4 lg:col-start-8 grid grid-cols-2 gap-8 text-sm">
            {COLS.map((c, i) => (
              <Reveal key={c.title} delay={0.1 * i}>
                <p className="eyebrow text-paper/40 mb-6">{c.title}</p>
                <ul className="space-y-3">
                  {c.links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="link-underline text-paper/80 hover:text-paper transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <p className="logo text-[12.4vw] leading-[0.9] mt-28 pb-[2vw] whitespace-nowrap select-none text-paper" aria-hidden>
          Unamed Canapé<span className="text-stone">.</span>
        </p>
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-6 flex flex-col md:flex-row justify-between gap-3 eyebrow !text-[0.6rem] text-paper/40">
          <span>© {new Date().getFullYear()} Unamed Canapé. — Paris</span>
          <span>Livraison & installation offertes dès 1 500 € · Retours 30 jours</span>
        </div>
      </div>
    </footer>
  );
}
