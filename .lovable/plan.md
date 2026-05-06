# Plan d'amélioration Boutique en ligne

Travaux organisés en 5 lots indépendants. Je peux exécuter dans l'ordre proposé ou un sous-ensemble selon votre priorité.

## Lot 1 — Wizard "Créer un produit" (StoreProducts.tsx)

**Étape 1 — Photos (multi-images, design capture 2)**
- Grille 4 colonnes, jusqu'à 8 photos (PNG/JPG/WEBP, max 5 Mo chacune)
- Première photo = badge "Principal" bleu
- Tuiles vides cliquables avec icône `+` et label "Photo"
- Compteur "X/8 images" + texte d'aide
- Upload vers bucket `product-images`, stockage URLs dans state local; écriture dans `product_images` après création du produit

**Étape 2 — Infos + Description riche (capture 1)**
- Nom, Prix conservés
- Remplace `Textarea` par `RichTextEditor` existant (`src/components/stocks/RichTextEditor.tsx`) — barre d'outils Bold / Italic / Souligne / Liste / Image, tous boutons fonctionnels
- Texte d'aide "Utilisez la barre d'outils pour formater"

**Étape 3 — Catégorie avec images**
- Liste des catégories sous forme de cartes arrondies (rounded-2xl) avec image + nom centré
- Bouton "Nouvelle catégorie" ouvre mini-form: nom + upload image (bucket `product-images/categories/`)
- Sauvegarde dans `product_categories` avec champ `image_url` (nouveau)
- Sélection visuelle (ring primary)

**Étape 4 — Stock** (inchangé)

## Lot 2 — Refonte page "Produits en ligne"

- Container `max-w-5xl` + `px-4 sm:px-6` strict, `overflow-x-hidden` sur racine
- Suppression du tableau desktop horizontal → grille de cartes responsive (1/2/3 colonnes) cohérente avec mobile
- Chips de filtre minimalistes au lieu de Tabs lourdes
- Suppression définitive accessible directement, sans menu

## Lot 3 — Cache / PWA "ancienne version"

**Diagnostic**: le service worker (`public/manifest.json` + Workbox via Vite) sert l'ancienne build tant que l'utilisateur ne ferme pas tous les onglets. Lovable preview a aussi un cache CDN agressif.

**Correctifs**:
- Ajouter `<meta http-equiv="Cache-Control" content="no-cache">` sur `index.html`
- Service worker : activer `skipWaiting` + `clientsClaim` et afficher un toast "Nouvelle version disponible — Recharger" lorsqu'une mise à jour est détectée
- Versionner les assets (déjà fait via Vite hash) et purger via `caches.keys()` au démarrage si version bump

## Lot 4 — Sticky CTA mobile (Boutique publique)

- Sur `/store/:slug/product/:id` (et carte produit) : barre fixe `bottom-16` (au-dessus du `BottomNav` h-16) avec deux boutons côte à côte : "Ajouter au panier" (variant outline) + "Acheter maintenant" (primary)
- Animation slide-up à l'apparition
- Padding-bottom du conteneur scroll pour ne pas masquer le contenu

## Lot 5 — Indicatifs téléphoniques internationaux

- Installer `react-phone-number-input` (léger, drapeaux SVG inclus)
- Créer `<PhoneInput />` wrapper utilisant nos tokens
- Remplacer tous les `<Input type="tel">` dans : Checkout, StoreConfig, Profile, TeamManagement, AddPaymentDialog, etc.
- Pays par défaut = pays de la boutique (XOF → CI/SN/BJ selon la devise)

## Lot 6 — Icône panier carte produit (capture 3)

- Sur `PublicStore.tsx` : le bouton flottant en haut à droite de la carte produit (icône cart) appelle `addToCart(product)` directement, toast "Ajouté au panier"
- Persistance via localStorage par store_slug

---

## Ordre d'exécution recommandé

1. Lot 1 (wizard) — plus gros impact UX
2. Lot 6 (icône panier) — petit fix rapide  
3. Lot 4 (CTA mobile fixe)
4. Lot 5 (indicatifs tél)
5. Lot 2 (refonte liste produits)
6. Lot 3 (cache PWA) — délicat, à tester soigneusement

Confirmez-vous l'ordre et la portée, ou voulez-vous prioriser certains lots seulement ?