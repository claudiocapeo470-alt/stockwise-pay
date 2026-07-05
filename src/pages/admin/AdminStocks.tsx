import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminAllProducts } from "@/hooks/useAdmin";

export default function AdminStocks() {
  const { data: products = [], isLoading } = useAdminAllProducts();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Stocks</h1>

      <Card>
        <CardHeader><CardTitle>Tous les Produits</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Chargement...</TableCell></TableRow>
              ) : products.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.profiles?.email}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell>{p.price} XOF</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
