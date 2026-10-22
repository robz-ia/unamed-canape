"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

// Chiffre qui défile jusqu'à sa valeur à l'entrée dans l'écran.
export default function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (node.textContent = `${prefix}${Math.round(v).toLocaleString("fr-FR")}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, to, suffix, prefix]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}0{suffix}
    </span>
  );
}
