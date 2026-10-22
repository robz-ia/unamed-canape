import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-32 text-center">
      <p className="eyebrow text-stone">Erreur 404</p>
      <h1 className="display text-6xl md:text-8xl mt-6">Place libre.</h1>
      <p className="text-stone mt-6">Cette page n&apos;existe pas, ou plus.</p>
      <Link href="/" className="btn btn-ghost mt-10">Retour à l&apos;accueil</Link>
    </div>
  );
}
