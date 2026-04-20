import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportRow {
  name?: string;
  sku?: string;
  category?: string;
  quantity?: number;
  min_quantity?: number;
  cost_price?: number;
  price?: number;
  unit?: string;
  valid: boolean;
  error?: string;
}

const COLUMN_MAP: Record<string, string> = {
  nom: 'name', name: 'name', produit: 'name', product: 'name',
  sku: 'sku', référence: 'sku', reference: 'sku', ref: 'sku',
  catégorie: 'category', categorie: 'category', category: 'category',
  quantité: 'quantity', quantite: 'quantity', quantity: 'quantity', stock: 'quantity', qty: 'quantity',
  'stock minimum': 'min_quantity', 'min stock': 'min_quantity', min_quantity: 'min_quantity', minimum: 'min_quantity',
  "prix d'achat": 'cost_price', 'prix achat': 'cost_price', cost_price: 'cost_price', 'purchase price': 'cost_price', cout: 'cost_price',
  'prix de vente': 'price', 'prix vente': 'price', prix: 'price', price: 'price', 'sale price': 'price',
  unité: 'unit', unite: 'unit', unit: 'unit',
};

export function ImportProductsDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addProduct } = useProducts();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (json.length === 0) {
          toast.error('Le fichier est vide');
          return;
        }

        // Map columns
        const mapped: ImportRow[] = json.map(row => {
          const mapped: any = {};
          Object.entries(row).forEach(([key, val]) => {
            const normalizedKey = key.toLowerCase().trim();
            const field = COLUMN_MAP[normalizedKey];
            if (field) mapped[field] = val;
          });

          const item: ImportRow = {
            name: String(mapped.name || '').trim(),
            sku: mapped.sku ? String(mapped.sku).trim() : undefined,
            category: mapped.category ? String(mapped.category).trim() : undefined,
            quantity: Number(mapped.quantity) || 0,
            min_quantity: Number(mapped.min_quantity) || 10,
            cost_price: Number(mapped.cost_price) || 0,
            price: Number(mapped.price) || 0,
            unit: mapped.unit ? String(mapped.unit).trim() : 'pièce',
            valid: true,
          };

          if (!item.name) { item.valid = false; item.error = 'Nom manquant'; }
          else if (item.price! <= 0) { item.valid = false; item.error = 'Prix invalide'; }

          return item;
        });

        setRows(mapped);
      } catch {
        toast.error("Erreur de lecture du fichier");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r.valid);
    if (validRows.length === 0) { toast.error('Aucune ligne valide à importer'); return; }

    setImporting(true);
    let success = 0;
    let errors = 0;

    for (const row of validRows) {
      try {
        await addProduct.mutateAsync({
          name: row.name!,
          sku: row.sku || null,
          category: row.category || null,
          quantity: row.quantity || 0,
          min_quantity: row.min_quantity || 10,
          cost_price: row.cost_price || 0,
          price: row.price || 0,
          unit: row.unit || 'pièce',
        } as any);
        success++;
      } catch {
        errors++;
      }
    }

    setImporting(false);
    toast.success(`${success} produits importés avec succès${errors > 0 ? ` (${errors} erreurs)` : ''}`);
    setRows([]);
    setOpen(false);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Nom: 'T-Shirt Blanc', SKU: 'TSH-001', Catégorie: 'Vêtements', Quantité: 50, 'Stock minimum': 10, "Prix d'achat": 3000, 'Prix de vente': 5000, Unité: 'pièce' },
      { Nom: 'Cahier A4', SKU: 'CAH-001', Catégorie: 'Fournitures', Quantité: 200, 'Stock minimum': 20, "Prix d'achat": 500, 'Prix de vente': 750, Unité: 'pièce' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produits');
    XLSX.writeFile(wb, 'modele_import_produits.xlsx');
  };

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="h-11 gap-2">
        <Upload className="h-4 w-4" /> Importer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Import de produits
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {rows.length === 0 ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium mb-1">Sélectionnez un fichier Excel ou CSV</p>
                  <p className="text-sm text-muted-foreground mb-4">Formats acceptés : .xlsx, .csv</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" onChange={handleFile} className="hidden" />
                  <Button onClick={() => fileRef.current?.click()}>Choisir un fichier</Button>
                </div>
                <Button variant="ghost" size="sm" onClick={downloadTemplate} className="w-full">
                  <Download className="h-4 w-4 mr-2" /> Télécharger le modèle d'import
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <CheckCircle className="h-3 w-3 mr-1" /> {validCount} valides
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" /> {invalidCount} erreurs
                    </Badge>
                  )}
                </div>

                <div className="border rounded-lg overflow-auto max-h-60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Qté</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.slice(0, 20).map((row, i) => (
                        <TableRow key={i} className={!row.valid ? 'bg-destructive/5' : ''}>
                          <TableCell className="text-sm">{row.name || '—'}</TableCell>
                          <TableCell className="text-sm">{row.sku || '—'}</TableCell>
                          <TableCell className="text-sm">{row.price?.toLocaleString() || '0'}</TableCell>
                          <TableCell className="text-sm">{row.quantity || 0}</TableCell>
                          <TableCell>
                            {row.valid ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <span className="text-xs text-destructive">{row.error}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {rows.length > 20 && <p className="text-xs text-muted-foreground text-center">... et {rows.length - 20} autres lignes</p>}
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            {rows.length > 0 && (
              <>
                <Button variant="outline" onClick={() => { setRows([]); if (fileRef.current) fileRef.current.value = ''; }}>
                  Changer de fichier
                </Button>
                <Button onClick={handleImport} disabled={importing || validCount === 0}>
                  {importing ? 'Import en cours...' : `Importer ${validCount} produits`}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
