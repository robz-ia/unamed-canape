"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/actions";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState(mode === "login" ? signIn : signUp, undefined);
  const q = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="next" value={next ?? ""} />
      {mode === "signup" && (
        <div className="grid grid-cols-2 gap-6">
          <input name="first_name" required placeholder="Prénom" autoComplete="given-name" className="field" />
          <input name="last_name" required placeholder="Nom" autoComplete="family-name" className="field" />
        </div>
      )}
      <input name="email" type="email" required placeholder="Adresse e-mail" autoComplete="email" className="field" />
      <input
        name="password"
        type="password"
        required
        minLength={mode === "signup" ? 8 : undefined}
        placeholder={mode === "signup" ? "Mot de passe (8 caractères min.)" : "Mot de passe"}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        className="field"
      />
      {state?.error && <p className="text-sm text-danger pt-3">{state.error}</p>}
      {state?.ok && <p className="text-sm text-success pt-3">{state.ok}</p>}
      <button disabled={pending} className="btn btn-solid w-full !mt-10">
        {pending ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
      <p className="text-sm text-stone text-center pt-6">
        {mode === "login" ? (
          <>Pas encore de compte ? <Link href={`/inscription${q}`} className="text-ink underline underline-offset-4">Créer un compte</Link></>
        ) : (
          <>Déjà client ? <Link href={`/connexion${q}`} className="text-ink underline underline-offset-4">Se connecter</Link></>
        )}
      </p>
    </form>
  );
}
