// Illustration au trait utilisée en attendant (ou à défaut de) la photo produit.
export default function SofaArt({ variant = 0, tone = "#d9cfbf" }: { variant?: number; tone?: string }) {
  const shapes = [
    // canapé droit
    <g key="a">
      <rect x="40" y="88" width="220" height="44" rx="10" />
      <rect x="54" y="58" width="192" height="40" rx="14" />
      <rect x="28" y="74" width="30" height="58" rx="12" />
      <rect x="242" y="74" width="30" height="58" rx="12" />
      <line x1="150" y1="92" x2="150" y2="130" />
      <line x1="60" y1="132" x2="60" y2="146" />
      <line x1="240" y1="132" x2="240" y2="146" />
    </g>,
    // nuage
    <g key="b">
      <path d="M36 128c-8-30 4-60 34-62 18-22 52-22 70-4 18-18 52-18 70 4 30 2 42 32 34 62z" />
      <path d="M60 104c30-8 150-8 180 0" />
    </g>,
    // galet
    <g key="c">
      <path d="M40 120c-6-34 30-58 80-54 26-20 92-22 120 8 22 18 24 50 4 58-60 18-186 16-204-12z" />
      <path d="M78 98c40-10 120-14 160 4" />
    </g>,
  ];
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" fill={tone} fillOpacity={0.35} stroke="#121110" strokeOpacity={0.55} strokeWidth={1.2}>
      {shapes[variant % shapes.length]}
    </svg>
  );
}
