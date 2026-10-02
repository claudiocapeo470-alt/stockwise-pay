# Listes simples pour produits, factures et devis

## Résultat attendu
- Afficher les produits de **Gestion de stock** sous forme de lignes simples, dans le même esprit que la liste des ventes.
- Afficher les produits **En ligne** et **En stock** sous forme de lignes cohérentes, avec image, nom, catégorie, prix, statut et actions discrètes.
- Simplifier les listes **Factures** et **Devis** en supprimant les regroupements et titres de période comme « Aujourd’hui » ou « Octobre 2026 ».
- Conserver la recherche, les filtres de statut, les compteurs, les actions et toute la logique métier existante.

## Mise en œuvre
1. Réutiliser les composants de liste communs déjà employés par la page Ventes : séparateurs fins, avatar/image à gauche, informations au centre, montant et statut à droite, menu d’actions.
2. Remplacer les grilles de cartes dans Gestion de stock et Produits en ligne par ces listes, sans modifier l’ajout, la modification, la publication ou la suppression.
3. Refaire `DocumentListView` comme une liste continue sans regroupement par date, tout en conservant ouverture, modification, duplication, téléchargement, suppression et glissement pour supprimer.
4. Vérifier le rendu mobile et ordinateur, puis contrôler la compilation et les erreurs de l’application.

## Limites
- Aucun changement aux données, permissions, notifications, toasts ou règles métier.
- Les filtres de statut Factures/Devis restent disponibles ; seuls les en-têtes de période au-dessus des listes disparaissent.
