"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

// Défilement inertiel (sensation « fluide » des sites de maisons de luxe).
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
