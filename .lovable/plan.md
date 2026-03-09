

# Plan d'implementation -- Refonte Caisse & Gestion de Stock Stocknix

Ce document est extremement volumineux. L'implementation sera decoupee en phases priorisees pour eviter de casser l'existant.

---

## Phase 1 -- Interface Caisse (refonte visuelle conforme a l'image de reference)

**Fichier principal:** `src/pages/Caisse.tsx` (938 lignes, rewrite partiel)

L'interface actuelle a deja le layout 3 colonnes (35% ticket/numpad, 15% categories, 50% produits) avec dark theme. Les ajustements necessaires :

- Affiner le header : date a gauche, cadenas au centre, nom caissier + hamburger a droite (deja en place partiellement)
- Grille produits : garder 2 colonnes par defaut, ajouter les barres de couleur de categorie en bas de chaque tile (deja fait)
- Bottom bar 6 boutons : TICKETS, CLIENTS, QR CODE, RECHERCHER, AIDE, SORTIE (deja fait)
- Ameliorer le numpad : C rouge, point, backspace, 7-9/4-6/1-3/00-0-×, boutons NOM TABLE/ACTIONS/TABLE/PAYER/EN COMPTE (deja fait)
- **Nouveau** : Ajouter le bouton ACTIONS fonctionnel avec dropdown (Remise %, Remise montant, Annuler dernier article, Note interne, Ouvrir tiroir caisse, Cloturer caisse)

## Phase 2 -- Scanner ameliore

**Fichier:** `src/pages/Caisse.tsx`

- Le scanner camera (html5-qrcode) et USB/HID sont deja implementes
- **Ameliorations** : Ajouter overlay de guidage avec ligne laser animee, indicateur d'etat ("Camera active", "Code detecte"), anti-double-scan 1.5s (actuellement absent), vibration tactile, son indicatif, popup "Produit non trouve - Voulez-vous le creer ?" avec pre-remplissage SKU
- Ajouter fallback champ de saisie manuelle si camera indisponible

## Phase 3 -- Gestion du tiroir caisse (amelioration)

**Fichiers:** `src/pages/Caisse.tsx`, nouveau composant `src/components/caisse/CashReport.tsx`

Les tables `cash_sessions` et `cash_movements` existent deja. L'ouverture/fermeture basique est implementee.

- **Ameliorer l'ouverture** : modal obligatoire au demarrage, ventilation optionnelle billets/pieces, impossible d'utiliser la caisse sans session ouverte
- **Ameliorer la fermeture** : comptage physique, ventilation par mode de paiement (especes/mobile/CB), calcul ecart theorique vs reel, commentaire, **generation PDF** du rapport
- **Ajout entrees/depenses** : formulaire montant + motif + categorie + photo optionnelle, liste chronologique visible
- **Rapport journalier** : resume complet (heure ouverture/fermeture, fond, ventes par mode de paiement, depenses, entrees, solde theorique/reel, ecart), export PDF, historique par date

## Phase 4 -- CRM Clients

**Nouveaux fichiers:** `src/pages/Clients.tsx`, `src/hooks/useCustomers.ts`

La table `customers` existe deja avec tous les champs (loyalty_points, credit_enabled, credit_limit, credit_balance, etc.)

- Page complete de gestion clients : CRUD fiche client (nom, prenom, tel, email, adresse, photo, notes)
- Historique achats par client (requete croisee sales/customers)
- Credit client : activation/desactivation, plafond, paiement a credit en caisse, suivi solde, historique remboursements
- Points fidelite : config globale (X points par Y FCFA), accumulation auto, conversion en reduction
- **Integration caisse** : selection client dans le ticket, affichage solde points/credit
- Ajout route `/app/clients` dans `App.tsx` et navigation dans `AppSidebar.tsx`

**Migration DB** : Ajouter table `customer_transactions` pour historique credit/points, ajouter `customer_id` a la table `sales`

## Phase 5 -- Promotions

**Nouveaux fichiers:** `src/pages/Promotions.tsx`, `src/hooks/usePromotions.ts`

La table `promotions` existe deja.

- Page CRUD promotions : nom, type (% ou montant), valeur, dates, produits/categories concernes, code promo, max utilisations
- **Integration caisse** : badge "PROMO" sur produits en promotion, prix barre + prix promo, saisie code promo dans le ticket, application auto de la reduction, ligne de reduction dans le ticket
- Ajout route `/app/promotions`

## Phase 6 -- Statistiques temps reel (amelioration)

**Fichier existant:** `src/pages/PerformanceRapports.tsx` ou `src/pages/Performance.tsx`

- Dashboard : CA du jour avec comparaison J-1, nombre tickets, panier moyen, clients servis
- Analyses : top produits, ventes par caissier, par categorie, par heure (graphique courbe), par mode de paiement (camembert), evolution CA 7j/30j/12mois
- Filtres par periode + caissier, export PDF/Excel

## Phase 7 -- Extension gestion de stock

**Migrations DB** : Tables `suppliers`, `purchase_orders`, `purchase_order_items`, `product_variants`, `warehouses`, `warehouse_stock`, `stock_transfers`, `inventories`, `inventory_items`

- Sous-categories et variantes produit (taille, couleur) avec stock individuel
- Fournisseurs : CRUD fiche fournisseur, produits associes, historique achats
- Commandes fournisseur : creation, statuts (brouillon/envoyee/recue), reception marchandise, mise a jour stock auto
- Multi-entrepots : creation, stock par entrepot, transferts inter-entrepots
- Inventaire : liste tous produits, saisie quantites reelles, scan pour comptage, calcul ecarts, validation = correction stock auto
- Rapports stock : valeur totale, mouvements, marges, alertes stock faible, export Excel/PDF

## Phase 8 -- Facturation PDF amelioree

Ameliorer le systeme existant (pages Facturation, InvoiceEditor, InvoicePreview) :
- Facture personnalisee avec logo
- Devis exportable PDF
- Bon de livraison, recu de paiement
- Numerotation auto (deja fait via `generate_document_number`)
- Mentions legales, conditions de paiement

---

## Fichiers crees/modifies (resume)

| Fichier | Action |
|---------|--------|
| `src/pages/Caisse.tsx` | Refonte continue + scan ameliore + tiroir caisse complet |
| `src/components/caisse/CashReport.tsx` | Nouveau -- rapport PDF clôture |
| `src/pages/Clients.tsx` | Nouveau -- CRM complet |
| `src/hooks/useCustomers.ts` | Nouveau -- hook CRUD clients |
| `src/pages/Promotions.tsx` | Nouveau -- gestion promotions |
| `src/hooks/usePromotions.ts` | Nouveau -- hook CRUD promotions |
| `src/pages/PerformanceRapports.tsx` | Amelioration stats temps reel |
| `src/pages/Stocks.tsx` | Extension fournisseurs, variantes, inventaire |
| `src/App.tsx` | Nouvelles routes (clients, promotions, fournisseurs, inventaire) |
| `src/components/layout/AppSidebar.tsx` | Nouveaux liens navigation |
| `src/components/layout/BottomNav.tsx` | Mise a jour drawer avec nouveaux liens |
| Migrations Supabase | Tables suppliers, purchase_orders, product_variants, warehouses, inventories, customer_transactions |

---

## Contraintes

- Les deux themes (sombre/jour) sont preserves -- variables CSS du theme utilises partout sauf interface POS (dark panel)
- Pas de scroll horizontal sur aucun appareil
- Boutons tactiles min 44x44px sur mobile
- Chaque action = toast succes ou erreur
- react-image-crop deja installe pour recadrage carre
- html5-qrcode deja installe pour scan
- jspdf + jspdf-autotable deja installes pour PDF

---

## Ordre d'implementation recommande

Vu la taille, je recommande d'implementer par blocs :
1. **Bloc 1** : Phases 1-3 (Caisse refonte + scanner + tiroir caisse) -- un seul fichier principal
2. **Bloc 2** : Phase 4 (CRM clients) -- nouvelles pages + integration caisse
3. **Bloc 3** : Phase 5 (Promotions) -- nouvelles pages + integration caisse
4. **Bloc 4** : Phases 6-7 (Stats + Stock etendu) -- ameliorations + nouvelles tables
5. **Bloc 5** : Phase 8 (Facturation) -- ameliorations

