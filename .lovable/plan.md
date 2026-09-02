# Refonte UI : blocs, FAB, dialogues produit et paiement

## 1. Blocs KPI de la page Commandes reçues
Les blocs de `Commandes reçues` sont affichés sur 4 colonnes, donc plus petits que ceux de Stocks (3 colonnes).
- Passer la grille des KPI commandes au même réglage que Stocks (`--stat-cols: 3`), même padding, même rayon, mêmes tailles de texte/icônes.
- Résultat : blocs identiques en taille sur mobile, tablette et desktop.

## 2. Dialogue « Nouveau produit »
- Supprimer complètement le bloc **« Icône du produit (optionnel) »** (aperçu emoji + sélecteur d'emoji + sélecteur de couleur) de l'étape 3. La valeur par défaut reste enregistrée en base pour ne rien casser.
- Refonte mobile de l'assistant : champs plus compacts (hauteur 44px, labels 13px), espacement resserré, zone photos plus large et centrée, description sur 3 lignes.
- Barre de boutons Précédent / Suivant collée en bas du dialogue, boutons pleine largeur répartis sur mobile.
- Objectif : chaque étape tient dans l'écran sans scroll sur mobile.

## 3. Boutons flottants Recherche + Ajouter (partout)
Nouveau comportement mobile/tablette de `PageActionBar` :
- Bouton **+** rond, flottant en bas à droite, au-dessus de la barre de navigation mobile (safe-area incluse), taille 56px, ombre marquée.
- Bouton **Recherche** rond juste au-dessus du **+**, plus petit (44px), fond clair.
- Un clic sur Recherche ouvre un champ de recherche en surimpression (plein largeur, au-dessus des FAB) avec bouton d'effacement ; la barre de recherche inline disparaît du haut de page.
- Desktop : inchangé (recherche à gauche, actions à droite, pas de flottant).
- S'applique automatiquement à toutes les pages utilisant `PageActionBar` (Stocks, Ventes, Factures, Devis, Paiements, Livraisons, Clients, Produits en ligne).

## 4. Dialogue « Nouveau paiement » en 2 étapes
Actuellement un formulaire long qui scrolle.
- **Étape 1 – Client** : prénom, nom, téléphone (indicatif + drapeau conservés).
- **Étape 2 – Paiement** : méthode, montant total, montant payé, date de paiement, date d'échéance, notes éventuelles.
- Même en-tête à icône + barre de progression que le dialogue produit, boutons Précédent / Suivant / Enregistrer en bas fixe.
- Champs compacts et grille 2 colonnes pour que chaque étape tienne sans scroll.

## Détails techniques
- `src/pages/store/StoreOrders.tsx` : `--stat-cols` 4 → 3.
- `src/components/stocks/AddProductDialog.tsx` : retrait des imports `EmojiPicker`/`IconColorPicker`/`getIconBgStyle` et de l'état `showPicker` ; densification des étapes.
- `src/components/layout/PageActionBar.tsx` : nouvelle pile de FAB (`fixed bottom-[calc(var(--lz-nav-h)+1rem)] right-4 z-40`), état local d'ouverture de la recherche.
- `src/components/payments/AddPaymentDialog.tsx` : état `step` (1/2), validation avant passage à l'étape 2, soumission inchangée.
- Aucune modification de logique métier, de requêtes ou de schéma.
