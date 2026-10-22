import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = { title: "Connexion" };

export default async function Connexion({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell eyebrow="Espace client" title="Bon retour.">
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
