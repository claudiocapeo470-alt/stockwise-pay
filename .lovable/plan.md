
## Gestion des prix d'abonnement depuis l'espace CEO

Permettre au CEO de modifier dynamiquement les prix mensuels des plans Starter, Business et Pro (minimum 100 FCFA) depuis l'espace CEO. Les nouveaux prix seront utilisés partout : page Tarifs publique, page Mon Abonnement, et lors de l'initialisation du paiement.

### 1. Stockage persistant
- Sauvegarder les prix dans la table existante `ceo_settings` sous la clé `subscription_pricing`.
- Format JSON : `{ starter: 9900, business: 24900, pro: 49900 }`.
- Aucune migration nécessaire — la table et ses politiques RLS (admin uniquement) existent déjà.

### 2. Nouveau hook `useSubscriptionPricing`
- Fichier : `src/hooks/useSubscriptionPricing.ts`
- Charge les prix depuis `ceo_settings` (clé `subscription_pricing`).
- Retourne les prix actuels avec valeurs par défaut (9 900 / 24 900 / 49 900 XOF) si la clé n'existe pas encore.
- Expose `prices`, `isLoading` et `refetch`.
- Utilisé en lecture publique (la lecture sur ceo_settings est restreinte aux admins, donc on créera une politique SELECT publique uniquement pour la clé `subscription_pricing` via une fonction RPC `get_subscription_pricing` SECURITY DEFINER, OU on duplique les valeurs dans le client. Approche retenue : fonction RPC publique pour ne pas bloquer les pages publiques de Tarifs).

### 3. Nouvel onglet "Tarifs" dans `CeoSettings.tsx`
- Ajouter un 4ème onglet "Tarifs" (avant "Base de données").
- Trois champs numériques : Starter, Business, Pro (XOF / mois).
- Validation : minimum 100 FCFA, nombres entiers uniquement.
- Aperçu en direct des prix saisis (formatage avec espaces).
- Bouton "Sauvegarder" → upsert dans `ceo_settings` puis toast de confirmation.
- Bouton "Réinitialiser aux valeurs par défaut" (9 900 / 24 900 / 49 900).

### 4. Intégration côté utilisateur
- **`src/pages/Tarifs.tsx`** : remplacer les `monthlyPrice` codés en dur par les valeurs du hook. Afficher un loader léger pendant le fetch.
- **`src/pages/MySubscription.tsx`** : remplacer la constante `PLAN_PRICES` par les valeurs dynamiques du hook.
- Le hook `usePaiementPro` reste inchangé — il reçoit déjà le `amount` en paramètre depuis ces pages.

### 5. Détails techniques
- Fonction RPC Postgres `get_subscription_pricing()` (SECURITY DEFINER, lecture publique) qui retourne le JSON depuis `ceo_settings` avec fallback sur les valeurs par défaut.
- Validation côté client : refuser sauvegarde si un prix < 100, message d'erreur explicite.
- Aucun changement aux Edge Functions Paiement Pro — elles reçoivent toujours le montant depuis le client.

### Fichiers modifiés / créés
- ➕ `src/hooks/useSubscriptionPricing.ts` (nouveau)
- ➕ Migration SQL : créer la fonction RPC `get_subscription_pricing`
- ✏️ `src/pages/ceo/CeoSettings.tsx` (ajout onglet Tarifs)
- ✏️ `src/pages/Tarifs.tsx` (prix dynamiques)
- ✏️ `src/pages/MySubscription.tsx` (prix dynamiques)
