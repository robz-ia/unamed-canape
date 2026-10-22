// Catalogue de secours, identique à supabase/seed.sql.
// Utilisé uniquement si Supabase n'est pas configuré ou injoignable : le site reste consultable.
import type { Category, Product, Variant } from "@/lib/types";

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, slug: "canapes", name: "Canapés", description: "Des assises profondes, dessinées pour durer." },
  { id: 2, slug: "convertibles", name: "Convertibles", description: "Le salon le jour, la chambre d'amis le soir." },
  { id: 3, slug: "sculpturales", name: "Pièces sculpturales", description: "Des formes organiques, presque des œuvres." },
];

type Raw = Omit<Product, "id" | "category" | "images" | "variants"> & {
  category: string;
  variants: [string, string, string, string, number, number][]; // code, couleur, hex, matière, supplément, stock
};

const RAW: Raw[] = [
  {
    slug: "montaigne", name: "Montaigne", tagline: "Canapé-lit pour les appartements de ville",
    description: "Un canapé trois places aux lignes tendues qui se déplie en un vrai lit de 140 × 195 cm. Le mécanisme est invisible, l'assise reste ferme et généreuse au quotidien.",
    story: "Pensé pour les surfaces parisiennes où chaque mètre compte : un seul meuble, deux usages, aucun compromis sur l'allure.",
    category: "convertibles", base_price: 1890, compare_at_price: 2190, width_cm: 210, depth_cm: 95, height_cm: 82, seat_height_cm: 44, seats: 3,
    materials: "Bouclé de laine et polyester recyclé, mousse haute résilience 35 kg/m³", frame: "Hêtre massif et acier", lead_time_weeks: 5, is_featured: true,
    variants: [["IVO", "Ivoire", "#EEE8DC", "Bouclé", 0, 12], ["GRE", "Grège", "#C9BBA6", "Bouclé", 0, 6], ["ANT", "Anthracite", "#3B3A38", "Bouclé", 120, 3]],
  },
  {
    slug: "rive-gauche", name: "Rive Gauche", tagline: "Convertible rétro aux accents seventies",
    description: "Un convertible multifonction inspiré du mobilier américain des années 70. Il passe de canapé à méridienne puis à couchage d'appoint en un geste.",
    story: "Une silhouette basse et décontractée, pour les salons qui aiment recevoir tard.",
    category: "convertibles", base_price: 1490, compare_at_price: null, width_cm: 195, depth_cm: 92, height_cm: 78, seat_height_cm: 42, seats: 3,
    materials: "Velours épais, garnissage plumes et mousse", frame: "Pin massif, piètement noyer", lead_time_weeks: 4, is_featured: false,
    variants: [["COG", "Cognac", "#9A5B33", "Velours", 0, 8], ["CRE", "Crème", "#EFE6D6", "Velours", 0, 10], ["OLI", "Olive", "#6B6A45", "Velours", 90, 2]],
  },
  {
    slug: "petale", name: "Pétale", tagline: "Canapé design aux courbes de fleur",
    description: "Des coussins en pétales qui s'ouvrent autour de l'assise. Une pièce de designer, douce et graphique, qui transforme un salon en galerie.",
    story: "Chaque pétale est garni et cousu à la main dans notre atelier partenaire, puis assemblé un à un.",
    category: "sculpturales", base_price: 2690, compare_at_price: null, width_cm: 230, depth_cm: 105, height_cm: 74, seat_height_cm: 40, seats: 3,
    materials: "Chenille crème, plumes et mousse à mémoire de forme", frame: "Bois massif lamellé-collé", lead_time_weeks: 7, is_featured: true,
    variants: [["CRE", "Crème", "#F1E9DC", "Chénille", 0, 5], ["ROS", "Rose poudré", "#E3C6BC", "Chénille", 150, 4], ["SAU", "Sauge", "#A9B29A", "Chénille", 150, 3]],
  },
  {
    slug: "galet", name: "Galet", tagline: "Canapé organique en laine d'agneau",
    description: "Une forme irrégulière, comme polie par l'eau. Habillé d'une laine d'agneau bouclée, le Galet se pose au centre de la pièce et s'admire sous tous les angles.",
    story: "Aucune ligne droite : le Galet a été dessiné à la main avant d'être sculpté dans la mousse.",
    category: "sculpturales", base_price: 3190, compare_at_price: null, width_cm: 260, depth_cm: 120, height_cm: 72, seat_height_cm: 41, seats: 4,
    materials: "Laine d'agneau bouclée (fausse fourrure premium), mousse sculptée", frame: "Contreplaqué de bouleau", lead_time_weeks: 8, is_featured: true,
    variants: [["NEI", "Neige", "#F6F3EE", "Laine d'agneau", 0, 4], ["LIN", "Lin", "#D8CDBB", "Laine d'agneau", 0, 3], ["CAR", "Caramel", "#B07A4F", "Laine d'agneau", 200, 2]],
  },
  {
    slug: "alma", name: "Alma", tagline: "Canapé droit en chénille",
    description: "Un canapé droit d'une grande sobriété, recouvert d'une chénille au toucher velouté. Ses coussins déhoussables et son assise profonde en font la pièce du quotidien.",
    story: "La pièce que l'on garde vingt ans : intemporelle, robuste, facile à vivre.",
    category: "canapes", base_price: 2290, compare_at_price: null, width_cm: 240, depth_cm: 100, height_cm: 80, seat_height_cm: 43, seats: 4,
    materials: "Chénille 450 g/m², garnissage plumes et mousse", frame: "Hêtre massif", lead_time_weeks: 5, is_featured: false,
    variants: [["CRE", "Crème", "#EDE4D3", "Chénille", 0, 14], ["TAU", "Taupe", "#8C7B6B", "Chénille", 0, 9], ["PER", "Gris perle", "#BDBAB4", "Chénille", 0, 7]],
  },
  {
    slug: "nuage", name: "Nuage", tagline: "Canapé cloud, minimalisme nordique",
    description: "Le confort d'un nuage dans une silhouette nordique épurée. Ses modules profonds invitent à s'y enfoncer, ses volumes généreux restent d'une élégance absolue.",
    story: "Inspiré des intérieurs scandinaves : lumière, matière, et rien de superflu.",
    category: "canapes", base_price: 2890, compare_at_price: 3290, width_cm: 280, depth_cm: 110, height_cm: 70, seat_height_cm: 42, seats: 4,
    materials: "Bouclé crème, garnissage plumes et ouate", frame: "Pin nordique massif", lead_time_weeks: 6, is_featured: true,
    variants: [["IVO", "Ivoire", "#F3EEE4", "Bouclé", 0, 6], ["SAB", "Sable", "#D6C3A5", "Bouclé", 0, 5], ["BRU", "Gris brume", "#A7A5A0", "Bouclé", 180, 1]],
  },
];

const VIEWS = ["vue de face", "vue de trois-quarts", "détail de la matière"];

export const FALLBACK_PRODUCTS: Product[] = RAW.map(({ category, variants, ...p }) => {
  const cat = FALLBACK_CATEGORIES.find((c) => c.slug === category)!;
  return {
    ...p,
    id: `local-${p.slug}`,
    category: { slug: cat.slug, name: cat.name },
    images: VIEWS.map((v, i) => ({ id: `${p.slug}-${i + 1}`, url: `/products/${p.slug}/${i + 1}.jpg`, alt: `${p.name} — ${v}`, position: i + 1 })),
    variants: variants.map(
      ([code, color_name, color_hex, fabric, price_delta, stock], i): Variant => ({
        id: `local-${p.slug}-${code}`,
        sku: `${p.slug.slice(0, 3).toUpperCase()}-${code}`,
        color_name, color_hex, fabric, price_delta, stock, position: i + 1,
      })
    ),
  };
});
