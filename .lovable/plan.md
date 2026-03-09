

# Plan d'implémentation -- Modifications Stocknix

Ce plan couvre 6 axes majeurs : navigation mobile, refonte caisse, scan produits, responsive boutique, guide de bienvenue mis a jour, et correction URL boutique.

---

## 1. Navigation mobile -- Bouton "Menu" avec drawer

**Fichier:** `src/components/layout/BottomNav.tsx`

- Remplacer le 6e bouton "Perfs" (TrendingUp) par "Menu" (Menu icon)
- Au tap sur "Menu", ouvrir un Drawer (vaul) qui monte du bas
- Le Drawer contient tous les elements du sidebar desktop : Navigation principale, Boutique en ligne, Compte (Profil, Parametres), Deconnexion
- Chaque element navigue et ferme le drawer
- Les 5 premiers boutons restent inchanges : Accueil, Stocks, Caisse, Ventes, Factures

---

## 2. Refonte interface Caisse

**Fichier:** `src/pages/Caisse.tsx`

### 2.1 Header enrichi
Ajouter dans la top bar les boutons :
- Verrouiller (Lock icon) -- affiche un overlay PIN (fonctionnel basique)
- Autres Actions (MoreHorizontal) -- dropdown avec options
- Tickets en cours (ClipboardList) -- badge + liste
- Ma Caisse (Home, actif)
- Statistiques (BarChart3) -- lien vers /app/performance
- Parametrages (Settings) -- lien vers /app/settings

### 2.2 Grille produits
- Grille 2 colonnes par defaut (au lieu de 2-4)
- Quand categorie "Tout" est selectionnee : afficher des separateurs visuels entre chaque categorie (titre de section)
- Produits en rupture : grises avec badge "Rupture"

### 2.3 Support images produit
- Ajouter colonne `image_url` a la table `products` (migration)
- Dans les cards produit de la caisse : si `image_url` existe, afficher l'image au lieu de l'emoji
- Sinon, afficher l'emoji avec fond colore comme actuellement

### 2.4 Clavier numerique tactile
- Ajouter un clavier numerique retractable en bas a droite (desktop)
- Boutons 0-9, virgule, effacer, valider
- Permet de saisir quantite pour l'article selectionne dans le ticket
- Bouton toggle pour afficher/masquer

---

## 3. Scan de produits

**Fichier:** `src/pages/Caisse.tsx`

### 3.1 Scan mobile (camera)
- Ajouter bouton "Scanner" dans le header mobile
- Utiliser `html5-qrcode` (deja installe) pour ouvrir la camera
- Scanner code-barres → chercher produit par SKU/barcode → ajouter au ticket
- Toast si non trouve

### 3.2 Scan PC (USB/HID)
- Ajouter un `useEffect` avec ecouteur `keydown` global
- Detecter saisie rapide (<50ms entre touches) terminee par Enter
- Interpreter comme code-barres, chercher et ajouter au ticket
- Aucun bouton visible, tout automatique

### 3.3 Permissions camera
- `useEffect` au montage demandant `getUserMedia` pour pre-autoriser
- Ajouter `<meta name="permissions-policy" content="camera=*">` dans `index.html`
- Toast informatif premiere fois

---

## 4. Responsive Boutique en ligne

### 4.1 StoreConfig (`src/pages/store/StoreConfig.tsx`)
- Changer URL affichee de `stocknix.lovable.app/boutique/` vers `stocknix.space/boutique/`
- Layout deja responsive (grid lg:grid-cols-3), verifier pas de scroll horizontal

### 4.2 StoreProducts (`src/pages/store/StoreProducts.tsx`)
- Sur mobile : remplacer les tableaux par des cards empilees (responsive via `hidden md:table-cell` + cards mobiles)

### 4.3 StoreOrders (`src/pages/store/StoreOrders.tsx`)
- Sur mobile : afficher des cards au lieu du tableau
- Filtres en haut, wrappés

### 4.4 StoreReviews (`src/pages/store/StoreReviews.tsx`)
- Grille responsive de cards au lieu du tableau sur mobile
- Texte tronque avec "Voir plus"

---

## 5. Guide de bienvenue mis a jour

**Fichier:** `src/components/onboarding/WelcomeGuide.tsx`

- Ajouter de nouvelles etapes pour les fonctionnalites ajoutees :
  - Etape 5 : "Boutique en ligne" -- creez et publiez votre boutique
  - Etape 6 : "Scanner vos produits" -- scannez les codes-barres depuis la caisse
- Passer de 4 a 6 etapes dans le guide
- Modifier le texte "4 etapes" en "6 etapes"

**Logique d'affichage :**
- Ajouter un systeme de versioning : `localStorage` stocke `welcome-guide-version-{userId}`
- Si la version stockee est inferieure a la version actuelle (ex: "2"), re-afficher le guide
- Le guide se ferme et stocke la nouvelle version

---

## 6. Migration base de donnees

**Nouvelle migration** pour ajouter `image_url` a products :
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
```

---

## 7. Fichiers modifies (resume)

| Fichier | Modifications |
|---------|--------------|
| `src/components/layout/BottomNav.tsx` | 6e bouton Menu + Drawer complet |
| `src/pages/Caisse.tsx` | Header enrichi, grille 2 cols, separateurs, clavier numerique, scan mobile/PC |
| `src/pages/store/StoreConfig.tsx` | URL stocknix.space |
| `src/pages/store/StoreProducts.tsx` | Cards responsive mobile |
| `src/pages/store/StoreOrders.tsx` | Cards responsive mobile |
| `src/pages/store/StoreReviews.tsx` | Cards responsive mobile |
| `src/components/onboarding/WelcomeGuide.tsx` | 6 etapes + versioning |
| `src/pages/Dashboard.tsx` | Versioning guide |
| `index.html` | Meta permissions-policy camera |
| `supabase/migrations/...` | Colonne image_url |
| `src/integrations/supabase/types.ts` | Type image_url |

---

## Contraintes respectees
- Ne pas casser stocks, ventes, facturation, dashboard existants
- html5-qrcode deja installe
- Coherence visuelle maintenue

