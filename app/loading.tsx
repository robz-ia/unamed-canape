// Pendant le chargement d'une page : on garde la hauteur de l'écran (sinon le pied de page
// remonte et « clignote ») et on affiche une fine barre de progression en haut.
export default function Loading() {
  return (
    <div className="min-h-[100svh]" aria-busy="true" aria-label="Chargement">
      <div className="fixed top-0 inset-x-0 z-[60] h-px overflow-hidden">
        <div className="h-full w-1/3 bg-ink animate-[loading_1.2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
      </div>
    </div>
  );
}
