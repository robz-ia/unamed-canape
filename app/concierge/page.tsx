import type { Metadata } from "next";
import ConciergeChat from "@/components/ConciergeChat";

export const metadata: Metadata = { title: "Le Concierge" };

export default function Concierge() {
  return (
    <div className="mx-auto max-w-4xl px-5 md:px-10 pt-16">
      <div className="text-center mb-12">
        <p className="eyebrow text-stone">Conseil personnalisé</p>
        <h1 className="display text-5xl md:text-7xl mt-4">Le Concierge</h1>
        <p className="text-stone mt-5 max-w-lg mx-auto">
          Un conseiller qui connaît chaque pièce, chaque coloris et chaque stock, en temps réel.
        </p>
      </div>
      <ConciergeChat />
    </div>
  );
}
