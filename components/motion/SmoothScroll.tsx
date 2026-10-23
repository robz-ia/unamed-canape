"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import "lenis/dist/lenis.css";

// À chaque changement de page : retour en haut instantané (sinon le défilement inertiel
// anime la remontée et l'on voit défiler l'ancienne page jusqu'au pied de page).
function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return null;
}

// Défilement inertiel (sensation « fluide » des sites de maisons de luxe).
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
