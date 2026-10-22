// Catalogue de secours, identique à supabase/seed.sql.
// Utilisé uniquement si Supabase n'est pas configuré ou injoignable : le site reste consultable.
import type { Category, Product, Variant } from "@/lib/types";

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, slug: "canapes", name: "Canapés", description: "Des assises profondes, dessinées pour durer." },
  { id: 2, slug: "convertibles", name: "Convertibles", description: "Le salon le jour, la chambre d'amis le soir." },
  { id: 3, slug: "sculpturales", name: "Pièces sculpturales", description: "Des formes organiques, presque des œuvres." },
];

type Img = [alt: string, option1?: string | null, option2?: string | null];
type Var = [code: string, option1: string, option2: string | null, hex: string | null, delta: number, stock: number, isDefault?: boolean];
type Raw = Omit<Product, "id" | "category" | "images" | "variants"> & { category: string; images: Img[]; white: number[]; variants: Var[] };

const RAW: Raw[] = [
  {
    white: [1],
    slug: "meandre", name: "Méandre", tagline: "Canapé incurvé en bouclé",
    description: "Une longue courbe de bouclé qui épouse la pièce plutôt que le mur. Son dossier ondulé dessine deux espaces de conversation ; on s'y installe de tous côtés. Trois longueurs : 180, 210 ou 240 cm.",
    story: "Dessiné pour les grands volumes : une pièce que l'on contourne, que l'on regarde, avant de s'y asseoir.",
    category: "sculpturales", base_price: 2390, compare_at_price: null, width_cm: 240, depth_cm: 85, height_cm: 66, seat_height_cm: 42, seats: 4,
    materials: "Bouclé, mousse haute résilience", frame: "Bois massif", lead_time_weeks: 6, option1_name: "Longueur", option2_name: "Coloris", is_featured: true,
    images: [["trois vues du canapé incurvé"], ["dans un salon classique"]],
    variants: [
      ["180-IVO", "180 cm", "Ivoire", "#F1ECE2", 0, 3], ["180-ECR", "180 cm", "Écru", "#E6DCCB", 0, 3], ["180-GRE", "180 cm", "Grège", "#C9BBA6", 150, 2],
      ["210-IVO", "210 cm", "Ivoire", "#F1ECE2", 300, 4], ["210-ECR", "210 cm", "Écru", "#E6DCCB", 300, 2], ["210-GRE", "210 cm", "Grège", "#C9BBA6", 450, 1],
      ["240-IVO", "240 cm", "Ivoire", "#F1ECE2", 600, 5, true], ["240-ECR", "240 cm", "Écru", "#E6DCCB", 600, 3], ["240-GRE", "240 cm", "Grège", "#C9BBA6", 750, 2],
    ],
  },
  {
    white: [1, 3],
    slug: "petale", name: "Pétale", tagline: "Fauteuil pivotant et son pouf",
    description: "Un fauteuil en pétales de bouclé posé sur une base pivotante en acier noir, livré avec son pouf assorti. On s'y love, puis on pivote vers la fenêtre ou vers la conversation.",
    story: "Chaque pétale est garni séparément pour soutenir le dos jusqu'à la nuque.",
    category: "sculpturales", base_price: 1290, compare_at_price: null, width_cm: 100, depth_cm: 100, height_cm: 70, seat_height_cm: 40, seats: 1,
    materials: "Bouclé, garnissage coton et mousse — pouf Ø 60 × H 25 cm inclus", frame: "Base pivotante en acier laqué noir", lead_time_weeks: 4,
    option1_name: "Coloris", option2_name: null, is_featured: true,
    images: [["fauteuil sur sa base pivotante"], ["dans un salon lumineux"], ["dimensions et pouf"]],
    variants: [
      ["CRE", "Crème", null, "#F1E9DC", 0, 6, true], ["ROS", "Rose poudré", null, "#E3C6BC", 0, 4], ["BLE", "Bleu ciel", null, "#BFD0DD", 0, 3],
      ["SAU", "Sauge", null, "#A9B29A", 0, 3], ["GRI", "Gris perle", null, "#BDBAB4", 0, 2],
    ],
  },
  {
    white: [1],
    slug: "galet", name: "Galet", tagline: "Canapé organique en laine d'agneau",
    description: "Un trois-places aux coussins bombés et aux accoudoirs sculptés, habillé d'une laine d'agneau bouclée. Sans un seul angle, il devient naturellement la pièce centrale du salon.",
    story: "Ses formes ont été dessinées à la main avant d'être sculptées dans la mousse.",
    category: "sculpturales", base_price: 2790, compare_at_price: null, width_cm: 230, depth_cm: 95, height_cm: 75, seat_height_cm: 42, seats: 3,
    materials: "Sherpa (laine d'agneau synthétique), mousse haute résilience", frame: "Bois massif", lead_time_weeks: 6,
    option1_name: "Coloris", option2_name: null, is_featured: true,
    images: [["vue de face"], ["dans un salon"], ["avec ses fauteuils"]],
    variants: [["NEI", "Neige", null, "#F4F0E8", 0, 4, true], ["LIN", "Lin", null, "#D8CDBB", 0, 3], ["CAR", "Caramel", null, "#B07A4F", 200, 2]],
  },
  {
    white: [],
    slug: "nuage", name: "Nuage", tagline: "Canapé nuage, minimalisme nordique",
    description: "Des volumes arrondis qui s'enchaînent comme un nuage, recouverts d'un bouclé dense. En canapé de 190 cm ou en fauteuil de 110 cm, en ivoire ou en noir encre.",
    story: "Inspiré des intérieurs scandinaves : lumière, matière, et rien de superflu.",
    category: "canapes", base_price: 1290, compare_at_price: null, width_cm: 190, depth_cm: 78, height_cm: 85, seat_height_cm: 42, seats: 3,
    materials: "Bouclé, mousse haute résilience", frame: "Bois massif", lead_time_weeks: 5, option1_name: "Format", option2_name: "Coloris", is_featured: true,
    images: [
      ["canapé ivoire", "Canapé 190 cm", "Ivoire"], ["fauteuil ivoire", "Fauteuil 110 cm", "Ivoire"],
      ["fauteuil noir encre", "Fauteuil 110 cm", "Noir encre"], ["canapé noir encre", "Canapé 190 cm", "Noir encre"],
    ],
    variants: [
      ["CAN-IVO", "Canapé 190 cm", "Ivoire", "#F3EEE4", 900, 5, true], ["CAN-NOI", "Canapé 190 cm", "Noir encre", "#1E1D1C", 900, 3],
      ["FAU-IVO", "Fauteuil 110 cm", "Ivoire", "#F3EEE4", 0, 6], ["FAU-NOI", "Fauteuil 110 cm", "Noir encre", "#1E1D1C", 0, 4],
    ],
  },
  {
    white: [1, 6],
    slug: "alma", name: "Alma", tagline: "Canapé droit en chénille, assise profonde",
    description: "Des coussins boudinés en chénille, 50 cm de profondeur d'assise et des appuie-tête relevables soulignés d'un liseré cognac. En trois places (210 cm) ou quatre places (280 cm).",
    story: "La pièce du quotidien : on s'y allonge, on y reçoit, on la garde vingt ans.",
    category: "canapes", base_price: 2390, compare_at_price: null, width_cm: 210, depth_cm: 85, height_cm: 80, seat_height_cm: 40, seats: 3,
    materials: "Chénille, mousse haute résilience", frame: "Bois massif", lead_time_weeks: 5, option1_name: "Longueur", option2_name: "Coloris", is_featured: false,
    images: [
      ["en crème, vue de trois-quarts", null, "Crème"], ["en crème dans un salon", null, "Crème"], ["en sable", null, "Sable"],
      ["en gris perle", null, "Gris perle"], ["en vert forêt", null, "Vert forêt"], ["dimensions et compositions"],
    ],
    variants: [
      ["210-CRE", "210 cm · 3 places", "Crème", "#EDE4D3", 0, 8, true], ["210-SAB", "210 cm · 3 places", "Sable", "#CBB9A0", 0, 5],
      ["210-GRI", "210 cm · 3 places", "Gris perle", "#B9B8B4", 0, 6], ["210-VER", "210 cm · 3 places", "Vert forêt", "#5E6F4E", 0, 3],
      ["280-CRE", "280 cm · 4 places", "Crème", "#EDE4D3", 700, 4], ["280-SAB", "280 cm · 4 places", "Sable", "#CBB9A0", 700, 2],
      ["280-GRI", "280 cm · 4 places", "Gris perle", "#B9B8B4", 700, 3], ["280-VER", "280 cm · 4 places", "Vert forêt", "#5E6F4E", 700, 1],
    ],
  },
  {
    white: [1, 4, 5, 6],
    slug: "rive-gauche", name: "Rive Gauche", tagline: "Convertible rétro en cuir huilé",
    description: "Un convertible en cuir huilé-ciré au capitonnage généreux. La version deux places se déplie en un lit de 200 × 150 cm ; son dossier s'incline sur cinq positions et ses accoudoirs cachent des poches de rangement.",
    story: "L'esprit des clubs américains des années 70, repensé pour les appartements d'aujourd'hui.",
    category: "convertibles", base_price: 1190, compare_at_price: null, width_cm: 150, depth_cm: 76, height_cm: 80, seat_height_cm: 42, seats: 2,
    materials: "Cuir huilé-ciré", frame: "Bois massif, pieds en acier inoxydable", lead_time_weeks: 4, option1_name: "Format", option2_name: "Garnissage", is_featured: false,
    images: [
      ["deux places, vue de trois-quarts", "Deux places"], ["une place dans un salon", "Une place"], ["deux places avec plaid", "Deux places"],
      ["versions une et deux places", "Une place"], ["positions canapé, lit et méridienne", "Deux places"], ["dimensions du deux places", "Deux places"],
    ],
    variants: [
      ["2P-MOU", "Deux places", "Mousse haute résilience", null, 500, 8, true], ["2P-LAT", "Deux places", "Latex naturel", null, 620, 4],
      ["1P-MOU", "Une place", "Mousse haute résilience", null, 0, 6], ["1P-LAT", "Une place", "Latex naturel", null, 120, 3],
    ],
  },
];

export const FALLBACK_PRODUCTS: Product[] = RAW.map(({ category, variants, images, white, ...p }) => {
  const cat = FALLBACK_CATEGORIES.find((c) => c.slug === category)!;
  const prefix = p.slug.replace("-", "").slice(0, 3).toUpperCase();
  return {
    ...p,
    id: `local-${p.slug}`,
    category: { slug: cat.slug, name: cat.name },
    images: images.map(([alt, option1 = null, option2 = null], i) => ({
      id: `${p.slug}-${i + 1}`,
      url: `/products/${p.slug}/${i + 1}.jpg`,
      alt: `${p.name} — ${alt}`,
      option1,
      option2,
      on_white: white.includes(i + 1),
      position: i + 1,
    })),
    variants: variants.map(
      ([code, option1, option2, swatch_hex, price_delta, stock, isDefault], i): Variant => ({
        id: `local-${p.slug}-${code}`,
        sku: `${prefix}-${code}`,
        option1, option2, swatch_hex, price_delta, stock,
        is_default: !!isDefault,
        position: i + 1,
      })
    ),
  };
});
