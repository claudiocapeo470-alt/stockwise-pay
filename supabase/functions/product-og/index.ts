// Edge function: meta OpenGraph par PRODUIT d'une boutique publique.
// Les crawlers reçoivent le nom, la description, le prix et l'image du produit.
// Les vrais visiteurs sont redirigés vers la SPA (page produit ouverte).
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

// Retire le HTML éventuel d'une description riche et raccourcit.
function plain(raw: string | null, max = 150): string {
  const s = String(raw ?? "").replace(/<\/?[a-z][^>]*>/gi, " ").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

const fmtPrice = (n: number) => `${Number(n || 0).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} FCFA`;

function renderHtml(o: {
  title: string; desc: string; image: string; url: string; siteName: string;
}): string {
  const title = escapeHtml(o.title);
  const desc = escapeHtml(o.desc);
  const image = escapeHtml(o.image);
  const url = escapeHtml(o.url);
  const siteName = escapeHtml(o.siteName);
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="${siteName}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:alt" content="${title}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${image}" />
<meta http-equiv="refresh" content="0; url=${url}" />
</head>
<body>
<script>window.location.replace(${JSON.stringify(o.url)});</script>
<p>Redirection vers <a href="${url}">${title}</a>…</p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const reqUrl = new URL(req.url);
    const slug = reqUrl.searchParams.get("slug") || "";
    const productId = reqUrl.searchParams.get("product") || reqUrl.searchParams.get("produit") || "";

    if (!slug || !productId) {
      return new Response("Missing slug or product", { status: 400, headers: corsHeaders });
    }

    const spaUrl = `${SITE}/boutique/${encodeURIComponent(slug)}?produit=${encodeURIComponent(productId)}`;

    const ua = req.headers.get("user-agent") || "";
    if (!CRAWLER_RE.test(ua)) {
      return Response.redirect(spaUrl, 302);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}")["default"] ?? "",
    );

    const { data: store } = await supabase
      .from("online_store")
      .select("id, name, slug, logo_url, banner_url, is_published")
      .eq("slug", slug)
      .maybeSingle();

    const fallbackImage = `${SITE}/stocknix-logo-official.png`;

    if (!store || !store.is_published) {
      return new Response(renderHtml({
        title: "Boutique Stocknix",
        desc: "Découvrez cette boutique en ligne sur Stocknix.",
        image: fallbackImage,
        url: `${SITE}/boutique/${slug}`,
        siteName: "Stocknix",
      }), { status: 200, headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" } });
    }

    // Le produit doit être publié dans CETTE boutique
    const { data: sp } = await supabase
      .from("store_products")
      .select("online_price, is_active, products(id, name, description, price, image_url)")
      .eq("store_id", store.id)
      .eq("product_id", productId)
      .maybeSingle();

    const product: any = sp?.products;

    if (!product || sp?.is_active === false) {
      return new Response(renderHtml({
        title: store.name,
        desc: `Découvrez la boutique en ligne ${store.name} sur Stocknix.`,
        image: store.banner_url || store.logo_url || fallbackImage,
        url: `${SITE}/boutique/${store.slug}`,
        siteName: store.name,
      }), { status: 200, headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" } });
    }

    // Image principale : products.image_url, sinon première image de product_images
    let image = product.image_url as string | null;
    if (!image) {
      const { data: imgs } = await supabase
        .from("product_images")
        .select("image_url, sort_order")
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true })
        .limit(1);
      image = imgs?.[0]?.image_url ?? null;
    }

    const price = sp?.online_price ?? product.price;
    const shortDesc = plain(product.description);
    const desc = shortDesc
      ? `${fmtPrice(price)} — ${shortDesc}`
      : `${fmtPrice(price)} — Disponible sur la boutique ${store.name}.`;

    return new Response(renderHtml({
      title: product.name,
      desc,
      image: image || store.banner_url || store.logo_url || fallbackImage,
      url: spaUrl,
      siteName: store.name,
    }), {
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
