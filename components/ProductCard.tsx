import Link from "next/link";
import ProductImage from "./ProductImage";
import { price } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  return (
    <Link
      href={`/produit/${product.slug}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative">
        <ProductImage
          src={product.images[0]?.url}
          alt={product.images[0]?.alt ?? product.name}
          seed={index}
          tone={product.variants[0]?.color_hex}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-square"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {product.compare_at_price && <span className="eyebrow bg-paper px-2.5 py-1">Offre</span>}
          {totalStock > 0 && totalStock <= 6 && <span className="eyebrow bg-paper px-2.5 py-1">Dernières pièces</span>}
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="display text-2xl">{product.name}</h3>
          <p className="text-sm text-stone mt-1">{product.tagline}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm">{price(product.base_price)}</p>
          {product.compare_at_price && <p className="text-xs text-stone line-through">{price(product.compare_at_price)}</p>}
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {product.variants.map((v) => (
          <span key={v.id} title={v.color_name} className="size-3 rounded-full border border-line" style={{ background: v.color_hex }} />
        ))}
      </div>
    </Link>
  );
}
