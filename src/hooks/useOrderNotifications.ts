/**
 * Les notifications « nouvelle commande » sont désormais envoyées côté serveur
 * par un trigger PostgreSQL sur `store_orders` (voir migration `notify_new_store_order`),
 * afin de fonctionner même quand aucun onglet de l'app n'est ouvert.
 *
 * Ce hook est conservé (no-op) pour ne pas casser les appels existants.
 */
export function useOrderNotifications(_storeId?: string, _companyId?: string) {
  // Aucune logique côté client : évite les notifications en double.
}
