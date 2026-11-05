import { LayoutDashboard, ShoppingCart, TrendingUp, Wallet, Package, FileText, Receipt, AlertTriangle } from "lucide-react";
import { ProductArt, PRODUCT_ART, type ProductArtKey } from "@/components/ui/ProductArt";
import { IconTile, TONES, type Tone } from "@/components/ui/IconTile";
import { KpiCard } from "@/components/ui/KpiCard";

const ICONS = [LayoutDashboard, ShoppingCart, TrendingUp, Wallet, Package, FileText, Receipt, AlertTriangle];

/** Page temporaire de validation du design (non liée dans la navigation). */
export default function DesignTest() {
  const keys = Object.keys(PRODUCT_ART) as ProductArtKey[];
  const tones = Object.keys(TONES) as Tone[];
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <h1 className="text-2xl font-semibold">Test design</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Illustrations produit</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {keys.map((k, i) => (
            <div key={k} className="card-lift group animate-rise p-3" style={{ animationDelay: `${i * 35}ms` }}>
              <div className="flex items-end gap-2">
                <ProductArt art={k} size={44} />
                <ProductArt art={k} size={56} />
              </div>
              <ProductArt art={k} size={84} interactive className="mt-2 !w-full" />
              <p className="mt-2 text-sm font-medium">{k}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tons d'icônes</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {tones.map((t, i) => (
            <div key={t} className="flex flex-col items-center gap-2">
              <IconTile icon={ICONS[i]} tone={t} size={44} />
              <IconTile icon={ICONS[i]} tone={t} size={44} active />
              <span className="text-xs text-muted-foreground">{t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Cartes KPI</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard hero title="Chiffre d'affaires" value="1 250 000" unit="FCFA" icon={Wallet} delta="+12 %" trend={[3, 5, 4, 7, 6, 9, 11]} />
          <KpiCard title="Ventes" value="148" icon={ShoppingCart} tone="green" delta="+8 %" trend={[2, 3, 3, 5, 4, 6, 7]} style={{ animationDelay: "60ms" }} />
          <KpiCard title="Panier moyen" value="8 450" unit="FCFA" icon={TrendingUp} tone="violet" delta="-3 %" deltaTone="down" trend={[7, 6, 6, 5, 6, 4, 5]} style={{ animationDelay: "120ms" }} />
          <KpiCard title="Alertes de stock" value="6" icon={AlertTriangle} tone="amber" delta="2 ruptures" deltaTone="warn" trend={[1, 2, 2, 3, 4, 5, 6]} style={{ animationDelay: "180ms" }} />
        </div>
      </section>
    </main>
  );
}
