import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowDown, ArrowUp, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StockMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  created_at: string;
  product?: { name: string };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  productName?: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  sale: { label: 'Vente', color: 'destructive' },
  purchase: { label: 'Achat', color: 'default' },
  adjustment: { label: 'Ajustement', color: 'secondary' },
  return: { label: 'Retour', color: 'outline' },
  loss: { label: 'Perte', color: 'destructive' },
};

export function StockMovementsDialog({ open, onOpenChange, productId, productName }: Props) {
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const effectiveUserId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;

  useEffect(() => {
    if (!open || !effectiveUserId) return;

    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from('stock_movements')
        .select('*, product:products(name)')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (productId) query = query.eq('product_id', productId);

      const { data } = await query;
      setMovements((data as any[]) || []);
      setLoading(false);
    };

    fetch();
  }, [open, effectiveUserId, productId]);

  const filtered = typeFilter === 'all' ? movements : movements.filter(m => m.movement_type === typeFilter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des mouvements {productName ? `— ${productName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="sale">Ventes</SelectItem>
              <SelectItem value="purchase">Achats</SelectItem>
              <SelectItem value="adjustment">Ajustements</SelectItem>
              <SelectItem value="return">Retours</SelectItem>
              <SelectItem value="loss">Pertes</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} mouvement(s)</span>
        </div>

        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Aucun mouvement enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {!productId && <TableHead>Produit</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Qté</TableHead>
                  <TableHead className="text-center">Avant</TableHead>
                  <TableHead className="text-center">Après</TableHead>
                  <TableHead>Motif</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => {
                  const typeInfo = TYPE_LABELS[m.movement_type] || { label: m.movement_type, color: 'secondary' };
                  const isNegative = m.movement_type === 'sale' || m.movement_type === 'loss';
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(m.created_at), 'dd/MM/yy HH:mm', { locale: fr })}
                      </TableCell>
                      {!productId && <TableCell className="text-xs font-medium">{(m as any).product?.name || '—'}</TableCell>}
                      <TableCell><Badge variant={typeInfo.color as any} className="text-[10px]">{typeInfo.label}</Badge></TableCell>
                      <TableCell className="text-center">
                        <span className={`flex items-center justify-center gap-0.5 text-xs font-medium ${isNegative ? 'text-destructive' : 'text-green-600'}`}>
                          {isNegative ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                          {m.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-xs">{m.previous_quantity}</TableCell>
                      <TableCell className="text-center text-xs font-medium">{m.new_quantity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.reason || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
