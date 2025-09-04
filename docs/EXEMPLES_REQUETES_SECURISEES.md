# 🔒 Exemples de Requêtes Sécurisées

## 📋 Requêtes Supabase avec RLS

### 1. Récupération des Produits Utilisateur

```typescript
// Hook useProducts.ts
const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      quantity,
      min_quantity,
      sku,
      category,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });
  
  // RLS applique automatiquement : WHERE user_id = auth.uid()
  // L'utilisateur ne voit QUE ses propres produits
  
  if (error) throw error;
  return data || [];
};
```

### 2. Ajout d'un Nouveau Produit

```typescript
// Mutation sécurisée
const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      user_id: user.id, // OBLIGATOIRE - associe le produit à l'utilisateur
    })
    .select()
    .single();
  
  // RLS vérifie : auth.uid() = user_id avant insertion
  
  if (error) throw error;
  return data;
};
```

### 3. Ventes avec Jointures Sécurisées

```typescript
// Hook useSales.ts
const fetchSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      quantity,
      unit_price,
      total_amount,
      customer_name,
      customer_phone,
      sale_date,
      created_at,
      products (
        name,
        sku,
        category
      )
    `)
    .order('created_at', { ascending: false });
  
  // RLS sur 'sales' : WHERE user_id = auth.uid()
  // RLS sur 'products' : WHERE user_id = auth.uid()
  // Double protection : ventes ET produits de l'utilisateur uniquement
  
  if (error) throw error;
  return data || [];
};
```

## 🛡️ Tests d'Isolation

### Test 1 : Vérification RLS

```sql
-- Test manuel dans Supabase SQL Editor
-- En tant qu'utilisateur A connecté :

SELECT * FROM products; 
-- Retourne SEULEMENT les produits de l'utilisateur A

INSERT INTO products (name, price, quantity, user_id) 
VALUES ('Test', 100, 10, 'autre-user-id');
-- ERREUR : "new row violates row-level security policy"

UPDATE products SET price = 200 WHERE id = 'produit-autre-user';
-- ERREUR : Aucune ligne affectée (produit invisible)
```

### Test 2 : Interface Vierge Nouveau Utilisateur

```typescript
// Test programmatique
const testNewUserInterface = () => {
  // 1. Nouvel utilisateur sans données
  const { products } = useProducts(); // []
  const { sales } = useSales(); // []
  const { payments } = usePayments(); // []
  
  // 2. Métriques à zéro
  console.log('Produits:', products.length); // 0
  console.log('Ventes:', sales.length); // 0
  console.log('CA Total:', sales.reduce((sum, s) => sum + s.total_amount, 0)); // 0
  
  // 3. Interface adaptée
  // Dashboard affiche "Aucune donnée"
  // Stocks affiche "Aucun produit"
  // Ventes affiche "Aucune vente"
};
```

## 🔄 Flux de Données Sécurisé

### 1. Authentification → Context

```typescript
// AuthContext.tsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Écoute des changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        // Quand user change, TOUS les hooks se re-déclenchent
        // avec les bonnes données filtrées
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, /* ... */ }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Context → Hooks → Composants

```typescript
// Chaîne de sécurité
AuthContext (user.id) → useProducts (RLS filter) → Dashboard (métriques personnalisées)

// Exemple concret :
const Dashboard = () => {
  const { user } = useAuth(); // UUID utilisateur
  const { products } = useProducts(); // Filtré par user.id
  
  const userMetrics = {
    totalProducts: products.length, // SES produits uniquement
    lowStock: products.filter(p => p.quantity <= p.min_quantity).length
  };
  
  return (
    <div>
      <h1>Tableau de bord de {user.email}</h1>
      <MetricCard title="Mes Produits" value={userMetrics.totalProducts} />
    </div>
  );
};
```

## 🎯 Exemples d'États Interface

### État Vierge (Nouveau Utilisateur)

```jsx
// Dashboard vierge
<div className="grid grid-cols-4 gap-6">
  <MetricCard title="Produits" value="0" />
  <MetricCard title="Ventes" value="0 FCFA" />
  <MetricCard title="Paiements" value="0" />
  <MetricCard title="CA Total" value="0 FCFA" />
</div>

// Activité récente vide
<div className="text-center py-8">
  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
  <p>Aucune activité récente</p>
  <p>Commencez par ajouter des produits</p>
</div>
```

### État Progressif (Utilisateur Actif)

```jsx
// Après ajout de produits et ventes
<div className="grid grid-cols-4 gap-6">
  <MetricCard title="Produits" value="15" />
  <MetricCard title="Ventes" value="125,000 FCFA" />
  <MetricCard title="Paiements" value="3 en attente" />
  <MetricCard title="CA Total" value="450,000 FCFA" />
</div>

// Activités récentes remplies
<div className="space-y-4">
  <ActivityItem type="sale" title="Vente produit X" amount="15,000 FCFA" />
  <ActivityItem type="stock" title="Stock faible - Produit Y" status="warning" />
  <ActivityItem type="payment" title="Paiement reçu" amount="30,000 FCFA" />
</div>
```

## 📊 Métriques Temps Réel

### Calcul Sécurisé des Statistiques

```typescript
// Toujours basé sur les données de l'utilisateur connecté
const calculateUserMetrics = (products: Product[], sales: Sale[], payments: Payment[]) => {
  return {
    // Inventaire
    totalProducts: products.length,
    lowStockProducts: products.filter(p => p.quantity <= p.min_quantity).length,
    outOfStockProducts: products.filter(p => p.quantity === 0).length,
    
    // Ventes
    totalSales: sales.reduce((sum, sale) => sum + sale.total_amount, 0),
    todaySales: sales
      .filter(sale => isToday(new Date(sale.sale_date)))
      .reduce((sum, sale) => sum + sale.total_amount, 0),
    monthlyRevenue: sales
      .filter(sale => isThisMonth(new Date(sale.sale_date)))
      .reduce((sum, sale) => sum + sale.total_amount, 0),
    
    // Paiements
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalPayments: payments.reduce((sum, payment) => sum + payment.amount, 0),
    
    // KPI
    averageSaleAmount: sales.length > 0 
      ? sales.reduce((sum, sale) => sum + sale.total_amount, 0) / sales.length 
      : 0,
    
    // Croissance (comparaison périodes précédentes)
    salesGrowth: calculateGrowth(sales, 'month'),
    revenueGrowth: calculateGrowth(payments, 'month')
  };
};
```

---

**🔒 Garantie** : Chaque requête, métrique et affichage est automatiquement filtré par l'ID de l'utilisateur connecté. Isolation parfaite des données.