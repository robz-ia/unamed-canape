export default function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-5 md:px-10 pt-32 md:pt-44 grid lg:grid-cols-2 gap-16 items-start">
      <div className="hidden lg:block">
        <p className="eyebrow text-stone">{eyebrow}</p>
        <p className="display text-7xl xl:text-8xl mt-6">{title}</p>
        <ul className="mt-12 space-y-4 text-stone">
          <li>— Panier sauvegardé sur tous vos appareils</li>
          <li>— Suivi de fabrication et de livraison</li>
          <li>— Accès aux ventes privées</li>
        </ul>
      </div>
      <div className="max-w-md w-full mx-auto lg:mx-0">
        <h1 className="display text-5xl lg:hidden mb-10">{title}</h1>
        {children}
      </div>
    </div>
  );
}
