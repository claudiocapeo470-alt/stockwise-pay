import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyModules } from '@/hooks/useCompanyModules';
import {
  BarChart3, Package, ShoppingCart, Scan, FileText,
  FileCheck, CreditCard, Store, Users, Truck,
  TrendingUp, ClipboardList, Settings, User
} from 'lucide-react';

interface Tile {
  id: string;
  label: string;
  icon: any;
  color: string;
  href: string;
  permission: string | null;
}

const ALL_TILES: Tile[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, color: '#1565C0', href: '/app', permission: null },
  { id: 'stocks', label: 'Articles', icon: Package, color: '#2E7D32', href: '/app/stocks', permission: 'stock' },
  { id: 'clients', label: 'Clients', icon: Users, color: '#6A1B9A', href: '/app/clients', permission: 'sales' },
  { id: 'ventes', label: 'Ventes', icon: ShoppingCart, color: '#E65100', href: '/app/ventes', permission: 'sales' },
  { id: 'caisse', label: 'Caisse POS', icon: Scan, color: '#00838F', href: '/app/caisse', permission: 'pos' },
  { id: 'factures', label: 'Factures', icon: FileText, color: '#AD1457', href: '/app/factures', permission: 'sales' },
  { id: 'devis', label: 'Devis', icon: FileCheck, color: '#F57F17', href: '/app/devis', permission: 'sales' },
  { id: 'paiements', label: 'Paiements', icon: CreditCard, color: '#4527A0', href: '/app/paiements', permission: 'sales' },
  { id: 'boutique', label: 'Boutique', icon: Store, color: '#00695C', href: '/app/boutique/config', permission: 'boutique' },
  { id: 'commandes', label: 'Commandes', icon: ClipboardList, color: '#BF360C', href: '/app/boutique/commandes', permission: 'boutique_orders' },
  { id: 'livraisons', label: 'Livraisons', icon: Truck, color: '#37474F', href: '/app/livraisons', permission: 'deliveries' },
  { id: 'performance', label: 'Performance', icon: TrendingUp, color: '#1B5E20', href: '/app/performance', permission: null },
  { id: 'settings', label: 'Paramètres', icon: Settings, color: '#455A64', href: '/app/settings', permission: null },
  { id: 'profile', label: 'Mon profil', icon: User, color: '#880E4F', href: '/app/profile', permission: null },
];

export function MobileHomeGrid() {
  const navigate = useNavigate();
  const { isEmployee, hasPermission } = useAuth();
  const { hasModule } = useCompanyModules();

  const visibleTiles = ALL_TILES.filter(tile => {
    if (tile.permission && isEmployee && !hasPermission(tile.permission)) return false;
    // Module-based filtering for non-employees
    if (!isEmployee) {
      if (tile.id === 'boutique' || tile.id === 'commandes') return hasModule('boutique');
      if (tile.id === 'livraisons') return hasModule('livraisons');
    }
    return true;
  });

  return (
    <div className="grid grid-cols-3 gap-3 px-1">
      {visibleTiles.map((tile) => (
        <button
          key={tile.id}
          onClick={() => navigate(tile.href)}
          className="flex flex-col items-center justify-center rounded-2xl p-3 aspect-square gap-2 active:scale-95 transition-transform shadow-sm"
          style={{ backgroundColor: tile.color }}
        >
          <tile.icon className="h-7 w-7 text-white" strokeWidth={1.8} />
          <span className="text-white text-[11px] font-medium text-center leading-tight">
            {tile.label}
          </span>
        </button>
      ))}
    </div>
  );
}
