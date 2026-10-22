import Image from "next/image";
import Link from "next/link";
import Reveal from "./motion/Reveal";
import { price } from "@/lib/format";
import type { Product } from "@/lib/types";
import { coverFor, defaultVariant, fromPrice, hasPriceRange, imagesFor } from "@/lib/variants";

// Carte produit : la configuration par défaut, son ambiance apparaît au survol.
export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const def = defaultVariant(product);
  const cover = coverFor(product, def);
  const mood = imagesFor(product.images, def).find((i) => i.id !== cover?.id && !i.on_white) ?? product.images.find((i) => i.id !== cover?.id && !i.on_white);
  const swatches = [...new Set(product.variants.map((v) => v.swatch_hex).filter(Boolean))] as string[];
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);

  return (
    <Reveal delay={(index % 3) * 0.12}>
      <Link href={`/produit/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
          {cover && (
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={`transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] ${cover.on_white ? "object-contain p-[8%] mix-blend-multiply" : "object-cover"}`}
            />
          )}
          {mood && (
            <Image
              src={mood.url}
              alt={mood.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-0 scale-[1.08] transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:scale-100"
            />
          )}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
            <span className="eyebrow !text-[0.6rem] text-stone group-hover:text-paper transition-colors duration-700">
              N° {String(index + 1).padStart(2, "0")}
            </span>
            {totalStock > 0 && totalStock <= 8 && <span className="eyebrow !text-[0.6rem] bg-paper px-2 py-1">Dernières pièces</span>}
          </div>
        </div>
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="display text-3xl md:text-[2.1rem] transition-all duration-700 group-hover:italic">{product.name}</h3>
            <p className="text-sm text-stone mt-2">{product.tagline}</p>
          </div>
          <p className="text-sm tabular-nums shrink-0 pt-1.5">
            {hasPriceRange(product) && <span className="text-stone">dès </span>}
            {price(fromPrice(product))}
          </p>
        </div>
        <div className="mt-4 flex gap-1.5">
          {swatches.map((hex) => (
            <span key={hex} className="size-2.5 rounded-full ring-1 ring-line" style={{ background: hex }} />
          ))}
        </div>
      </Link>
    </Reveal>
  );
}
