// Catalogue de secours, identique à supabase/seed.sql.
// Utilisé uniquement si Supabase n'est pas configuré ou injoignable : le site reste consultable.
import { MODELS } from "@/lib/models";
import type { Category, Product, Variant } from "@/lib/types";

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, slug: "canapes", name: "Canapés", description: "Des assises profondes, dessinées pour durer." },
  { id: 2, slug: "convertibles", name: "Convertibles", description: "Le salon le jour, la chambre d'amis le soir." },
  { id: 3, slug: "sculpturales", name: "Pièces sculpturales", description: "Des formes organiques, presque des œuvres." },
];

type Raw = Omit<Product, "id" | "category" | "images" | "variants" | "model_url"> & {
  category: string;
  images: string[]; // légendes, dans l'ordre de /public/products/<slug>/<n>.jpg
  variants: [string, string, string, string, number, number][]; // code, couleur, hex, matière, supplément, stock
};

const RAW: Raw[] = [
  {
    slug: "meandre", name: "Méandre", tagline: "Canapé incurvé en bouclé",
    description: "Une longue courbe de bouclé blanc qui épouse la pièce plutôt que le mur. Son dossier ondulé dessine deux espaces de conversation ; on s'y installe de tous côtés.",
    story: "Dessiné pour les grands volumes : une pièce que l'on contourne, que l'on regarde, avant de s'y asseoir.",
    category: "sculpturales", base_price: 2990, compare_at_price: null, width_cm: 240, depth_cm: 85, height_cm: 66, seat_height_cm: 42, seats: 4,
    materials: "Bouclé, mousse haute résilience", frame: "Bois massif", lead_time_weeks: 6, is_featured: true,
    images: ["courbe du dossier en bouclé", "dans un salon lumineux", "vue de trois-quarts", "vue d'ensemble", "détail du bouclé"],
    variants: [["IVO", "Ivoire", "#F1ECE2", "Bouclé", 0, 6], ["ECR", "Écru", "#E6DCCB", "Bouclé", 0, 4], ["GRE", "Grège", "#C9BBA6", "Bouclé", 150, 2]],
  },
  {
    slug: "petale", name: "Pétale", tagline: "Fauteuil pivotant et son pouf",
    description: "Un fauteuil en pétales de bouclé posé sur une base pivotante en acier noir, livré avec son pouf assorti. On s'y love, puis on pivote vers la fenêtre ou vers la conversation.",
    story: "Chaque pétale est garni séparément pour soutenir le dos jusqu'à la nuque.",
    category: "sculpturales", base_price: 1290, compare_at_price: null, width_cm: 100, depth_cm: 100, height_cm: 70, seat_height_cm: 40, seats: 1,
    materials: "Bouclé, garnissage coton et mousse — pouf Ø 60 × H 25 cm inclus", frame: "Base pivotante en acier laqué noir", lead_time_weeks: 4, is_featured: true,
    images: ["fauteuil sur sa base pivotante", "dans un salon", "le pouf assorti"],
    variants: [["CRE", "Crème", "#F1E9DC", "Bouclé", 0, 6], ["ROS", "Rose poudré", "#E3C6BC", "Bouclé", 0, 4], ["BLE", "Bleu ciel", "#BFD0DD", "Bouclé", 0, 3], ["SAU", "Sauge", "#A9B29A", "Bouclé", 0, 3], ["GRI", "Gris perle", "#BDBAB4", "Bouclé", 0, 2]],
  },
  {
    slug: "galet", name: "Galet", tagline: "Canapé organique en laine d'agneau",
    description: "Un trois-places aux coussins bombés et aux accoudoirs sculptés, habillé d'une laine d'agneau bouclée. Sans un seul angle, il devient naturellement la pièce centrale du salon.",
    story: "Ses formes ont été dessinées à la main avant d'être sculptées dans la mousse.",
    category: "sculpturales", base_price: 2790, compare_at_price: null, width_cm: 230, depth_cm: 95, height_cm: 75, seat_height_cm: 42, seats: 3,
    materials: "Sherpa (laine d'agneau synthétique), mousse haute résilience", frame: "Bois massif", lead_time_weeks: 6, is_featured: true,
    images: ["vue de face", "dans un salon", "vue de trois-quarts", "avec ses fauteuils", "ambiance"],
    variants: [["NEI", "Neige", "#F4F0E8", "Sherpa", 0, 4], ["LIN", "Lin", "#D8CDBB", "Sherpa", 0, 3], ["CAR", "Caramel", "#B07A4F", "Sherpa", 200, 2]],
  },
  {
    slug: "nuage", name: "Nuage", tagline: "Canapé nuage, minimalisme nordique",
    description: "Des volumes arrondis qui s'enchaînent comme un nuage, recouverts d'un bouclé dense. Existe aussi en fauteuil (110 cm) et en deux-places (165 cm).",
    story: "Inspiré des intérieurs scandinaves : lumière, matière, et rien de superflu.",
    category: "canapes", base_price: 2190, compare_at_price: 2490, width_cm: 190, depth_cm: 78, height_cm: 85, seat_height_cm: 42, seats: 3,
    materials: "Bouclé, mousse haute résilience", frame: "Bois massif", lead_time_weeks: 5, is_featured: true,
    images: ["canapé trois-places ivoire", "fauteuil ivoire", "ensemble dans un salon", "en noir encre", "fauteuil noir encre"],
    variants: [["IVO", "Ivoire", "#F3EEE4", "Bouclé", 0, 6], ["NOI", "Noir encre", "#1E1D1C", "Bouclé", 0, 3]],
  },
  {
    slug: "alma", name: "Alma", tagline: "Canapé droit en chénille, assise profonde",
    description: "Des coussins boudinés en chénille, 50 cm de profondeur d'assise et des appuie-tête relevables soulignés d'un liseré cognac. Alma se compose de 180 à 390 cm selon votre pièce.",
    story: "La pièce du quotidien : on s'y allonge, on y reçoit, on la garde vingt ans.",
    category: "canapes", base_price: 2390, compare_at_price: null, width_cm: 240, depth_cm: 85, height_cm: 80, seat_height_cm: 40, seats: 4,
    materials: "Chénille, mousse haute résilience", frame: "Bois massif", lead_time_weeks: 5, is_featured: false,
    images: ["en crème", "en gris perle", "en vert forêt", "détail des appuie-tête", "nuancier des coloris"],
    variants: [["CRE", "Crème", "#EDE4D3", "Chénille", 0, 12], ["GRI", "Gris perle", "#B9B8B4", "Chénille", 0, 8], ["VER", "Vert forêt", "#5E6F4E", "Chénille", 0, 5], ["BLE", "Bleu nuit", "#2F4B5C", "Chénille", 0, 3]],
  },
  {
    slug: "rive-gauche", name: "Rive Gauche", tagline: "Convertible rétro en cuir huilé",
    description: "Un deux-places en cuir huilé-ciré au capitonnage généreux, qui se déplie en un lit de 200 × 150 cm. Son dossier s'incline sur cinq positions et ses accoudoirs cachent des poches de rangement.",
    story: "L'esprit des clubs américains des années 70, repensé pour les appartements d'aujourd'hui.",
    category: "convertibles", base_price: 1690, compare_at_price: 1890, width_cm: 150, depth_cm: 76, height_cm: 80, seat_height_cm: 42, seats: 2,
    materials: "Cuir huilé-ciré, mousse haute résilience ou latex", frame: "Bois massif, pieds en acier inoxydable", lead_time_weeks: 4, is_featured: false,
    images: ["vue de trois-quarts", "dans un salon", "avec plaid", "version une et deux places"],
    variants: [["COG", "Cognac", "#9A5B33", "Cuir huilé · mousse HR", 0, 8], ["LAT", "Cognac latex", "#9A5B33", "Cuir huilé · latex naturel", 120, 4]],
  },
];

export const FALLBACK_PRODUCTS: Product[] = RAW.map(({ category, variants, images, ...p }) => {
  const cat = FALLBACK_CATEGORIES.find((c) => c.slug === category)!;
  return {
    ...p,
    id: `local-${p.slug}`,
    model_url: MODELS[p.slug] ?? null,
    category: { slug: cat.slug, name: cat.name },
    images: images.map((alt, i) => ({ id: `${p.slug}-${i + 1}`, url: `/products/${p.slug}/${i + 1}.jpg`, alt: `${p.name} — ${alt}`, position: i + 1 })),
    variants: variants.map(
      ([code, color_name, color_hex, fabric, price_delta, stock], i): Variant => ({
        id: `local-${p.slug}-${code}`,
        sku: `${p.slug.replace("-", "").slice(0, 3).toUpperCase()}-${code}`,
        color_name, color_hex, fabric, price_delta, stock, position: i + 1,
      })
    ),
  };
});
