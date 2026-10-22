export type Variant = {
  id: string;
  sku: string;
  color_name: string;
  color_hex: string;
  fabric: string;
  price_delta: number;
  stock: number;
  position: number;
};

export type ProductImage = { id: string; url: string; alt: string; position: number };

export type Category = { id: number; slug: string; name: string; description: string | null };

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string | null;
  base_price: number;
  compare_at_price: number | null;
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  seat_height_cm: number | null;
  seats: number | null;
  materials: string | null;
  frame: string | null;
  lead_time_weeks: number;
  is_featured: boolean;
  category: Pick<Category, "slug" | "name"> | null;
  images: ProductImage[];
  variants: Variant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  variant: Variant & {
    product: Pick<Product, "id" | "slug" | "name" | "base_price"> & { images: ProductImage[] };
  };
};

export type OrderStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  preparing: "En atelier",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};
