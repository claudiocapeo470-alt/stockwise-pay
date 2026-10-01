# Refonte responsive des fenêtres et de la navigation

## Résultat attendu
- Sur mobile, tablette et PWA, les fenêtres courantes s’ouvrent depuis le bas comme des Bottom Sheets tactiles.
- La navigation reste visible en bas et son menu complet devient un Drawer latéral gauche.
- Sur ordinateur, les fenêtres et la navigation actuelles restent inchangées.

## Mise en œuvre
1. **Système commun de Bottom Sheet**
   - Adapter les composants communs de dialogue et de panneau pour appliquer automatiquement le comportement Bottom Sheet jusqu’au format tablette.
   - Ajouter une poignée tactile, l’ouverture depuis le bas, la fermeture par glissement vers le bas, le backdrop, le verrouillage du contenu arrière et les safe areas.
   - Limiter la hauteur au contenu, avec une hauteur maximale dynamique et un scroll intérieur pour les formulaires longs.
   - Conserver les dialogues réellement bloquants, notamment les confirmations critiques, sous leur forme actuelle.

2. **Drawer de navigation mobile**
   - Transformer le menu complet actuel en panneau latéral gauche contenant les mêmes sections et respectant les permissions de chaque rôle.
   - Garder le bouton Menu dans la barre mobile.
   - Ajouter l’ouverture par glissement depuis le bord gauche, la fermeture par glissement vers la gauche et par appui sur le backdrop.
   - Empêcher le geste d’ouverture d’interférer avec le scroll vertical normal.

3. **Adaptation mobile, tablette et PWA**
   - Appliquer les règles communes aux écrans tactiles jusqu’au format tablette, y compris portrait/paysage et mode installé.
   - Gérer les encoches, la barre système, le clavier virtuel et les zones de navigation fixes.
   - Préserver toutes les actions, validations, permissions, notifications et données existantes.

4. **Vérification**
   - Tester une fenêtre courte et une longue : ouverture, scroll, clavier et fermeture par swipe.
   - Tester le Drawer : bouton, swipe depuis le bord, swipe de fermeture et backdrop.
   - Contrôler les formats téléphone portrait/paysage, tablette et ordinateur.
   - Vérifier qu’aucune erreur de compilation ou d’exécution n’est introduite.

## Détails techniques
- Réutiliser les primitives tactiles déjà présentes dans le projet et centraliser les règles dans les composants UI communs.
- Seuil responsive tablette : moins de 1024 px ; comportement desktop à partir de 1024 px.
- Utiliser `dvh`, les variables `safe-area-inset-*`, un z-index commun et le verrouillage de scroll fourni par les primitives accessibles.
