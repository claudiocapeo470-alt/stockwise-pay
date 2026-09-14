# Aperçu de partage des boutiques (Cloudflare)

Les liens partagés restent toujours propres :

- Boutique : `https://www.stocknix.com/boutique/{slug}`
- Produit : `https://www.stocknix.com/boutique/{slug}/produit/{productId}`

Le worker `og-worker.js` détecte les robots d'aperçu et leur renvoie le HTML
des fonctions `store-og` / `product-og`. L'adresse visible ne change jamais.

## Mise en place (une seule fois)

1. Le domaine `stocknix.com` doit être géré par Cloudflare (nameservers Cloudflare).
   Dans Lovable → Project Settings → Domains, cocher « Domain uses Cloudflare or a
   similar proxy » lors de la connexion du domaine, et laisser l'enregistrement proxifié (nuage orange).
2. Cloudflare → Workers & Pages → Create → Worker. Nommer `stocknix-og`.
   Coller le contenu de `og-worker.js`, puis Deploy.
3. Dans le worker → Settings → Domains & Routes → Add route :
   - `www.stocknix.com/boutique/*` (zone stocknix.com)
   - `stocknix.com/boutique/*`

## Vérification

```bash
curl -s -A "WhatsApp/2.23" https://www.stocknix.com/boutique/playdci | grep og:title
curl -s -A "facebookexternalhit/1.1" \
  https://www.stocknix.com/boutique/playdci/produit/<id> | grep -E 'og:(title|image|description)'
```

Puis coller le lien dans le débogueur Facebook :
https://developers.facebook.com/tools/debug/
