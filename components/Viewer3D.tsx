"use client";

import { createElement, useEffect, useState } from "react";

// Visionneuse 3D : rotation 360°, zoom, réalité augmentée sur mobile (« Voir chez moi »).
export default function Viewer3D({ src, alt, poster }: { src: string; alt: string; poster?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true));
  }, []);

  return (
    <div className="relative w-full h-full bg-ivory">
      {ready &&
        createElement(
          "model-viewer",
          {
            src,
            alt,
            poster,
            "camera-controls": true,
            "auto-rotate": true,
            "auto-rotate-delay": 1500,
            "rotation-per-second": "18deg",
            "interaction-prompt": "auto",
            "shadow-intensity": "1",
            "shadow-softness": "0.9",
            exposure: "1.05",
            "environment-image": "neutral",
            "tone-mapping": "neutral",
            "camera-orbit": "30deg 75deg auto",
            "min-camera-orbit": "auto 20deg auto",
            "max-camera-orbit": "auto 95deg auto",
            ar: true,
            "ar-modes": "webxr scene-viewer quick-look",
            "touch-action": "pan-y",
            style: { width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" },
          },
          createElement(
            "button",
            {
              slot: "ar-button",
              className: "btn btn-solid !py-2.5 !px-5 absolute bottom-4 right-4",
            },
            "Voir chez moi"
          )
        )}
      {!ready && <p className="eyebrow text-stone absolute inset-0 flex items-center justify-center">Chargement 3D…</p>}
      <p className="eyebrow !text-[0.6rem] text-stone absolute top-4 left-4 pointer-events-none">
        Glissez pour tourner · pincez pour zoomer
      </p>
    </div>
  );
}
