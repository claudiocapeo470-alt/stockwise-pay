

## Objectif

Forcer l'affichage et le partage du lien boutique au format **`https://www.stocknix.com/boutique/<slug>`** uniquement, partout dans l'application — jamais d'URL `lovableproject.com` ou `lovable.app`. Et s'assurer que ce lien fonctionne réellement en production.

## Le problème actuel

Dans `src/pages/store/StoreConfig.tsx`, la fonction `getBaseUrl()` n'utilise `https://stocknix.com` **que** si l'utilisateur consulte déjà depuis ce domaine. Sinon, elle retourne `window.location.origin` — ce qui produit des URLs `https://f5fa4211-...lovableproject.com/boutique/...` quand on est dans l'éditeur ou la preview. C'est ce que vous voyez.

Le lien `https://www.stocknix.com/boutique/...` ne fonctionnera réellement que si le domaine `www.stocknix.com` est correctement connecté à ce projet Lovable via DNS.

## Plan d'action

### 1. Forcer l'URL canonique partout (code)

Dans `src/pages/store/StoreConfig.tsx` :
- Remplacer la logique conditionnelle de `getBaseUrl()` par une **constante figée** `https://www.stocknix.com`.
- Tous les affichages (étape 1 du formulaire, badge "En ligne", bouton "Voir", bouton "Copier") afficheront et copieront systématiquement :  
  `https://www.stocknix.com/boutique/<slug>`
- Le bouton **"Voir"** ouvrira ce lien canonique dans un nouvel onglet (et fonctionnera dès que le domaine sera actif).

Aucune autre page n'expose d'URL boutique au public — ce changement suffit côté code.

### 2. Vérifier la connexion du domaine personnalisé (action côté Lovable)

Après mes modifications, j'ouvrirai pour vous l'écran **Project Settings → Domains** pour vérifier l'état de `stocknix.com` et `www.stocknix.com` :

| Statut affiché | Signification | Action |
|---|---|---|
| ✅ **Active** | Domaine connecté, le lien marche | Rien à faire |
| ⚠️ **Verifying** / **Setting up** | DNS en cours de propagation | Attendre (jusqu'à 72 h) |
| ❌ **Action required** / **Offline** / absent | Domaine pas (ou plus) connecté | Suivre l'étape 3 ci-dessous |

### 3. Configuration DNS (à faire chez Hostinger si nécessaire)

Pour que `https://www.stocknix.com/boutique/...` fonctionne, deux **enregistrements A** doivent pointer vers Lovable :

```text
Type    Nom    Valeur            TTL
A       @      185.158.133.1     3600
A       www    185.158.133.1     3600
```

Et un enregistrement de vérification (généré par Lovable lors de la connexion) :

```text
Type    Nom         Valeur
TXT     _lovable    lovable_verify=XXXX  (fourni par Lovable)
```

S'il existe d'anciens enregistrements A pointant vers Hostinger (page de parking) → **les supprimer**.

### 4. Publier

Après la modification du code, publier une nouvelle version pour que le changement prenne effet sur `stocknix.lovable.app` et le domaine personnalisé.

## Détail technique du changement de code

```ts
// src/pages/store/StoreConfig.tsx
const PUBLIC_DOMAIN = 'https://www.stocknix.com';
const storeUrl = `${PUBLIC_DOMAIN}/boutique/${form.slug}`;
```

Suppression complète de `getBaseUrl()` et de la branche `window.location.origin`.

## Fichiers modifiés

- `src/pages/store/StoreConfig.tsx`

## Ordre d'exécution une fois ce plan approuvé

1. Modifier `StoreConfig.tsx` (URL canonique forcée).
2. Ouvrir **Project Settings → Domains** pour vérifier l'état du domaine et m'assurer qu'il est bien connecté à ce projet.
3. Publier la nouvelle version.
4. Si le domaine n'est pas Active : vous guider précisément dans Hostinger pour corriger les enregistrements DNS.

