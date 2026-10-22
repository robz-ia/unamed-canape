"use client";

import { useState } from "react";

// Délai à appliquer aux animations d'arrivée : on attend la fin de l'intro si elle se joue.
export function useIntroDelay(base = 0.2) {
  const [delay] = useState(() =>
    typeof document !== "undefined" && !document.documentElement.classList.contains("intro-seen") ? base + 2.6 : base
  );
  return delay;
}
