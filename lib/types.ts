export type Variant = {
  id: string;
  sku: string;
  option1: string;
  option2: string | null;
  swatch_hex: string | null;
  price_delta: number;
  stock: number;
  is_default: boolean;
  position: number;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  option1: string | null; // photo propre à une valeur d'option (null = commune)
  option2: string | null;
  on_white: boolean; // fond blanc : posée sur l'ivoire, pas recadrée
  position: number;
};

export type Category = { id: number; slug: string; name: string; description: string | null; cover_url: string | null };

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
  option1_name: string;
  option2_name: string | null;
  is_featured: boolean;
  category: Pick<Category, "slug" | "name"> | null;
  memberships: { slug: string; option1: string | null }[]; // catégories où apparaît le produit
  focus?: string | null; // configuration mise en avant dans la liste courante (ex. « Fauteuil 110 cm »)
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
