# Stocknix — Charte de design (source de vérité)

Direction : **minimalisme fonctionnel**, SaaS commercial. Un seul accent (bleu de marque), beaucoup d'espace, contrastes nets, profondeur discrète, mouvement qui a un sens.

## Couleurs (jetons CSS dans `src/index.css`)
| Rôle | Jeton | Usage |
|---|---|---|
| Marque | `--primary` (229 82% 52%) | Actions principales, liens, focus |
| Fond | `--background` | Fond de page |
| Surface | `--card` | Cartes, champs, menus |
| Texte | `--foreground` / `--muted-foreground` | Texte principal / secondaire (contraste ≥ 4,5:1) |
| Bordure | `--border` | Contours fins |
| États | `--success` `--warning` `--destructive` | Statuts, jamais décoratifs |

Règle : aucune couleur écrite en dur dans les composants, uniquement les jetons.

## Typographie
- Police : **Geist** (texte et titres), **Geist Mono** (codes, références).
- Titres : approche serrée (`-0.025em` à `-0.01em`), `text-wrap: balance`.
- Chiffres et montants : classe `.tabular` pour l'alignement.
- Champs : 16 px minimum (pas de zoom automatique sur iOS).

## Profondeur
`shadow-xs` (champs) · `shadow-soft` (cartes) · `shadow-medium` (survol, menus) · `shadow-large` (fenêtres) · `shadow-brand` (bouton principal).

## Rayons
Champs et boutons `rounded-lg` · grands boutons `rounded-xl` · cartes `rounded-2xl`.

## Mouvement
- Courbe d'entrée : `ease-out-expo` · durées : 150 ms (retour), 220 ms (transitions), 420 ms (apparitions).
- N'animer que `transform`, `opacity`, couleurs et ombres.
- `prefers-reduced-motion` respecté (le spinner de chargement reste visible).

## Accessibilité
Focus clavier visible, cibles tactiles ≥ 44 px (écrans tactiles), zoom du navigateur autorisé.

## Utilitaires disponibles
`.glass` `.glass-card` `.text-gradient` `.bg-grid` `.bg-grid-fade` `.glow` `.tabular` `.reveal-up` `.perspective-1000` `.preserve-3d`
