import { cn } from "@/lib/utils";

/* Illustration colors are fixed artwork (not theme tokens) by design. */
type Layer = [d: string, fill: string, opacity?: number];
const SH: Layer = ["M14 44a10 2 0 1 0 20 0 10 2 0 1 0 -20 0z", "#0B0B0F", 0.12];

export const PRODUCT_ART = {
  water: {
    bg: "#E3F3FE",
    layers: [
      SH,
      ["M21 6h6v5h-6z", "#2B7BD6"],
      ["M18 14q0-3 3-3h6q3 0 3 3v27a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z", "#7CC4F5"],
      ["M26 11h1q3 0 3 3v27a3 3 0 0 1-3 3h-1z", "#4FA7E8"],
      ["M18 22h12v9H18z", "#FFFFFF", 0.85],
      ["M20 14h2v24h-2z", "#FFFFFF", 0.5],
    ],
  },
  rice: {
    bg: "#FBF1D6",
    layers: [
      SH,
      ["M11 10h26l3 32H8z", "#F3E3B8"],
      ["M30 10h7l3 32h-8z", "#E2CB8F"],
      ["M13 20h22v12H13z", "#C9472F"],
      ["M11 10q13 4 26 0l-1-3H12z", "#E9D49B"],
      ["M14 12h2v28h-3z", "#FFFFFF", 0.4],
    ],
  },
  oil: {
    bg: "#FEF1CF",
    layers: [
      SH,
      ["M21 8h6v6h-6z", "#2F8F4E"],
      ["M17 14h14l2 6H15z", "#F5C842"],
      ["M12 20h24v22a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z", "#F2B705"],
      ["M28 20h8v22a3 3 0 0 1-3 3h-5z", "#D99A00"],
      ["M15 26h18v9H15z", "#FFFFFF", 0.8],
      ["M14 22h2v18h-2z", "#FFFFFF", 0.45],
    ],
  },
  sugar: {
    bg: "#E8EEFF",
    layers: [
      SH,
      ["M12 12h24v30H12z", "#F1F3F8"],
      ["M30 12h6v30h-6z", "#D9DEEA"],
      ["M12 12l4-5h24l-4 5z", "#FFFFFF"],
      ["M36 12l4-5v30l-4 5z", "#C4CBDC"],
      ["M14 22h16v8H14z", "#2447E8"],
    ],
  },
  milk: {
    bg: "#E6EDFF",
    layers: [
      SH,
      ["M16 8h16v6H16z", "#2447E8"],
      ["M14 14h20v28a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z", "#FFFFFF"],
      ["M28 14h6v28a2 2 0 0 1-2 2h-4z", "#DCE3F5"],
      ["M14 26h20v8H14z", "#5B7BFF"],
      ["M16 16h2v24h-2z", "#E9EEFC"],
    ],
  },
  soap: {
    bg: "#E3F8EE",
    layers: [
      SH,
      ["M8 24h32v14a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z", "#3CC48A"],
      ["M32 24h8v14a3 3 0 0 1-3 3h-5z", "#23A06C"],
      ["M8 24q16-8 32 0z", "#7EE0B5"],
      ["M14 29h14v6H14z", "#FFFFFF", 0.75],
      ["M30 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0z", "#FFFFFF", 0.9],
      ["M22 16a2 2 0 1 0 4 0 2 2 0 1 0-4 0z", "#FFFFFF", 0.8],
    ],
  },
  pasta: {
    bg: "#FDE9E4",
    layers: [
      SH,
      ["M14 6h20v36H14z", "#F0583F"],
      ["M30 6h4v36h-4z", "#C93F29"],
      ["M17 14h11v16H17z", "#FFFFFF", 0.85],
      ["M19 16h1v12h-1zM22 16h1v12h-1zM25 16h1v12h-1z", "#F2C14E"],
      ["M14 36h20v6H14z", "#2F8F4E"],
    ],
  },
  coffee: {
    bg: "#F4E9E1",
    layers: [
      SH,
      ["M15 10h18v6H15z", "#5A3825"],
      ["M13 16h22v26a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z", "#8B5A3C"],
      ["M29 16h6v26a3 3 0 0 1-3 3h-3z", "#6B4129"],
      ["M16 24h12v10H16z", "#F4E9E1"],
      ["M20 27q2-2 4 0q-2 4-4 0z", "#6B4129"],
    ],
  },
  tomato: {
    bg: "#FDE8E8",
    layers: [
      SH,
      ["M12 14h24v28a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z", "#C9CED9"],
      ["M12 14h24l-1-3H13z", "#A9AFBD"],
      ["M12 20h24v16H12z", "#E5484D"],
      ["M30 20h6v16h-6z", "#B8343A"],
      ["M20 26a4 4 0 1 0 8 0 4 4 0 1 0-8 0z", "#FFFFFF", 0.85],
      ["M22 22h4l-2 3z", "#2F8F4E"],
    ],
  },
  box: {
    bg: "#EEF0F4",
    layers: [
      SH,
      ["M24 8 40 16v16L24 40 8 32V16z", "#C9CED9"],
      ["M24 24 40 16v16L24 40z", "#A9AFBD"],
      ["M8 16 24 8l16 8-16 8z", "#E3E6EC"],
      ["M14 13l16 8v6l-3-1.5v-4.5L11 14.5z", "#D2A86A"],
    ],
  },
} satisfies Record<string, { bg: string; layers: Layer[] }>;

export type ProductArtKey = keyof typeof PRODUCT_ART;

/** Devine l'illustration à partir du nom ou de la catégorie. */
export function guessArtKey(name = "", category = ""): ProductArtKey {
  const s = `${name} ${category}`.toLowerCase();
  const rules: [RegExp, ProductArtKey][] = [
    [/eau|water|boisson|jus|soda|bouteille/, "water"],
    [/riz|farine|igname|attiéké|attieke|céréale|cereale/, "rice"],
    [/huile|oil|vinaigre/, "oil"],
    [/sucre|sel\b|sucr/, "sugar"],
    [/lait|milk|yaourt|nido|poudre/, "milk"],
    [/savon|soap|hygi|lessive|détergent|detergent/, "soap"],
    [/spaghetti|pâte|pate|macaroni|nouille/, "pasta"],
    [/café|cafe|coffee|thé\b|nescafé|chocolat/, "coffee"],
    [/tomate|conserve|sardine|concentré|concentre/, "tomato"],
  ];
  return rules.find(([re]) => re.test(s))?.[1] ?? "box";
}

type Props = {
  name?: string;
  category?: string;
  imageUrl?: string | null;
  /** taille de la tuile en px */
  size?: number;
  /** force une illustration précise */
  art?: ProductArtKey;
  className?: string;
  /** active l'effet de survol (parent avec `group`) */
  interactive?: boolean;
};

export function ProductArt({ name, category, imageUrl, size = 44, art: artKey, className, interactive }: Props) {
  const art = PRODUCT_ART[artKey ?? guessArtKey(name, category)];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl", className)}
      style={{ width: size, height: size, background: art.bg }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name ?? ""}
          loading="lazy"
          className={cn("h-full w-full object-cover", interactive && "art-hover")}
        />
      ) : (
        <svg
          viewBox="0 0 48 48"
          width={size * 0.76}
          height={size * 0.76}
          aria-hidden="true"
          className={cn(interactive && "art-hover")}
        >
          {art.layers.map(([d, fill, o], i) => (
            <path key={i} d={d} fill={fill} opacity={o ?? 1} />
          ))}
        </svg>
      )}
    </span>
  );
}

export default ProductArt;
