const ITEMS = [
  "Livraison & installation offertes dès 1 500 €",
  "Fabriqué à la commande",
  "Structures garanties 10 ans",
  "Retours sous 30 jours",
  "Paiement en 3 fois sans frais",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="bg-ink text-paper overflow-hidden border-b border-ink">
      <div className="flex w-max animate-marquee py-2.5">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0" aria-hidden={k === 1}>
            {row.map((t, i) => (
              <span key={i} className="eyebrow !text-[0.625rem] px-8 flex items-center gap-8">
                {t}
                <span className="opacity-40">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
