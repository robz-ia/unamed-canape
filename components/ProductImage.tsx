"use client";

import Image from "next/image";
import { useState } from "react";
import SofaArt from "./SofaArt";

type Props = {
  src?: string;
  alt: string;
  seed?: number;
  tone?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export default function ProductImage({ src, alt, seed = 0, tone, priority, sizes = "50vw", className = "" }: Props) {
  const [failed, setFailed] = useState(!src);
  return (
    <div className={`relative overflow-hidden bg-ivory ${className}`}>
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center p-[12%]" role="img" aria-label={alt}>
          <SofaArt variant={seed} tone={tone} />
        </div>
      ) : (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
        />
      )}
    </div>
  );
}
