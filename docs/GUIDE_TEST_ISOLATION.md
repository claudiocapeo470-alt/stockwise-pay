# 🧪 Guide de Test d'Isolation Multi-Tenant

## 🎯 Objectif

Vérifier que chaque utilisateur ne peut accéder qu'à ses propres données et que l'interface est bien personnalisée.

## 🔬 Tests Manuels

### Test 1 : Créer Deux Comptes Utilisateur

#### Étape 1 : Utilisateur A
1. Ouvrir l'application en navigation privée
2. S'inscrire avec `userA@test.com`
3. Ajouter quelques produits :
   - Produit A1 : "Ordinateur", Prix: 500000, Quantité: 5
   - Produit A2 : "Souris", Prix: 15000, Quantité: 20
4. Effectuer une vente du "Ordinateur" à "Client A"
5. Noter l'ID utilisateur (visible dans le profil)

#### Étape 2 : Utilisateur B  
1. Ouvrir un autre navigateur/onglet incognito
2. S'inscrire avec `userB@test.com` 
3. **Vérifier** : Dashboard complètement vierge
4. **Vérifier** : Onglet "Stocks" vide (aucun produit visible)
5. **Vérifier** : Onglet "Ventes" vide (aucune vente visible)
6. Ajouter des produits différents :
   - Produit B1 : "Téléphone", Prix: 200000, Quantité: 10
   - Produit B2 : "Casque", Prix: 50000, Quantité: 8
7. Effectuer une vente du "Téléphone" à "Client B"

#### Étape 3 : Vérification Croisée
1. Retourner sur le compte Utilisateur A
2. **Vérifier** : Ne voit toujours QUE ses produits (Ordinateur, Souris)
3. **Vérifier** : Ne voit QUE sa vente (Ordinateur → Client A)
4. **Vérifier** : Métriques Dashboard basées sur SES données uniquement

### Test 2 : Tentative d'Accès Direct

#### Via Console Navigateur
```javascript
// Sur le compte Utilisateur A, ouvrir la console et tenter :

// Tentative de récupération de TOUS les produits
const { data } = await window.supabase
  .from('products')
  .select('*'); // Devrait retourner SEULEMENT les produits de A

console.log('Produits visibles:', data.length); 
// Doit correspondre aux produits ajoutés par A uniquement

// Tentative d'insertion avec un autre user_id (DOIT ÉCHOUER)
const { error } = await window.supabase
  .from('products')
  .insert({
    name: 'Produit Malveillant',
    price: 1000,
    quantity: 1,
    user_id: 'fake-uuid-autre-user'
  });

console.log('Erreur attendue:', error); 
// "new row violates row-level security policy"
```

#### Via API REST Direct
```bash
# Tenter un appel direct à l'API avec un token valide
curl -X GET 'https://fsdfzzhbydlmuiblgkvb.supabase.co/rest/v1/products' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Authorization: Bearer TOKEN_USER_A'

# Doit retourner SEULEMENT les produits de l'utilisateur A
```

### Test 3 : Interface Évolutive

#### Nouveau Utilisateur (UserC)
1. Créer un 3ème compte `userC@test.com`
2. **Vérifier état initial** :
   ```
   Dashboard:
   - Produits en stock: 0
   - Ventes aujourd'hui: 0 FCFA  
   - Paiements en attente: 0
   - Chiffre d'affaires: 0 FCFA
   
   Activité récente:
   - "Aucune activité récente"
   - "Commencez par ajouter des produits"
   ```

#### Progression Utilisateur C
3. **Ajouter 1er produit** → Métriques se mettent à jour
   ```
   - Produits en stock: 1
   - Autres métriques restent à 0
   ```
4. **Effectuer 1ère vente** → Interface évolue
   ```
   - Ventes aujourd'hui: [montant vente]
   - Chiffre d'affaires: [montant vente]
   - Activité récente: 1 vente visible
   ```
5. **Ajouter paiement** → Complétion interface
   ```
   - Paiements en attente: 1 (si pending)
   - Activité récente: vente + paiement
   ```

## 🔍 Tests Automatisés

### Test Script d'Isolation

```typescript
// tests/isolation.test.ts
describe('Multi-tenant Isolation', () => {
  
  test('User A cannot see User B data', async () => {
    // Connexion User A
    const userA = await signIn('userA@test.com', 'password');
    const productsA = await fetchProducts(userA);
    
    // Connexion User B  
    const userB = await signIn('userB@test.com', 'password');
    const productsB = await fetchProducts(userB);
    
    // Vérification isolation
    expect(productsA).not.toEqual(productsB);
    expect(productsA.some(p => p.user_id === userB.id)).toBe(false);
    expect(productsB.some(p => p.user_id === userA.id)).toBe(false);
  });
  
  test('New user has empty interface', async () => {
    const newUser = await signUp('newuser@test.com', 'password');
    const userData = await fetchAllUserData(newUser);
    
    expect(userData.products).toEqual([]);
    expect(userData.sales).toEqual([]);
    expect(userData.payments).toEqual([]);
    
    const metrics = calculateMetrics(userData);
    expect(metrics.totalProducts).toBe(0);
    expect(metrics.totalRevenue).toBe(0);
  });
  
  test('RLS prevents unauthorized access', async () => {
    const userA = await signIn('userA@test.com', 'password');
    
    // Tentative d'insertion avec mauvais user_id
    await expect(
      supabase.from('products').insert({
        name: 'Malicious Product',
        user_id: 'fake-uuid'
      })
    ).rejects.toThrow('violates row-level security');
  });
  
});
```

## ✅ Checklist de Validation

### 🔒 Sécurité
- [ ] Utilisateur A ne voit aucune donnée de B
- [ ] Utilisateur B ne voit aucune donnée de A  
- [ ] Tentatives d'accès direct échouent (RLS)
- [ ] Tokens JWT ne permettent pas d'accès croisé
- [ ] Console navigateur n'expose pas de données externes

### 🎨 Interface
- [ ] Nouveau compte = interface complètement vierge
- [ ] Métriques à zéro initialement
- [ ] Messages "état vide" appropriés
- [ ] Interface évolue avec ajout de données
- [ ] Pas de résidus d'autres utilisateurs

### 📊 Données
- [ ] Hooks retournent uniquement données utilisateur
- [ ] Jointures respectent l'isolation (ex: sales + products)
- [ ] Calculs métriques corrects par utilisateur
- [ ] Exports ne contiennent que les données utilisateur
- [ ] Recherches filtrées par utilisateur

### 🚀 Performance
- [ ] Requêtes optimisées (index sur user_id)
- [ ] Pas de sur-fetch de données
- [ ] Cache correctement partitionné
- [ ] Temps de réponse constants quel que soit le nombre d'utilisateurs

## 🚨 Signaux d'Alerte

### ❌ Échecs de Sécurité
```
- Voir des données d'autres utilisateurs
- Pouvoir modifier des données externes
- Messages d'erreur exposant des informations
- URLs permettant l'accès direct non autorisé
```

### ❌ Échecs d'Interface
```
- Interface pré-remplie pour nouveaux users
- Métriques incohérentes
- Données fantômes après déconnexion
- Recherche retournant résultats externes
```

## 🎉 Critères de Réussite

✅ **Isolation Parfaite** : Aucune donnée croisée entre utilisateurs
✅ **Interface Vierge** : Nouveaux comptes commencent à zéro  
✅ **Évolution Naturelle** : Interface se remplit avec l'activité
✅ **Sécurité Robuste** : RLS + Auth empêchent tout accès non autorisé
✅ **UX Personnalisée** : Chaque user a SON propre écosystème

---

**🎯 Validation Finale** : Laisser l'app tourner avec plusieurs utilisateurs test pendant quelques jours et vérifier qu'aucune contamination de données ne se produit.