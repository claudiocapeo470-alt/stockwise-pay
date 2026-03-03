import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const EMOJI_CATEGORIES: Record<string, string[]> = {
  "Alimentation": ["🍔","🍕","🍗","🥩","🥚","🧀","🍞","🥖","🥐","🥗","🍜","🍚","🥘","🍲","🥫","🧆","🌮","🌯","🥙","🍖","🥓","🍟","🍿","🥨","🧈","🫙","🧂","🫒","🥜","🌰","🍱","🥪","🧇","🥞","🧁","🍰","🎂","🍮","🫕","🥣","🥧"],
  "Boissons": ["🥤","🧃","🍶","🍺","🍷","🥛","☕","🫖","🧋","🍵","🥂","🍸","🍹","🧊","💧","🫗","🍾","🥃","🍻"],
  "Fruits & Légumes": ["🍎","🍊","🍋","🍇","🍓","🍈","🍌","🍍","🥭","🍑","🫐","🥝","🍅","🥑","🥦","🥕","🌽","🥬","🧅","🧄","🥔","🍆","🥒","🫑","🌶️","🍒","🍐","🫚","🫛"],
  "Électronique": ["📱","💻","🖥️","⌨️","🖱️","🖨️","📷","📸","📹","📺","📻","🎙️","🎧","📡","🔋","🔌","💾","💿","📀","🕹️","⌚","📟","☎️","🔭","📠","🖲️"],
  "Vêtements": ["👗","👕","👖","🧥","👔","🩱","👒","🎩","👟","👠","👡","👢","👜","💍","👓","🕶️","💎","🧢","🧣","🧤","🧦","🩲","🩳","🩴","👙","🥻","🎒","👝","👛"],
  "Cosmétique": ["💄","💅","💆","🪥","🧴","🧼","🪮","🌸","🧖","🪞","✂️","🫧","🩹","💊","🩺","🌺","🌻","🏮","🧽"],
  "Maison": ["🪑","🛋️","🛏️","🚪","🪞","🪟","🏮","🧹","🧺","🫧","🪣","🧻","🪒","🔑","🔒","💡","🕯️","🪴","🛁","🚿","🧲","🏠","🏡"],
  "Matériel": ["🔧","🔨","🪛","⚙️","🗜️","🪚","🔩","🪝","🪜","⛏️","🛠️","🧲","🔦","🧰","⚗️","🔬","🏗️","🔗","⛓️"],
  "Scolaire": ["📚","📖","📝","✏️","🖊️","📏","📐","📌","📎","✂️","🖍️","🖋️","📦","🗂️","📁","📂","🗃️","📋","📊","📈","📉"],
  "Auto": ["🚗","🚕","🚙","🚌","🏎️","🚐","🚑","🚒","🚓","🚛","🚜","🛻","⛽","🛞","🔑","🪝","🚀","✈️","🚁","🛳️","🚂","⚓"],
  "Jardin": ["🌿","🌱","🌳","🌻","🌹","🌺","🪴","🌾","🍀","🌵","🪸","🍄","🌲","🌴","🎋","🎍","🪨","🪵","⛏️","🌊"],
  "Sport": ["⚽","🏀","🎾","🏈","⚾","🏐","🎱","🏓","🎯","🎮","🎲","🧸","🎸","🎹","🥊","🎳","🏋️","🤸","🧘","🎣","🏊","🚴","🧗"],
  "Santé": ["💊","🩺","💉","🩹","🏥","🩻","🧬","🔬","🩸","🧪","🌡️","🪥","🏃","🧘","🫁","🫀","🦷","🦴","👁️","🩼"],
  "Business": ["💼","💰","💳","🏦","📊","📈","📉","🤝","📋","🏷️","🎫","📣","🌐","📨","✉️","📮","📬","📭","📫","📪"],
  "Animaux": ["🐶","🐱","🐠","🐔","🐄","🐑","🐖","🦆","🐐","🦞","🦐","🐟","🐓","🦁","🐯","🐻","🦊","🐼","🦝","🐺"],
  "Divers": ["🎁","🛒","🏪","🏬","🏭","📦","🧲","🌐","⭐","🔥","✨","🏆","🎀","🎊","🎉","🪩","🎭","🎨","🖼️","🗺️"],
};

const CATEGORY_NAMES = ["Tous", ...Object.keys(EMOJI_CATEGORIES)];

// Flatten all emojis with their category for search
const ALL_EMOJIS = Object.entries(EMOJI_CATEGORIES).flatMap(([cat, emojis]) =>
  emojis.map(emoji => ({ emoji, category: cat }))
);

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = useMemo(() => {
    let items = ALL_EMOJIS;
    if (activeCategory !== "Tous") {
      items = items.filter(e => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(e =>
        e.category.toLowerCase().includes(q) || e.emoji.includes(q)
      );
    }
    return items;
  }, [search, activeCategory]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une icône... (burger, téléphone, eau...)"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory("Tous"); }}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_NAMES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => { setActiveCategory(cat); setSearch(""); }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <ScrollArea className="h-48 rounded-lg border border-border p-2">
        <div className="grid grid-cols-8 gap-1">
          {filtered.map(({ emoji }, i) => (
            <button
              key={`${emoji}-${i}`}
              type="button"
              onClick={() => onChange(emoji)}
              className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all hover:scale-[1.08] hover:border-primary/60 border ${
                value === emoji
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-transparent hover:bg-accent/50"
              }`}
            >
              <span className="text-[26px] leading-none">{emoji}</span>
              {value === emoji && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Aucune icône trouvée</p>
        )}
      </ScrollArea>
    </div>
  );
}

export const ICON_BG_COLORS = [
  { name: "bg-blue", gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe)", border: "#93c5fd" },
  { name: "bg-green", gradient: "linear-gradient(135deg, #dcfce7, #bbf7d0)", border: "#86efac" },
  { name: "bg-yellow", gradient: "linear-gradient(135deg, #fef3c7, #fde68a)", border: "#fcd34d" },
  { name: "bg-red", gradient: "linear-gradient(135deg, #fee2e2, #fecaca)", border: "#fca5a5" },
  { name: "bg-purple", gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe)", border: "#c4b5fd" },
  { name: "bg-pink", gradient: "linear-gradient(135deg, #fce7f3, #fbcfe8)", border: "#f9a8d4" },
  { name: "bg-cyan", gradient: "linear-gradient(135deg, #cffafe, #a5f3fc)", border: "#67e8f9" },
  { name: "bg-indigo", gradient: "linear-gradient(135deg, #e0e7ff, #c7d2fe)", border: "#a5b4fc" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function IconColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ICON_BG_COLORS.map(color => (
        <button
          key={color.name}
          type="button"
          onClick={() => onChange(color.name)}
          className={`h-8 w-8 rounded-full transition-all hover:scale-110 ${
            value === color.name ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
          }`}
          style={{ background: color.gradient, border: `2px solid ${color.border}` }}
        />
      ))}
    </div>
  );
}

export function getIconBgStyle(colorName: string) {
  const color = ICON_BG_COLORS.find(c => c.name === colorName) || ICON_BG_COLORS[0];
  return { background: color.gradient };
}
