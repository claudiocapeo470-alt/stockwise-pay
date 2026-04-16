

## Diagnostic des bugs caisse

J'ai relu `src/pages/Caisse.tsx`, `AuthContext`, `useCompany`, `pin-login`, `ProtectedRoute`, `useRoleRedirect`, le dashboard caissier et le schéma `cash_sessions`. Les vrais problèmes sont :

1. **Modale "Ouverture de caisse" bloque tout** (capture d'écran)
   - `showOpenCashModal` s'affiche par défaut à `true`. Tant qu'aucune session n'est ouverte, l'overlay z-80 + `<header>` derrière empêche d'utiliser **Verrouiller, Actions, Tickets, Home, Stats, Settings, Scanner, Déconnexion**. Seul le bouton "Ouvrir la caisse" ou "← Retour" fonctionnent.
   - Sur mobile la même modale recouvre tout l'écran.

2. **Session de caisse mutualisée par erreur**
   - Aujourd'hui `cash_sessions.user_id = effectiveUserId` (toujours l'owner). Donc si la caissière ouvre, le patron voit "ouverte" et inversement → conflits, double session, "Caisse non ouverte" qui réapparait après reload.
   - Tu as choisi : **une session par poste/employé**.

3. **Caissier a `created_by_member_id` mais pas de scoping sur la session**
   - `fetchActiveSession` ne filtre que par `user_id` + `status='open'` → récupère la session de quelqu'un d'autre.

4. **Header caisse non-cliquable derrière la modale**
   - z-index : header z-auto, modale z-80. Tous les `HeaderBtn` sont rendus mais inactifs visuellement → l'utilisateur croit que "rien ne marche".

5. **Pas de bouton "Déconnexion" visible dans la caisse**
   - Aucun `signOut` exposé dans `renderHeader` ni dans la version mobile. Les caissières ne peuvent que faire "← Retour" qui mène à `/app` puis `useRoleRedirect` les renvoie immédiatement sur `/app/caisse` → boucle.

6. **`useRoleRedirect` boucle infinie**
   - Caissier sur `/app` → redirigé `/app/caisse`. Sur la caisse, "Retour dashboard" l'envoie à `/app` → redirigé encore `/app/caisse`. Impossible de sortir.

---

## Plan de correction

### A. Base de données (migration)
Ajouter le scoping par utilisateur connecté pour les sessions :

```sql
ALTER TABLE public.cash_sessions
  ADD COLUMN IF NOT EXISTS opened_by_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_cash_sessions_opened_by_user
  ON public.cash_sessions (opened_by_user_id, status);
```

`opened_by_user_id` = `auth.uid()` au moment de l'ouverture (caissier ou patron). RLS existante reste valide via `user_id` (owner). Pas de casse pour les sessions historiques (colonne nullable).

### B. `src/pages/Caisse.tsx` — Réécriture ciblée

1. **Ouverture / récupération session**
   - `fetchActiveSession` filtre désormais : `.eq('user_id', effectiveUserId).eq('opened_by_user_id', user.id).eq('status','open')`.
   - `openCashSession` insère `opened_by_user_id: user.id`.
   - `closeCashSession` ne touche que la session de cet utilisateur.

2. **Modale d'ouverture non bloquante**
   - Quand `!cashSessionOpen`, on N'AFFICHE PLUS l'overlay plein écran automatique.
   - À la place, on affiche le POS normalement avec une **bannière jaune en haut** : *"La caisse n'est pas ouverte. Ouvrir la caisse"* (bouton).
   - La modale d'ouverture s'ouvre uniquement quand l'utilisateur clique sur ce bouton OU tente une vente.
   - Header, Actions, Verrouiller, Tickets, Home, Stats, Settings, Scanner, Déconnexion deviennent tous cliquables tout de suite.
   - Ventes restent bloquées tant que pas de session (`validateSale` continue de demander l'ouverture).

3. **Bouton "Déconnexion" dans le header caisse (desktop + mobile)**
   - Ajout d'un `HeaderBtn` LogOut tout à droite qui appelle `signOut()` du contexte.
   - Sur mobile, ajout dans le `DropdownMenu` "Actions".

4. **Bouton "Quitter caisse" propre pour le patron**
   - Le patron (non employé) garde "Home" → `/app`.
   - Le caissier voit "Déconnexion" à la place de Home, pour éviter la boucle de `useRoleRedirect`.

5. **Suppression de l'écran "Caisse non ouverte" plein-écran** (lignes 715–730) — remplacé par la bannière.

### C. `src/hooks/useRoleRedirect.ts` — Stop la boucle

- Si l'utilisateur est sur `/app` ET qu'il s'apprête à se déconnecter, ne pas rediriger.
- Plus simple : exclure aussi `/auth` et autoriser un séjour sur `/app` quand `memberInfo?.member_role_name` contient `caissier` UNIQUEMENT au mount initial (pas en boucle). On garde la redirection initiale, mais on n'écoute plus `location.pathname` → on retire cette dépendance et on n'agit qu'une seule fois.

### D. `src/components/dashboard/CaissierDashboard.tsx`
- Le bouton "Ouvrir la Caisse" reste, mais on ajoute également un bouton "Déconnexion" pour donner une issue claire (déjà présent dans BottomNav mobile, on l'ajoute en desktop pour la caissière).

---

## Validation attendue après correction

| Scénario | Résultat |
|---|---|
| Patron ouvre `/app/caisse` | Voit le POS immédiatement, bannière "Ouvrir la caisse" en haut, tous les boutons header fonctionnent |
| Patron clique Verrouiller, Actions, Tickets, Settings, Home | Tout marche, sans avoir à ouvrir la caisse |
| Patron clique "Ouvrir la caisse" → saisit fond → valide | Session ouverte avec `opened_by_user_id = patron.id` |
| Caissière login PIN → arrive sur `/app/caisse` | Voit le POS, bannière jaune, peut Verrouiller / Actions / Déconnexion |
| Caissière ouvre sa propre session | Session ouverte avec `opened_by_user_id = caissière.auth_user_id`, indépendante de celle du patron |
| Caissière clique Déconnexion | Logout → `/auth`, plus de boucle |
| Patron et caissière en parallèle | Chacun voit son propre statut "Ouverte/Fermée" |

Aucune autre page n'est touchée. Aucun `window.location.reload`. Politique RLS inchangée.

