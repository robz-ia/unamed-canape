"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Studio de 25 m², je reçois souvent des amis qui dorment chez moi.",
  "Grand salon, deux chats, j'aime les formes arrondies.",
  "Je cherche le canapé le plus confortable, budget 3 000 €.",
];

// Transforme [Nom](/produit/slug) en bouton
function render(text: string) {
  const parts = text.split(/(\[[^\]]+\]\(\/produit\/[a-z0-9-]+\))/g);
  return parts.map((p, i) => {
    const m = p.match(/^\[([^\]]+)\]\((\/produit\/[a-z0-9-]+)\)$/);
    return m ? (
      <Link key={i} href={m[2]} className="btn btn-solid !py-2.5 !px-5 mt-4 flex w-max">
        Voir {m[1]} →
      </Link>
    ) : (
      <span key={i}>{p}</span>
    );
  });
}

export default function ConciergeChat() {
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content: "Bonjour. Décrivez-moi la pièce à meubler, vos habitudes et votre budget : je vous oriente vers la pièce juste.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Défile le fil de discussion (et non la page) jusqu'au dernier message.
  // Corps en bloc : un effet ne doit rien renvoyer d'autre qu'une fonction de nettoyage
  // (scrollIntoView renvoie une promesse dans les navigateurs récents → plantage React).
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...turns, { role: "user" as const, content }];
    setTurns(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setTurns([...next, { role: "assistant", content: data.reply ?? data.error ?? "Une erreur est survenue." }]);
    } catch {
      setTurns([...next, { role: "assistant", content: "Connexion interrompue, pouvez-vous reformuler ?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-ink bg-paper">
      <div ref={box} data-lenis-prevent className="h-[52vh] min-h-[360px] overflow-y-auto overscroll-contain p-6 md:p-10 space-y-8">
        {turns.map((t, i) => (
          <div key={i} className={`max-w-[85%] animate-fade-up ${t.role === "user" ? "ml-auto text-right" : ""}`}>
            <p className="eyebrow text-stone mb-2">{t.role === "user" ? "Vous" : "Le Concierge"}</p>
            <div className={`leading-relaxed ${t.role === "user" ? "bg-ivory inline-block px-5 py-3 text-left" : "display !font-normal text-xl md:text-2xl !leading-snug"}`}>
              {t.role === "assistant" ? render(t.content) : t.content}
            </div>
          </div>
        ))}
        {loading && <p className="eyebrow text-stone animate-pulse">Le Concierge réfléchit…</p>}
      </div>
      {turns.length === 1 && (
        <div className="px-6 md:px-10 pb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs border border-line px-3 py-2 hover:border-ink text-left">
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-ink flex"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Votre pièce, vos envies, votre budget…"
          aria-label="Votre message"
          className="flex-1 px-6 md:px-10 py-5 bg-transparent focus:outline-none text-sm"
        />
        <button disabled={loading || !input.trim()} className="eyebrow px-6 md:px-10 border-l border-ink disabled:opacity-30">
          Envoyer
        </button>
      </form>
    </div>
  );
}
