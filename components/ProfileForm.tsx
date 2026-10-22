"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions";

type P = { first_name: string | null; last_name: string | null; phone: string | null; email: string };

export default function ProfileForm({ profile }: { profile: P }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="space-y-1">
      <div className="grid grid-cols-2 gap-6">
        <input name="first_name" defaultValue={profile.first_name ?? ""} placeholder="Prénom" className="field" />
        <input name="last_name" defaultValue={profile.last_name ?? ""} placeholder="Nom" className="field" />
      </div>
      <input value={profile.email} disabled className="field text-stone" aria-label="E-mail" />
      <input name="phone" defaultValue={profile.phone ?? ""} placeholder="Téléphone" className="field" />
      <div className="flex items-center gap-6 pt-6">
        <button disabled={pending} className="btn btn-ghost">{pending ? "…" : "Enregistrer"}</button>
        {state?.ok && <span className="text-sm text-success">{state.ok}</span>}
        {state?.error && <span className="text-sm text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
