import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Package, ShoppingCart, FileText, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  type: 'product' | 'sale' | 'invoice' | 'member';
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();

  // Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === 'F3') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  const effectiveUserId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;

  const search = useCallback(async (q: string) => {
    if (!q.trim() || !effectiveUserId) { setResults([]); return; }
    setLoading(true);
    const term = `%${q}%`;
    const all: SearchResult[] = [];

    try {
      // Products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, sku, category, price')
        .eq('user_id', effectiveUserId)
        .or(`name.ilike.${term},sku.ilike.${term},category.ilike.${term}`)
        .limit(5);
      
      products?.forEach(p => all.push({
        id: p.id, label: p.name, sublabel: `${p.category || ''} — ${p.price?.toLocaleString()} FCFA`,
        type: 'product', href: '/app/stocks',
      }));

      // Sales
      const { data: sales } = await supabase
        .from('sales')
        .select('id, customer_name, total_amount, sale_date')
        .eq('user_id', effectiveUserId)
        .ilike('customer_name', term)
        .limit(5);
      
      sales?.forEach(s => all.push({
        id: s.id, label: s.customer_name || 'Vente',
        sublabel: `${s.total_amount?.toLocaleString()} FCFA`,
        type: 'sale', href: '/app/ventes',
      }));

      // Invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, document_number, client_name, total_amount')
        .eq('user_id', effectiveUserId)
        .or(`client_name.ilike.${term},document_number.ilike.${term}`)
        .limit(5);
      
      invoices?.forEach(inv => all.push({
        id: inv.id, label: inv.document_number,
        sublabel: inv.client_name,
        type: 'invoice', href: `/app/factures/${inv.id}`,
      }));

      // Team members (owner only)
      if (!isEmployee && company?.id) {
        const { data: members } = await supabase
          .from('company_members')
          .select('id, first_name, last_name')
          .eq('company_id', company.id)
          .or(`first_name.ilike.${term},last_name.ilike.${term}`)
          .limit(5);
        
        members?.forEach(m => all.push({
          id: m.id, label: `${m.first_name} ${m.last_name || ''}`,
          type: 'member', href: '/app/team',
        }));
      }
    } catch {}

    setResults(all);
    setLoading(false);
  }, [effectiveUserId, isEmployee, company?.id]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const typeIcons: Record<string, any> = {
    product: Package, sale: ShoppingCart, invoice: FileText, member: Users,
  };
  const typeLabels: Record<string, string> = {
    product: 'Produits', sale: 'Ventes', invoice: 'Factures', member: 'Équipe',
  };

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2 text-muted-foreground hidden sm:flex h-8">
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Rechercher...</span>
        <kbd className="pointer-events-none text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="sm:hidden text-muted-foreground">
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher produits, ventes, factures..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>{loading ? 'Recherche...' : 'Aucun résultat trouvé.'}</CommandEmpty>
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = typeIcons[type] || Package;
            return (
              <CommandGroup key={type} heading={typeLabels[type] || type}>
                {items.map(item => (
                  <CommandItem key={item.id} onSelect={() => { navigate(item.href); setOpen(false); setQuery(''); }}>
                    <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.label}</p>
                      {item.sublabel && <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
