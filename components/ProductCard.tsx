import Image from "next/image";
import Link from "next/link";
import Reveal from "./motion/Reveal";
import { price } from "@/lib/format";
import type { Product } from "@/lib/types";

// Carte produit : la pièce détourée sur fond ivoire, l'ambiance apparaît au survol.
export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [cover, mood] = product.images;
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);

  return (
    <Reveal delay={(index % 3) * 0.12}>
      <Link href={`/produit/${product.slug}`} className="group block" data-cursor="Voir">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
          {cover && (
            <Image
              src={cover.url}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-[8%] mix-blend-multiply transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
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
            <div className="flex flex-col items-end gap-1.5">
              {product.compare_at_price && <span className="eyebrow !text-[0.6rem] bg-paper px-2 py-1">Prix de lancement</span>}
              {totalStock > 0 && totalStock <= 6 && <span className="eyebrow !text-[0.6rem] bg-paper px-2 py-1">Dernières pièces</span>}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="display text-3xl md:text-[2.1rem] transition-all duration-700 group-hover:italic">{product.name}</h3>
            <p className="text-sm text-stone mt-2">{product.tagline}</p>
          </div>
          <div className="text-right shrink-0 pt-1.5">
            <p className="text-sm tabular-nums">{price(product.base_price)}</p>
            {product.compare_at_price && <p className="text-xs text-stone line-through tabular-nums">{price(product.compare_at_price)}</p>}
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          {product.variants.map((v) => (
            <span key={v.id} title={v.color_name} className="size-2.5 rounded-full ring-1 ring-line" style={{ background: v.color_hex }} />
          ))}
        </div>
      </Link>
    </Reveal>
  );
}
