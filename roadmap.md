# Roadmap

- [x] Partie 1 : liens de partage propres /boutique/{slug}/produit/{id}, route SPA, worker Cloudflare og-worker.js + guide
- [ ] Partie 2 : Telegram
  - [x] Table telegram_links (migration + RLS + realtime)
  - [x] Edge functions telegram-webhook et send-telegram-notification (écrites)
  - [ ] Déployer les 2 fonctions
  - [ ] Composant TelegramSettings + intégration dans Settings.tsx
  - [ ] Demander TELEGRAM_BOT_TOKEN à l'utilisateur (création @StocknixBot via BotFather)
  - [ ] Enregistrer le webhook Telegram (setWebhook) après réception du token
  - [ ] Mettre à jour la mémoire (Telegram n'est plus exclu)
