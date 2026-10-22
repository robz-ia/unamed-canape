import Link from "next/link";
import Logo from "./Logo";
import Marquee from "./Marquee";
import MobileNav from "./MobileNav";
import { getCartCount, getUser } from "@/lib/data";

const NAV = [
  { href: "/boutique", label: "La collection" },
  { href: "/boutique?categorie=sculpturales", label: "Pièces sculpturales" },
  { href: "/concierge", label: "Le Concierge" },
  { href: "/maison", label: "La maison" },
];

export default async function Header() {
  const [user, count] = await Promise.all([getUser(), getCartCount()]);

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md">
      <Marquee />
      <div className="border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 h-20 flex items-center justify-between gap-6">
          <Logo />
          <nav className="hidden lg:flex items-center gap-9">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="eyebrow link-underline">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            {user?.role === "admin" && (
              <Link href="/admin" className="eyebrow hidden md:inline link-underline">
                Admin
              </Link>
            )}
            <Link href={user ? "/compte" : "/connexion"} className="eyebrow hidden md:inline link-underline">
              {user ? user.first_name || "Mon compte" : "Connexion"}
            </Link>
            <Link href="/panier" className="eyebrow flex items-center gap-2" aria-label={`Panier, ${count} article(s)`}>
              Panier
              <span className="inline-flex min-w-6 h-6 px-1.5 items-center justify-center rounded-full bg-ink text-paper text-[0.625rem] tracking-normal">
                {count}
              </span>
            </Link>
            <MobileNav items={NAV} isLogged={!!user} isAdmin={user?.role === "admin"} />
          </div>
        </div>
      </div>
    </header>
  );
}
