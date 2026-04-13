<final-text>
Objectif
- Supprimer le blocage d’accès à l’espace.
- Corriger la caisse à 100%.
- Réduire les rechargements/plantages.
- Fermer les vraies failles de sécurité encore actives.

Ce que j’ai identifié dans le code
1. La caisse casse vraiment au moment d’ouvrir la session.
- `src/pages/Caisse.tsx` insère `created_by_member_id` dans `cash_sessions` et `cash_movements`.
- Mais le schéma actuel lu côté base ne contient pas encore cette colonne sur ces 2 tables.
- C’est la cause la plus probable du message visible sur vos captures: “Impossible d’ouvrir la caisse”.

2. Les PIN employés sont encore stockés et lus en clair.
- `company_members.pin_code` est lisible.
- Le code UI lit encore ce PIN dans :
  - `src/components/layout/AppLayout.tsx`
  - `src/pages/LivreurDashboard.tsx`
  - `src/hooks/useTeam.ts`
  - `src/pages/TeamManagement.tsx`
- Tant que ce fonctionnement existe, le finding sécurité “PIN exposé” restera vrai.

3. Les fonctions de reset mot de passe sont encore incomplètes côté sécurité.
- `supabase/functions/send-password-reset/index.ts` logue le code.
- `supabase/functions/reset-password/index.ts` logue email + code.
- Pas de vraie validation d’entrée.
- Pas de rate limiting.

4. Les membres ne peuvent toujours pas lire les notifications.
- Le scan confirme que `notifications` n’autorise encore que le propriétaire.
- Pourtant l’UI `NotificationCenter.tsx` charge les notifications par `company_id`.

5. Il reste des causes de rechargement/instabilité.
- `window.location.reload()` dans `ImageUpload.tsx` et `ErrorBoundary.tsx`
- `window.location.href` à plusieurs endroits
- cela casse le flux SPA et peut donner l’impression que “la page recharge seule”.

6. L’onboarding doit être finalisé une bonne fois.
- Les corrections précédentes vont dans le bon sens, mais il faut sécuriser le dernier maillon:
  - anciens comptes ne doivent plus jamais revenir sur onboarding
  - nouveaux comptes ne doivent le voir qu’une seule fois
  - la décision d’accès doit attendre un état auth/company totalement stabilisé

Plan d’implémentation
1. Corriger définitivement la caisse
- Créer une migration pour ajouter `created_by_member_id` à :
  - `cash_sessions`
  - `cash_movements`
- Ajouter les clés étrangères vers `company_members(id)`.
- Vérifier que les policies RLS actuelles restent compatibles.
- Garder `user_id = owner_id` pour la synchronisation admin, et `created_by_member_id` pour la traçabilité employée.
- Revalider dans `Caisse.tsx` :
  - ouverture
  - mouvements entrée/dépense
  - fermeture
  - vente pendant session ouverte

2. Fermer la faille PIN employés
- Migrer de `pin_code` en clair vers un PIN hashé.
- Ajouter une fonction SQL sécurisée de vérification PIN (`SECURITY DEFINER`) au lieu de lire le PIN brut.
- Adapter `validate_pin_login` pour vérifier le hash et continuer à renvoyer `owner_id`.
- Refactorer :
  - `AppLayout.tsx`
  - `LivreurDashboard.tsx`
  - `useTeam.ts`
  - `TeamManagement.tsx`
- Nouveau comportement:
  - le PIN n’est plus lisible depuis l’UI
  - l’owner peut générer/réinitialiser un PIN
  - le PIN n’est affiché qu’au moment de la création/réinitialisation, pas relisible ensuite

3. Finaliser l’accès sans boucle onboarding
- Renforcer `useCompany.ts` pour reconnaître comme “déjà configuré” :
  - société existante
  - `company_settings`
  - nom d’entreprise déjà défini
  - modules existants
  - données legacy
- Sécuriser `ModuleSelection.tsx` pour expulser immédiatement tout compte déjà configuré vers `/app`.
- Stabiliser `AuthContext.tsx` / `AuthSimple.tsx` pour ne jamais décider trop tôt entre `/onboarding` et `/app`.
- Vérifier spécialement :
  - ancien propriétaire
  - nouveau propriétaire
  - employé PIN

4. Supprimer les rechargements inutiles
- Remplacer les `window.location.href` par la navigation React.
- Supprimer les `window.location.reload()` évitables.
- Remplacer le refresh de photo profil par mise à jour d’état/query.
- Garder `ErrorBoundary` utile, mais sans provoquer un flux brutal qui masque les vraies erreurs.

5. Corriger les notifications membres
- Ajouter une policy SELECT pour les membres actifs sur `notifications`.
- Ajouter si besoin une policy UPDATE limitée au marquage en lu pour leur entreprise.
- Laisser la gestion complète au propriétaire, mais autoriser la lecture côté équipe.
- Vérifier `NotificationCenter.tsx` sur owner + employé.

6. Corriger les Edge Functions de reset mot de passe
- Ajouter validation stricte avec `zod` dans :
  - `send-password-reset`
  - `reset-password`
- Retirer tous les logs sensibles.
- Ajouter un système de rate limiting en base:
  - table dédiée des tentatives
  - limite envoi email
  - limite vérification code
- Uniformiser les réponses pour éviter l’énumération d’emails.

7. Nettoyage sécurité final
- Relancer les scans/linter après correctifs.
- Corriger les findings encore réellement actifs.
- Pour les warnings non corrigeables par code app uniquement, appliquer les actions dashboard:
  - activer “Leaked Password Protection”
  - mettre à jour Postgres
  - traiter l’extension dans `public` si le linter confirme laquelle est concernée

Fichiers principaux à modifier
- `src/pages/Caisse.tsx`
- `src/hooks/useCompany.ts`
- `src/hooks/useCompanyModules.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/AuthSimple.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/pages/LivreurDashboard.tsx`
- `src/hooks/useTeam.ts`
- `src/pages/TeamManagement.tsx`
- `src/components/layout/NotificationCenter.tsx`
- `src/components/profile/ImageUpload.tsx`
- `src/components/ErrorBoundary.tsx`
- `supabase/functions/pin-login/index.ts`
- `supabase/functions/send-password-reset/index.ts`
- `supabase/functions/reset-password/index.ts`
- nouvelles migrations SQL pour PIN hash, caisse, notifications, rate limit

Validation finale attendue
- Ancien compte propriétaire → connexion directe sur `/app`, jamais onboarding.
- Nouveau compte → onboarding une seule fois.
- Caissière → login PIN → `/app/caisse` → ouverture caisse sans erreur → vente → mouvement → fermeture.
- Admin/propriétaire → voit le suivi caisse par employée.
- Notifications lisibles par membres.
- Plus de rechargement brutal dans le flux normal.
- Scans sécurité réduits au minimum, avec le reste traité côté dashboard Supabase.
</final-text>