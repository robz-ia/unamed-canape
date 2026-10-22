import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function Inscription({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell eyebrow="Rejoindre la maison" title="Bienvenue.">
      <AuthForm mode="signup" next={next} />
    </AuthShell>
  );
}
