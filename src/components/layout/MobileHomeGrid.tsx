import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyModules, type ModuleKey } from '@/hooks/useCompanyModules';
import {
  BarChart3, Package, ShoppingCart, Scan, FileText,
  FileCheck, CreditCard, Store, Users, Truck,
  TrendingUp, Settings, User, ShoppingBag, ClipboardList, Star
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

interface Tile {
  id: string;
  label: string;
  icon: any;
  color: string;
  href: string;
  permission: string | null;
  module?: ModuleKey;
  subItems?: { label: string; href: string; icon: any }[];
}

const ALL_TILES: Tile[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, color: '#1565C0', href: '/app', permission: null },
  { id: 'stocks', label: 'Articles', icon: Package, color: '#2E7D32', href: '/app/stocks', permission: 'stock', module: 'stock' },
  { id: 'clients', label: 'Clients', icon: Users, color: '#6A1B9A', href: '/app/clients', permission: 'customers' },
  { id: 'ventes', label: 'Ventes', icon: ShoppingCart, color: '#E65100', href: '/app/ventes', permission: 'sales', module: 'pos' },
  { id: 'caisse', label: 'Caisse POS', icon: Scan, color: '#00838F', href: '/app/caisse', permission: 'pos', module: 'pos' },
  { id: 'factures', label: 'Factures', icon: FileText, color: '#AD1457', href: '/app/factures', permission: 'sales', module: 'stock' },
  { id: 'devis', label: 'Devis', icon: FileCheck, color: '#F57F17', href: '/app/devis', permission: 'sales', module: 'stock' },
  { id: 'paiements', label: 'Paiements', icon: CreditCard, color: '#4527A0', href: '/app/paiements', permission: 'sales', module: 'pos' },
  {
    id: 'boutique', label: 'Boutique', icon: Store, color: '#00695C', href: '/app/boutique/config', permission: 'boutique', module: 'boutique',
    subItems: [
      { label: 'Ma Boutique', href: '/app/boutique/config', icon: Store },
      { label: 'Produits en ligne', href: '/app/boutique/produits', icon: ShoppingBag },
      { label: 'Commandes reçues', href: '/app/boutique/commandes', icon: ClipboardList },
      { label: 'Avis clients', href: '/app/boutique/avis', icon: Star },
    ],
  },
  { id: 'commandes', label: 'Commandes', icon: ClipboardList, color: '#BF360C', href: '/app/boutique/commandes', permission: 'boutique_orders', module: 'boutique' },
  { id: 'livraisons', label: 'Livraisons', icon: Truck, color: '#37474F', href: '/app/livraisons', permission: 'deliveries', module: 'stock' },
  { id: 'performance', label: 'Performance', icon: TrendingUp, color: '#1B5E20', href: '/app/performance', permission: 'reports' },
  { id: 'team', label: 'Mon équipe', icon: Users, color: '#0D47A1', href: '/app/team', permission: 'settings' },
  { id: 'settings', label: 'Paramètres', icon: Settings, color: '#455A64', href: '/app/settings', permission: null },
  { id: 'profile', label: 'Mon profil', icon: User, color: '#880E4F', href: '/app/profile', permission: null },
];

export function MobileHomeGrid() {
  const navigate = useNavigate();
  const { isEmployee, hasPermission } = useAuth();
  const { hasModule } = useCompanyModules();
  const [boutiqueOpen, setBoutiqueOpen] = useState(false);

  const visibleTiles = ALL_TILES.filter(tile => {
    if (tile.module && !hasModule(tile.module)) return false;
    if (tile.permission && isEmployee && !hasPermission(tile.permission)) return false;
    if (tile.id === 'team' && isEmployee) return false;
    return true;
  });

  const handleTileClick = (tile: Tile) => {
    if (tile.subItems && tile.subItems.length > 0) {
      setBoutiqueOpen(true);
      return;
    }
    navigate(tile.href);
  };

  const boutiqueTile = ALL_TILES.find(t => t.id === 'boutique');

  return (
    <>
      <div className="grid grid-cols-3 gap-3 px-1 w-full overflow-hidden">
        {visibleTiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            className="flex flex-col items-center justify-center rounded-2xl p-3 aspect-square gap-2 active:scale-95 transition-transform shadow-sm min-w-0"
            style={{ backgroundColor: tile.color }}
          >
            <tile.icon className="h-7 w-7 text-white" strokeWidth={1.8} />
            <span className="text-white text-[11px] font-medium text-center leading-tight line-clamp-2 break-words">
              {tile.label}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={boutiqueOpen} onOpenChange={setBoutiqueOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Boutique en ligne
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {boutiqueTile?.subItems?.map((item) => (
              <button
                key={item.href}
                onClick={() => { navigate(item.href); setBoutiqueOpen(false); }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 active:scale-95 transition-all"
              >
                <item.icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-center text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}