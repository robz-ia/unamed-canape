import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="display text-5xl md:text-6xl">
              Unamed Canapé<span className="text-stone">.</span>
            </p>
            <p className="mt-6 text-paper/60 max-w-sm text-sm leading-relaxed">
              Des canapés de créateurs, fabriqués à la commande et livrés dans la pièce de votre choix.
            </p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-2 gap-8 text-sm">
            <ul className="space-y-3">
              <li className="eyebrow text-paper/50 mb-4">Boutique</li>
              <li><Link href="/boutique?categorie=canapes" className="link-underline">Canapés</Link></li>
              <li><Link href="/boutique?categorie=convertibles" className="link-underline">Convertibles</Link></li>
              <li><Link href="/boutique?categorie=sculpturales" className="link-underline">Sculpturales</Link></li>
            </ul>
            <ul className="space-y-3">
              <li className="eyebrow text-paper/50 mb-4">Maison</li>
              <li><Link href="/maison" className="link-underline">Notre histoire</Link></li>
              <li><Link href="/concierge" className="link-underline">Le Concierge</Link></li>
              <li><Link href="/compte" className="link-underline">Mon compte</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-4">
            <p className="eyebrow text-paper/50 mb-4">La lettre</p>
            <p className="text-sm text-paper/70 mb-6">Nouvelles pièces, éditions limitées et ventes privées.</p>
            <NewsletterForm dark />
          </div>
        </div>
        <div className="mt-20 pt-6 border-t border-paper/15 flex flex-col md:flex-row justify-between gap-3 text-[0.7rem] text-paper/40 eyebrow">
          <span>© {new Date().getFullYear()} Unamed Canapé.</span>
          <span>Projet étudiant — Next.js · Supabase · Vercel</span>
        </div>
      </div>
    </footer>
  );
}
