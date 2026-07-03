// Edge function: renvoie une page HTML avec meta OpenGraph par boutique.
// Les crawlers (Facebook, WhatsApp, LinkedIn, Twitter, Slack...) reçoivent
// les meta correctes ; les vrais navigateurs sont redirigés vers la SPA.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://www.stocknix.com";

const CRAWLER_RE = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterest|redditbot|Applebot|bingbot|Googlebot|SkypeUriPreview|vkShare|W3C_Validator|Embedly/i;

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(store: { name: string; description: string | null; logo_url: string | null; banner_url: string | null; slug: string }): string {
  const title = escapeHtml(store.name);
  const desc = escapeHtml(store.description || `Découvrez la boutique en ligne ${store.name} sur Stocknix.`);
  const image = escapeHtml(store.banner_url || store.logo_url || `${SITE}/stocknix-logo-official.png`);
  const url = `${SITE}/boutique/${escapeHtml(store.slug)}`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${title}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${title}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${image}" />
<meta http-equiv="refresh" content="0; url=${url}" />
</head>
<body>
<script>window.location.replace(${JSON.stringify(url)});</script>
<p>Redirection vers <a href="${url}">${title}</a>…</p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    // slug via ?slug=... ou dernier segment du path
    let slug = url.searchParams.get("slug") || "";
    if (!slug) {
      const parts = url.pathname.split("/").filter(Boolean);
      slug = parts[parts.length - 1] || "";
      if (slug === "store-og") slug = "";
    }

    if (!slug) {
      return new Response("Missing slug", { status: 400, headers: corsHeaders });
    }

    const ua = req.headers.get("user-agent") || "";
    const isCrawler = CRAWLER_RE.test(ua);

    // Si ce n'est pas un crawler, redirige immédiatement vers la SPA
    if (!isCrawler) {
      return Response.redirect(`${SITE}/boutique/${slug}`, 302);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: store } = await supabase
      .from("online_store")
      .select("name, description, logo_url, banner_url, slug, is_published")
      .eq("slug", slug)
      .maybeSingle();

    if (!store || !store.is_published) {
      return new Response(renderHtml({ name: "Stocknix Boutique", description: null, logo_url: null, banner_url: null, slug }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response(renderHtml(store), {
      status: 200,
      headers: {
        ...corsHeaders,
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  } catch (e) {
    return new Response(`Error: ${(e as Error).message}`, { status: 500, headers: corsHeaders });
  }
});
