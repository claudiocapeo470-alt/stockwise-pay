

# Plan d'Implementation -- Phases 2 a 5

Ce plan couvre toutes les fonctionnalites restantes du prompt original. Phase 1 (tables DB + PIN login) est deja implementee.

## Phase 2 -- Section "Mon equipe" dans les Parametres Admin

### 2A. Page TeamManagement avec 4 onglets

**Nouveau fichier:** `src/pages/TeamManagement.tsx`

Onglets Tabs (Shadcn) :

1. **Code Entreprise** -- Affiche le code 6 chiffres de la company, bouton copier, bouton regenerer (avec confirmation AlertDialog qui avertit que tous les employes seront deconnectes). Utilise `useCompany()` existant.

2. **Services** -- CRUD des services (`company_services` table). Liste avec nom, couleur (input color), icone (emoji picker simple), toggle actif/inactif. Bouton ajouter un service ouvre Dialog. Pas de suppression des services systeme.

3. **Roles** -- CRUD des roles (`company_roles` table). Nom du role, service associe (select), permissions par module (checkboxes dans une grille : Stock, Achats, Ventes, Boutique, Caisse, Livraison, Rapports, Parametres × voir/creer/modifier/supprimer). Roles systeme (is_system=true) non supprimables mais editables sur les permissions. Le champ `permissions` est deja JSONB -- on y stocke `{ stock: ["read","create","update","delete"], pos: ["read","create"], ... }`.

4. **Membres** -- CRUD des membres (`company_members` table). Formulaire : prenom, nom, photo (upload vers bucket avatars), service (select), role (select). Le SAAS genere un PIN 6 chiffres aleatoire. Admin peut modifier le PIN manuellement. Affichage PIN masque (******) avec bouton oeil pour reveler + bouton copier. Toggle actif/inactif. Affichage derniere connexion.

### 2B. Integration dans Settings

Ajouter un onglet/section "Mon equipe" dans `src/pages/Settings.tsx` qui redirige vers `/app/team` ou l'integrer directement dans Settings via Tabs.

**Decision:** Creer une page dediee `/app/team` accessible depuis la sidebar (section Parametres) et depuis Settings via un lien.

### 2C. Hook useTeam

**Nouveau fichier:** `src/hooks/useTeam.ts`

Hook avec React Query pour CRUD sur `company_services`, `company_roles`, `company_members`. Utilise `useCompany()` pour le `company_id`.

### Fichiers modifies/crees :
- `src/pages/TeamManagement.tsx` (nouveau)
- `src/hooks/useTeam.ts` (nouveau)
- `src/components/layout/AppSidebar.tsx` (ajout lien "Mon equipe")
- `src/components/layout/BottomNav.tsx` (ajout dans drawer)
- `src/App.tsx` (ajout route `/app/team`)

---

## Phase 3 -- Espaces dedies par role (Sidebar dynamique)

### 3A. AuthContext enrichi

Modifier `src/contexts/AuthContext.tsx` pour exposer :
- `memberInfo` : les donnees du membre connecte par PIN (depuis localStorage `stocknix_member`)
- `memberRole` : nom du role de l'employe
- `memberPermissions` : permissions JSONB
- `isEmployee` : boolean (connecte via PIN)
- `companyId` : ID de l'entreprise

### 3B. Sidebar dynamique

Modifier `src/components/layout/AppSidebar.tsx` :
- Si `isEmployee` est true, filtrer les liens de navigation selon `memberPermissions`
- Mapping permissions → liens sidebar :
  - `pos: true` → Caisse
  - `stock: true` → Gestion des stocks
  - `sales_history: true` → Ventes
  - `boutique_orders: true` → Commandes boutique
  - `reports: true` → Performance & Rapports
  - `deliveries_own: true` → Mes livraisons
  - etc.
- Si Admin (owner), tout est visible (comportement actuel)

### 3C. Redirections par role au login

Deja partiellement implemente dans `AuthSimple.tsx` (lignes 118-125). Enrichir :
- Caissier → `/app/caisse`
- Livreur → `/app/livraisons`
- Gestionnaire Stock → `/app/stocks`
- Manager → `/app`
- Vendeur → `/app/boutique/commandes`

### 3D. ProtectedRoute enrichi

Modifier `ProtectedRoute.tsx` pour verifier les permissions par route. Si un employe tente d'acceder a une route non autorisee, rediriger vers sa page par defaut.

### Fichiers modifies :
- `src/contexts/AuthContext.tsx`
- `src/components/layout/AppSidebar.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/auth/ProtectedRoute.tsx`

---

## Phase 4 -- Module Livraison

### 4A. Pages livraison Admin/Manager

**Nouveau fichier:** `src/pages/Livraisons.tsx`

Tableau de bord livraisons :
- Stats du jour : assignees, en cours, livrees, problemes
- Liste/table des livraisons avec filtres (statut, livreur, date)
- Pour chaque commande boutique : bouton "Assigner un livreur" ouvre Dialog avec liste des membres role=Livreur actifs
- Statut en temps reel (realtime Supabase optionnel, sinon polling)

### 4B. Vue mobile Livreur

**Nouveau fichier:** `src/pages/LivreurDashboard.tsx`

Interface mobile optimisee :
- Liste des livraisons assignees au livreur connecte (filtre `driver_member_id = memberInfo.id`)
- Chaque carte : adresse client, articles, instructions, numero commande
- Boutons action : "Demarrer" (→ en_cours), "Livree" (→ delivered), "Probleme" (→ problem + motif)
- Bottom tabs : Aujourd'hui / Historique / Profil
- Layout sans sidebar, BottomNav specifique livreur

### 4C. Integration commandes boutique

Modifier `src/pages/store/StoreOrders.tsx` :
- Ajouter colonne "Livraison" dans le tableau
- Bouton "Assigner livreur" par commande
- Afficher le livreur assigne et le statut

### 4D. Hook useDeliveries

**Nouveau fichier:** `src/hooks/useDeliveries.ts`

CRUD sur la table `deliveries` existante. Fonctions : assignDriver, updateStatus, getByDriver, getByCompany.

### Fichiers crees/modifies :
- `src/pages/Livraisons.tsx` (nouveau)
- `src/pages/LivreurDashboard.tsx` (nouveau)
- `src/hooks/useDeliveries.ts` (nouveau)
- `src/pages/store/StoreOrders.tsx` (modifie)
- `src/App.tsx` (routes `/app/livraisons`, `/app/livreur`)
- `src/components/layout/AppSidebar.tsx` (lien livraisons)

---

## Phase 5 -- Verrouillage de session

### 5A. Integration LockScreen dans AppLayout

Modifier `src/components/layout/AppLayout.tsx` :
- State `isLocked` geré par timeout d'inactivite
- Lire `lock_timeout_minutes` depuis `useCompany()`
- Quand timeout atteint → afficher `<LockScreen>` par dessus tout
- Deverrouillage = verifier PIN du membre connecte (appel local, pas edge function)
- Bouton "Verrouiller" dans le header (deja prevu dans la Caisse)

### 5B. Bouton Verrouiller dans le header

Ajouter un bouton Lock dans le header de `AppLayout` (visible uniquement pour les employes).

### Fichiers modifies :
- `src/components/layout/AppLayout.tsx`
- `src/components/auth/LockScreen.tsx` (deja cree, OK)

---

## Resume des fichiers

| Fichier | Action |
|---------|--------|
| `src/pages/TeamManagement.tsx` | Nouveau -- gestion equipe (4 onglets) |
| `src/hooks/useTeam.ts` | Nouveau -- hook CRUD services/roles/membres |
| `src/pages/Livraisons.tsx` | Nouveau -- dashboard livraisons admin |
| `src/pages/LivreurDashboard.tsx` | Nouveau -- vue mobile livreur |
| `src/hooks/useDeliveries.ts` | Nouveau -- hook CRUD livraisons |
| `src/contexts/AuthContext.tsx` | Enrichir avec memberInfo/permissions |
| `src/components/layout/AppSidebar.tsx` | Sidebar dynamique par role |
| `src/components/layout/BottomNav.tsx` | Navigation dynamique par role |
| `src/components/layout/AppLayout.tsx` | Verrouillage session + timeout |
| `src/components/auth/ProtectedRoute.tsx` | Verification permissions par route |
| `src/pages/Settings.tsx` | Lien vers Mon equipe |
| `src/pages/store/StoreOrders.tsx` | Colonne livraison + assignation |
| `src/App.tsx` | Routes /app/team, /app/livraisons, /app/livreur |

## Pas de migration DB necessaire
Toutes les tables requises (companies, company_services, company_roles, company_members, deliveries, lock_sessions) existent deja. Les RLS sont en place.

## Ordre d'implementation
1. Phase 2 (Mon equipe) -- fondation pour tout le reste
2. Phase 3 (Sidebar dynamique + AuthContext enrichi) -- depend de Phase 2
3. Phase 4 (Module livraison) -- depend de Phase 3
4. Phase 5 (Verrouillage session) -- independant, fait en dernier

