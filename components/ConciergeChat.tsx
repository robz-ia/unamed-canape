"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Studio de 25 m², je reçois souvent des amis qui dorment chez moi.",
  "Grand salon, deux chats, j'aime les formes arrondies.",
  "Je cherche le canapé le plus confortable, budget 3 000 €.",
];

const PRODUCT_LINK = /\[([^\]]+)\]\((\/produit\/[a-z0-9-]+(?:\?[^)\s]*)?)\)/g;
const HAS_PRODUCT_LINK = new RegExp(PRODUCT_LINK.source); // sans « g » : .test() sans état

// Gras **…** et italique *…* dans une ligne
function inline(text: string, key: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${key}-${i}`} className="font-medium">{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={`${key}-${i}`}>{part.slice(1, -1)}</em>;
    return part;
  });
}

// Mise en forme légère des réponses : paragraphes, listes, gras, et liens produit → boutons.
function render(text: string) {
  const links = [...text.matchAll(PRODUCT_LINK)].map((m) => ({ label: m[1], href: m[2] }));
  const unique = links.filter((l, i) => links.findIndex((x) => x.href === l.href) === i);
  const body = text
    // une ligne qui ne contient que des liens produit devient des boutons : on la retire du texte
    .split("\n")
    .filter((line) => line.replace(PRODUCT_LINK, "").replace(/[\s,.;·—–-]/g, "") !== "" || !HAS_PRODUCT_LINK.test(line))
    .join("\n")
    .replace(PRODUCT_LINK, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // autres liens : texte seul
    .replace(/^#{1,6}\s*/gm, "")
    .trim();

  const blocks = body.split(/\n\s*\n/).filter((b) => b.trim());
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.every((l) => /^([-•*]|\d+[.)])\s+/.test(l))) {
          return (
            <ul key={bi} className="mt-3 first:mt-0 space-y-2">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-3">
                  <span className="text-stone">—</span>
                  <span>{inline(l.replace(/^([-•*]|\d+[.)])\s+/, ""), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="mt-3 first:mt-0">
            {lines.map((l, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {inline(l, `${bi}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
      {unique.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-5">
          {unique.map((l) => (
            <Link key={l.href} href={l.href} className="btn btn-solid !py-2.5 !px-5">
              Voir {l.label} →
            </Link>
          ))}
        </div>
      )}
    </>
  );
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
