import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Unamed Canapé — accueil" className={`display text-[1.3rem] sm:text-[1.65rem] leading-none tracking-tight whitespace-nowrap ${className}`}>
      Unamed Canapé<span className="text-stone">.</span>
    </Link>
  );
}
