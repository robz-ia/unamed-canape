import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/data";

const TABS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits & stock" },
  { href: "/admin/clients", label: "Clients" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  // Un client connecté ne doit même pas savoir que la page existe.
  if (user?.role !== "admin") notFound();

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow text-stone">Administration</p>
          <p className="display text-4xl mt-2">Maison Unamed</p>
        </div>
        <nav className="flex flex-wrap gap-x-7 gap-y-3">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className="eyebrow link-underline">
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="pt-10">{children}</div>
    </div>
  );
}
