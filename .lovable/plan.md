

# Refonte Complete Interface Caisse — Plan

## Objectif
Rewrite complet de `src/pages/Caisse.tsx` pour correspondre au design ShopCaisse (fond clair #F0F2F5, sidebar categories blanche, grille produits avec images, panneau commande a droite) tout en conservant toute la logique metier existante (cart, scanner, cash sessions, held tickets, discounts, etc).

## Architecture Layout

### Desktop (>= 1024px) — 4 zones
```text
┌──────────────────────────────────────────────────┐
│  HEADER (56px, fond #1A1F36, sticky)             │
├────────┬─────────────────────────┬───────────────┤
│SIDEBAR │  GRILLE PRODUITS        │  PANNEAU      │
│CATEGS  │  (flex:1, scrollable)   │  COMMANDE     │
│(88px)  │  grid auto-fill 148px   │  (300px)      │
│fond    │  fond #F0F2F5           │  fond blanc   │
│blanc   │  + barre recherche      │  + ticket     │
│        │                         │  + total      │
│        │                         │  + actions    │
└────────┴─────────────────────────┴───────────────┘
```

### Tablet (768-1023px)
- Sidebar reduite (icones seulement, ~56px)
- Grille produits 3 colonnes
- Panneau commande en drawer bas

### Mobile (< 768px)
- Pas de sidebar visible (drawer categories)
- Grille produits 2 colonnes
- Panneau commande en modal/drawer bas
- Toggle products/ticket comme actuellement

## Changements Cles

### 1. Palette couleurs — fond CLAIR
- Fond app: `#F0F2F5` au lieu de `#1a1a2e`
- Cartes produits: `#FFFFFF` avec border-radius 14px, box-shadow legere
- Sidebar: fond `#FFFFFF`
- Header: reste dark `#1A1F36`
- Primaire violet: `#4F46E5`
- Succes/Especes: `#10B981`
- Danger: `#EF4444`
- Texte principal: `#1F2937`, secondaire: `#6B7280`

### 2. Header (56px)
- Gauche: logo/nom "Stocknix POS"
- Centre: boutons Verrouiller, Autres Actions, Tickets en cours (badge)
- Droite: bouton Dashboard (Home), Statistiques (BarChart3), Parametres (Settings, icone engrenage), menu hamburger
- Fond #1A1F36, texte blanc

### 3. Sidebar Categories (88px fixe)
- Fond blanc #FFFFFF
- Boutons empiles verticalement avec gap 6px
- Bouton actif: fond #4F46E5, texte blanc, border-radius 10px
- Bouton inactif: fond #F8F9FB, texte #6B7280
- Chaque bouton: icone/image categorie (20px) + label (10px, max 8 chars)
- Scroll vertical si beaucoup de categories

### 4. Grille Produits
- Barre de recherche en haut (fond blanc, border gris, radius 10px, loupe SVG)
- Filtre debounce 200ms
- Grid: `repeat(auto-fill, minmax(148px, 1fr))`
- Carte produit: zone image 90px en haut (photo uploadee OU placeholder grise "Ajouter une photo"), nom (700, 12px), prix violet (#4F46E5, 800, 13px), radius 14px, shadow legere
- PAS de hover/survol effects (specifie par l'utilisateur)
- Au clic: scale(0.97) effet tactile
- Produits sans photo: placeholder grise avec texte "Photo requise"
- Produits en rupture: badge "Rupture" rouge + opacity reduite

### 5. Panneau Commande (300px, droite)
- En-tete: titre "Commande" + badge compteur violet
- Pills: Sur place / A emporter / Livraison
- Liste articles: quantite badge violet + nom + prix, scroll interne
- Zone total: police 32px, couleur #4F46E5
- Boutons actions: Ajouter Client, Envoyer Options, Mettre en attente, Vider
- 2 boutons principaux cote a cote: "Total" (#4F46E5) + "Especes" (#10B981), hauteur 48px min

### 6. Pave Numerique — Modal Overlay
- S'ouvre au clic sur Total ou Especes (au lieu d'etre integre en permanence)
- Modal centre, fond blanc, border-radius 20px
- Overlay: rgba(0,0,0,0.5) + backdrop-filter blur(4px)
- Affichage montant: fond #1A1F36, texte blanc, 32px
- Grille 3 colonnes, gap 8px
- Touche effacer: fond rouge clair #FFF0F0, texte #EF4444
- Touche Valider: pleine largeur, fond #4F46E5

### 7. Suppression des emojis
- Retirer emoji fallback dans ProductTile — remplacer par placeholder "Photo requise"
- Garder le champ `icon_emoji` en DB (backwards compat) mais ne plus l'afficher dans la grille caisse
- Badge "Photo requise" sur produits sans `image_url`

### 8. Responsive
- Toutes zones tactiles >= 44px
- Pas de hover effects (specifie)
- Grid auto-fill minmax(148px, 1fr) s'adapte naturellement
- Mobile: sidebar en drawer, commande en modal
- Tablet: sidebar reduite icones, commande en drawer bas

## Fichiers modifies
| Fichier | Action |
|---------|--------|
| `src/pages/Caisse.tsx` | Rewrite complet du rendu (JSX/CSS), conservation de toute la logique (state, handlers, effects) |

## Logique conservee integralement
- Cart management (add, update, remove, clear)
- Cash sessions (open, close, movements)
- Scanner (USB/HID + camera html5-qrcode)
- Held tickets
- Discounts (% et montant)
- Receipt printing
- All modals
- Anti-double-scan

## Contraintes
- Pas de hover/survol effects
- Les deux themes du SaaS ne s'appliquent pas a la caisse (mode immersif dedie)
- Pas de scroll horizontal
- Boutons tactiles min 44x44px
- Debounce recherche 200ms

