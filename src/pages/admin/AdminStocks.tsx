import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
  price: number;
  category: string | null;
  user_id: string;
}

interface ProductWithUser extends Product {
  user_email: string;
}

export default function AdminStocks() {
  const [products, setProducts] = useState<ProductWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      // Récupérer tous les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('quantity', { ascending: true });

      if (productsError) throw productsError;

      // Récupérer les emails des utilisateurs
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email');

      const productsWithUsers: ProductWithUser[] = (productsData || []).map((product) => {
        const userProfile = profilesData?.find((p) => p.user_id === product.user_id);
        return {
          ...product,
          user_email: userProfile?.email || 'Inconnu',
        };
      });

      setProducts(productsWithUsers);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      toast.error('Erreur lors du chargement des stocks');
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity && p.quantity > 0);
  const outOfStockProducts = products.filter(p => p.quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion Globale des Stocks</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble de tous les stocks</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion Globale des Stocks</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de tous les produits dans le système
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dans le système
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nécessite réapprovisionnement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupture de Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Produits épuisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Inventaire global
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits</CardTitle>
          <CardDescription>Tous les produits du système par utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix Unitaire</TableHead>
                  <TableHead>Valeur Stock</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucun produit trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline">{product.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{product.user_email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.quantity}</span>
                          <span className="text-xs text-muted-foreground">
                            / min: {product.min_quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.quantity * product.price)}
                      </TableCell>
                      <TableCell>
                        {product.quantity === 0 ? (
                          <Badge variant="destructive">Rupture</Badge>
                        ) : product.quantity <= product.min_quantity ? (
                          <Badge variant="outline" className="border-orange-500 text-orange-700">
                            Stock faible
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">En stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
