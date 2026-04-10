
Objectif
- Supprimer définitivement le blocage onboarding pour les anciens comptes.
- Faire fonctionner l’espace caisse des caissières de façon fiable.
- Garantir que les actions POS restent synchronisées avec le propriétaire/admin pour le suivi.

Constats trouvés dans le code
1. Le bypass onboarding est trop limité dans `useCompany.ts`.
   - Il ne considère surtout que `selected_modules`, `company_name_set` et quelques tables legacy (`products`, `sales`, `payments`, `online_store`, `company_members`).
   - Un ancien compte qui a déjà configuré son entreprise via `company_settings`, mais sans assez de données transactionnelles, peut être renvoyé à tort vers `/onboarding`.

2. `useCompanyModules.saveModules()` a une faiblesse réelle.
   - Il fait `const activeCompany = company ?? await ensureCompany()`, mais appelle ensuite `updateCompany(updates)`.
   - Or `updateCompany` dépend de l’état `company` courant, qui peut encore être `null` au moment de l’appel.
   - Résultat possible: sauvegarde incomplète ou boucle onboarding.

3. L’accès caisse employé dépend encore trop de la résolution tardive de `company.owner_id`.
   - Aujourd’hui l’ID effectif employé = `company?.owner_id`.
   - Si la compagnie tarde à charger, l’espace caisse peut rester bloqué ou instable.

4. La session employé PIN ne transporte pas encore `owner_id`.
   - `validate_pin_login` renvoie `company_id`, `company_name`, etc., mais pas `owner_id`.
   - Cela oblige plusieurs écrans à attendre une requête supplémentaire pour savoir sur quelles données travailler.

5. Le suivi POS n’est pas encore complet côté admin.
   - `sales` enregistre déjà `created_by_member_id`.
   - Mais `cash_sessions` et `cash_movements` ne portent pas visiblement l’attribution du membre, donc le suivi caisse par employée reste incomplet.

Plan d’implémentation
1. Fiabiliser l’initialisation auth + profil
- Revoir `AuthContext.tsx` pour que l’application ne sorte pas trop tôt de l’état de chargement.
- Attendre correctement la restauration de session + chargement profil avant de laisser la navigation protégée décider.
- Garder le comportement “pas de await bloquant dans `onAuthStateChange`”, mais éviter les états intermédiaires qui déclenchent de mauvaises redirections.

2. Corriger définitivement le bypass onboarding pour anciens comptes
- Étendre la logique de normalisation dans `useCompany.ts`.
- Considérer comme “déjà configuré” un compte qui possède au moins un de ces signaux:
  - `selected_modules` déjà remplis
  - `onboarding_completed = true`
  - nom d’entreprise explicite sur `companies`
  - configuration présente dans `company_settings`
  - données métier existantes (legacy)
- Synchroniser `companies.name` / `company_name_set` depuis `company_settings` si l’ancien compte avait déjà renseigné ses infos ailleurs.
- Marquer automatiquement `onboarding_completed = true` et activer les modules par défaut pour les anciens comptes reconnus.
- Faire en sorte qu’un utilisateur ayant déjà rempli ses infos ne repasse plus jamais par l’onboarding à la connexion.

3. Corriger la sauvegarde de l’onboarding pour les nouveaux comptes
- Refaire `useCompanyModules.saveModules()` pour qu’il mette à jour la société résolue réellement, même si l’état React `company` n’est pas encore synchronisé.
- Éviter toute dépendance fragile à `company === null` juste après `ensureCompany()`.
- Ajuster `ModuleSelection.tsx` pour que:
  - les anciens comptes sortent directement vers `/app`
  - les nouveaux comptes ne voient l’onboarding qu’une seule fois
  - aucun retour automatique à l’étape 2 ne puisse se reproduire après sauvegarde.

4. Stabiliser l’accès caisse des caissières
- Étendre `MemberInfo` avec `owner_id`.
- Modifier la fonction SQL `validate_pin_login` pour renvoyer `companies.owner_id`.
- Mettre à jour l’edge function `supabase/functions/pin-login/index.ts` pour inclure `owner_id` dans la réponse.
- Stocker `owner_id` dans `AuthContext` / localStorage membre.
- Ensuite, faire passer tous les écrans employés critiques sur:
  - `memberInfo.owner_id` en priorité
  - `company?.owner_id` en fallback
- Appliquer cela au minimum dans:
  - `src/pages/Caisse.tsx`
  - `src/hooks/useProducts.ts`
  - `src/hooks/useSales.ts`
  - `src/hooks/useCompanySettings.ts`
- Résultat attendu: la caissière ouvre son espace sans attendre une résolution tardive de la compagnie.

5. Compléter la synchronisation admin/manager pour la caisse
- Créer une migration pour ajouter `created_by_member_id` sur:
  - `cash_sessions`
  - `cash_movements`
- À l’ouverture de caisse et lors des mouvements, enregistrer l’employée qui agit.
- Conserver `user_id = owner_id` pour l’unification entreprise, mais ajouter la traçabilité membre pour le suivi.
- Mettre à jour l’UI caisse pour afficher le bon nom caissière depuis `memberInfo`, pas depuis le profil propriétaire.
- Vérifier que les politiques RLS existantes restent compatibles avec ces nouvelles colonnes et le modèle multi-tenant.

6. Validation complète
- Tester ancien propriétaire:
  - connexion
  - arrivée directe sur `/app`
  - aucun retour onboarding
- Tester nouveau propriétaire:
  - inscription
  - onboarding 1 seule fois
  - accès normal ensuite
- Tester caissière:
  - login PIN
  - redirection vers `/app/caisse`
  - ouverture de caisse
  - vente
  - mouvement entrée/dépense
  - données visibles côté admin/manager
- Vérifier mobile sur le parcours auth → app → caisse.

Détails techniques
- Fichiers front principaux:
  - `src/contexts/AuthContext.tsx`
  - `src/hooks/useCompany.ts`
  - `src/hooks/useCompanyModules.ts`
  - `src/pages/ModuleSelection.tsx`
  - `src/pages/Caisse.tsx`
  - `src/hooks/useProducts.ts`
  - `src/hooks/useSales.ts`
  - `src/hooks/useCompanySettings.ts`
- Backend / Supabase:
  - migration SQL pour `validate_pin_login`
  - migration SQL pour `cash_sessions` / `cash_movements`
  - `supabase/functions/pin-login/index.ts`

Résultat visé
- Ancien utilisateur: connexion directe à son espace sans ressaisir entreprise ni formule.
- Nouveau utilisateur: onboarding propre, une seule fois.
- Caissière: accès caisse fiable, actions synchronisées à l’entreprise, suivi complet côté admin/manager.
