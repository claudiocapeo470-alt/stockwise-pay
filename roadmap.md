# Roadmap

- [x] Harmoniser Gestion de stock, Produits en ligne, Factures et Devis en listes simples sans regroupement par période

- [x] Refonte responsive mobile/tablette/PWA : Bottom Sheets communs et Drawer latéral tactile

- [x] Harmoniser les pages mobiles : recherche sous le titre, filtres en pilules, bouton Ajouter dans l'en-tête et notifications réservées à l'accueil

- [x] Partie 1 : liens propres /boutique/{slug}/produit/{id}, route SPA, worker Cloudflare (cloudflare/og-worker.js + README), fonctions OG vérifiées en conditions réelles
- [x] Partie 2 : Telegram
  - [x] Table telegram_links (RLS propriétaire, realtime)
  - [x] telegram-webhook + send-telegram-notification déployées et testées
  - [x] TelegramSettings dans Paramètres (owner)
  - [x] Webhook Telegram enregistré (getWebhookInfo OK)
  - [x] Mémoire mise à jour (Telegram autorisé)
- [ ] Côté utilisateur : mettre stocknix.com chez Cloudflare + déployer cloudflare/og-worker.js (voir cloudflare/README.md), puis tester l'aperçu dans le débogueur Facebook
- [ ] Côté utilisateur : se connecter au bot @StocknixBot depuis Paramètres → Notifications Telegram (test réel)
