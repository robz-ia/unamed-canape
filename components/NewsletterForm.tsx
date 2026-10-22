"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/actions";

export default function NewsletterForm({ source = "footer", dark = false }: { source?: string; dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, undefined);
  if (state?.ok) return <p className="text-sm">{state.ok}</p>;
  return (
    <form action={action} className="w-full">
      <input type="hidden" name="source" value={source} />
      <div className={`flex items-end gap-4 border-b ${dark ? "border-paper/30" : "border-line"}`}>
        <input
          name="email"
          type="email"
          required
          placeholder="Votre adresse e-mail"
          aria-label="Adresse e-mail"
          className={`flex-1 bg-transparent py-3 text-sm focus:outline-none ${dark ? "placeholder:text-paper/50" : "placeholder:text-stone"}`}
        />
        <button disabled={pending} className="eyebrow pb-3.5 link-underline">
          {pending ? "…" : "S'inscrire"}
        </button>
      </div>
      {state?.error && <p className="text-xs text-danger mt-2">{state.error}</p>}
    </form>
  );
}
