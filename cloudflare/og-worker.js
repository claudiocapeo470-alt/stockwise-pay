/**
 * Stocknix — Worker Cloudflare "aperçu de partage"
 * ------------------------------------------------
 * À déployer sur la zone stocknix.com, avec les routes :
 *   www.stocknix.com/boutique/*
 *   stocknix.com/boutique/*
 *
 * Rôle : quand un robot d'aperçu (WhatsApp, Facebook, Telegram, LinkedIn…)
 * demande /boutique/{slug} ou /boutique/{slug}/produit/{id}, le worker va
 * chercher le HTML des fonctions Supabase store-og / product-og et le renvoie
 * SANS changer l'URL visible. Tout autre visiteur reçoit l'app React normale.
 */

const FUNCTIONS_BASE = "https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1";

// Identique à CRAWLER_RE dans store-og/index.ts
const CRAWLER_RE = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterest|redditbot|Applebot|bingbot|Googlebot|SkypeUriPreview|vkShare|W3C_Validator|Embedly/i;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const ua = request.headers.get("user-agent") || "";

    // Pas un robot -> l'app React, inchangée.
    if (!CRAWLER_RE.test(ua)) return fetch(request);

    // /boutique/{slug} | /boutique/{slug}/produit/{productId}
    const m = url.pathname.match(
      /^\/boutique\/([^/]+)(?:\/produit\/([^/]+))?\/?$/,
    );
    if (!m) return fetch(request);

    const slug = m[1];
    const productId = m[2] || url.searchParams.get("produit") || "";

    const target = productId
      ? `${FUNCTIONS_BASE}/product-og?slug=${encodeURIComponent(slug)}&productId=${encodeURIComponent(productId)}`
      : `${FUNCTIONS_BASE}/store-og?slug=${encodeURIComponent(slug)}`;

    const res = await fetch(target, {
      headers: { "user-agent": ua },
      redirect: "follow",
    });

    // Si la fonction échoue, on ne casse rien : on sert l'app.
    if (!res.ok) return fetch(request);

    return new Response(await res.text(), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};
