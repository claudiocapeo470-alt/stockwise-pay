## 1. Supprimer le pilule StoreNav (capture 1) — partout

- Supprimer l'import + l'usage `<StoreNav />` dans :
  - `src/pages/store/StoreConfig.tsx`
  - `src/pages/store/StoreProducts.tsx`
  - `src/pages/store/StoreOrders.tsx`
  - `src/pages/store/StoreReviews.tsx`
- Supprimer le fichier `src/components/store/StoreNav.tsx` (plus utilisé).

## 2. Header partagé "Ma Boutique" sur les 4 pages (capture 3)

Créer **`src/components/store/StoreHeader.tsx`** : header responsive contenant exactement le bloc de la capture 3 — icône carrée + titre + sous-titre + boutons **OK / Voir / Publier ou Dépublier** + barre URL "En ligne" copiable. Tout sur la même ligne sur desktop, empilé proprement sur mobile.

- Prop `title?` et `subtitle?` pour personnaliser par page (défaut : "Ma Boutique" / "Configurez et publiez votre boutique en ligne").
- Le composant lit `useOnlineStore()` lui-même (store, togglePublish) et l'action **Enregistrer** est masquée par défaut (seul `StoreConfig` la passe via prop `onSave`), pour ne pas dupliquer la logique de sauvegarde sur les pages Produits/Commandes/Avis.
- Barre URL "En ligne" affichée uniquement si `store.is_published`.
- Layout : `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between` ; boutons en `flex-wrap` ; URL en `truncate`. Aucun overflow horizontal.

Intégrer `<StoreHeader />` en tête de :
- `StoreConfig.tsx` (avec `onSave={handleSave}` → bouton OK affiché, remplace le header local actuel).
- `StoreProducts.tsx` (remplace le bloc titre actuel).
- `StoreOrders.tsx` (remplace le `<h1>Commandes reçues</h1>`).
- `StoreReviews.tsx` (remplace le `<h1>Avis clients</h1>`).

Chaque page conserve son contenu spécifique (stats, tables, dialogs) sous le header.

## 3. Description produit lisible (capture 2)

Dans `src/pages/store/PublicStore.tsx`, l'onglet "Description" affiche actuellement le HTML brut visible (l'utilisateur a collé du code HTML dans l'éditeur, qui a été stocké encodé `&lt;h2&gt;…`).

- Ajouter un helper `decodeToPlainText(raw)` qui décode récursivement les entités HTML (jusqu'à 3 passes) puis retourne le `textContent` final — donc strippé de toutes les balises.
- Remplacer le `dangerouslySetInnerHTML` actuel par un rendu `<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{decodeToPlainText(p.description)}</p>`.
- Garder le fallback existant (texte par défaut) si description vide.

Résultat : l'utilisateur ne voit plus jamais les balises `<h2 class="…">…</h2>`, seulement le texte lisible.

## Fichiers touchés

- créé : `src/components/store/StoreHeader.tsx`
- supprimé : `src/components/store/StoreNav.tsx`
- modifié : `src/pages/store/StoreConfig.tsx`, `StoreProducts.tsx`, `StoreOrders.tsx`, `StoreReviews.tsx`, `PublicStore.tsx`
