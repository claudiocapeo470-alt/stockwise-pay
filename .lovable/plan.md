# Amélioration du panier, du scanner et des listes produit

## Résultat attendu
- Refaire les lignes du panier de la caisse avec la photo du produit, une hiérarchie plus claire, des contrôles de quantité compacts et un prix bien aligné.
- Remplacer la fenêtre actuelle du scanner par une vue caméra immersive sur mobile et tablette, sans le texte « Scanner un Code QR pour payer ».
- Garder uniquement les actions utiles du scanner : torche, saisie manuelle et fermeture. La torche utilisera réellement le flash de la caméra lorsqu'il est disponible.
- Afficher la photo de chaque produit dans le détail des commandes reçues, avec un remplacement propre lorsque le produit n'a pas de photo.
- Rendre le glissement vers la gauche plus fluide dans les listes et activer la même suppression par glissement sur les produits en ligne et les produits non publiés.

## Détails techniques
- Réutiliser `image_url` déjà présent dans le panier de la caisse.
- Enregistrer `image_url` dans les articles de `store_orders` lors du paiement pour les nouvelles commandes, puis l'afficher dans le détail de commande. Les anciennes commandes garderont une icône de remplacement.
- Piloter la torche via les capacités de la piste vidéo de `html5-qrcode`, avec bouton désactivé si le téléphone ne propose pas cette capacité.
- Améliorer `SwipeToDelete` avec Pointer Events, suivi tactile sans saccade, résistance en bout de course et animation de ressort courte.
- Brancher `onSwipeDelete` aux deux listes de `StoreProducts` avec la confirmation existante avant suppression définitive.

## Vérification
- Contrôler la compilation et les erreurs de l'aperçu.
- Tester visuellement les écrans publics disponibles ; les écrans connectés seront validés autant que l'environnement le permet.
