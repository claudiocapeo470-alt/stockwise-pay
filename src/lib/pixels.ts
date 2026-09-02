/**
 * ============================================================
 * pixels.ts — Suivi publicitaire (pixels marketing) storefront
 * Charge dynamiquement les scripts officiels des plateformes
 * activées pour UNE boutique donnée, après consentement.
 * ============================================================
 */

export type PixelPlatform =
  | "meta"
  | "google_ads"
  | "ga4"
  | "tiktok"
  | "snapchat"
  | "linkedin"
  | "x";

export interface ShopPixels {
  id?: string;
  shop_id?: string;
  meta_pixel_id: string | null;
  google_ads_conversion_id: string | null;
  ga4_measurement_id: string | null;
  tiktok_pixel_id: string | null;
  snapchat_pixel_id: string | null;
  linkedin_partner_id: string | null;
  x_pixel_id: string | null;
  enabled_platforms: Partial<Record<PixelPlatform, boolean>>;
}

export const PIXEL_FIELDS: Record<PixelPlatform, keyof ShopPixels> = {
  meta: "meta_pixel_id",
  google_ads: "google_ads_conversion_id",
  ga4: "ga4_measurement_id",
  tiktok: "tiktok_pixel_id",
  snapchat: "snapchat_pixel_id",
  linkedin: "linkedin_partner_id",
  x: "x_pixel_id",
};

export type PixelEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface PixelEventData {
  content_ids?: string[];
  content_name?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  order_id?: string;
}

const w = () => window as any;

let current: ShopPixels | null = null;
let loaded = false;
let activeList: PixelPlatform[] = [];

const idOf = (p: PixelPlatform): string | null => {
  if (!current) return null;
  const raw = current[PIXEL_FIELDS[p]] as unknown as string | null;
  const val = (raw || "").trim();
  return val.length > 0 ? val : null;
};

const isEnabled = (p: PixelPlatform) =>
  !!current && current.enabled_platforms?.[p] === true && !!idOf(p);

function injectScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Enregistre la configuration de la boutique courante (ne charge rien). */
export function setPixelConfig(cfg: ShopPixels | null) {
  current = cfg;
}

/** Charge les scripts officiels des plateformes actives (idempotent). */
export function loadPixels() {
  if (loaded || !current || typeof window === "undefined") return;
  loaded = true;
  activeList = (Object.keys(PIXEL_FIELDS) as PixelPlatform[]).filter(isEnabled);
  if (activeList.length === 0) return;

  // ── Meta (Facebook) Pixel ───────────────────────────────
  if (isEnabled("meta")) {
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true; t.src = v;
      b.head.appendChild(t);
    })(w(), document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    w().fbq("init", idOf("meta"));
  }

  // ── Google (GA4 / Google Ads) via gtag.js ───────────────
  const gaId = isEnabled("ga4") ? idOf("ga4") : null;
  const adsId = isEnabled("google_ads") ? idOf("google_ads") : null;
  if (gaId || adsId) {
    injectScript(
      `https://www.googletagmanager.com/gtag/js?id=${gaId || adsId}`,
      "stocknix-gtag",
    );
    w().dataLayer = w().dataLayer || [];
    w().gtag = function () { w().dataLayer.push(arguments); };
    w().gtag("js", new Date());
    if (gaId) w().gtag("config", gaId);
    if (adsId) w().gtag("config", adsId);
  }

  // ── TikTok Pixel ────────────────────────────────────────
  if (isEnabled("tiktok")) {
    /* eslint-disable */
    (function (win: any, d: Document) {
      win.TiktokAnalyticsObject = "ttq";
      const ttq: any = (win.ttq = win.ttq || []);
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
      ttq.setAndDefer = function (t: any, e: string) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e: string) {
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = {};
        const s = d.createElement("script");
        s.async = true; s.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${e}&lib=ttq`;
        d.head.appendChild(s);
      };
      ttq.load(idOf("tiktok"));
    })(w(), document);
    /* eslint-enable */
  }

  // ── Snapchat Pixel ──────────────────────────────────────
  if (isEnabled("snapchat")) {
    /* eslint-disable */
    (function (win: any, d: Document) {
      const a: any = (win.snaptr = win.snaptr || function () {
        a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
      });
      a.queue = [];
      const s = d.createElement("script");
      s.async = true; s.src = "https://sc-static.net/scevent.min.js";
      d.head.appendChild(s);
    })(w(), document);
    /* eslint-enable */
    w().snaptr("init", idOf("snapchat"));
  }

  // ── LinkedIn Insight Tag ────────────────────────────────
  if (isEnabled("linkedin")) {
    w()._linkedin_partner_id = idOf("linkedin");
    w()._linkedin_data_partner_ids = w()._linkedin_data_partner_ids || [];
    w()._linkedin_data_partner_ids.push(idOf("linkedin"));
    injectScript("https://snap.licdn.com/li.lms-analytics/insight.min.js", "stocknix-linkedin");
  }

  // ── X (Twitter) Pixel ───────────────────────────────────
  if (isEnabled("x")) {
    /* eslint-disable */
    (function (win: any, d: Document) {
      if (win.twq) return;
      const s: any = (win.twq = function () { s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments); });
      s.version = "1.1"; s.queue = [];
      const t = d.createElement("script");
      t.async = true; t.src = "https://static.ads-twitter.com/uwt.js";
      d.head.appendChild(t);
    })(w(), document);
    /* eslint-enable */
    w().twq("config", idOf("x"));
  }

  trackPixelEvent("PageView");
}

/** Diffuse un événement standard vers chaque pixel actif. */
export function trackPixelEvent(event: PixelEvent, data: PixelEventData = {}) {
  if (!loaded || !current || activeList.length === 0) return;
  const currency = data.currency || "XOF";

  try {
    if (isEnabled("meta") && w().fbq) {
      w().fbq("track", event, {
        content_ids: data.content_ids,
        content_name: data.content_name,
        content_type: "product",
        value: data.value,
        currency,
      });
    }

    if (w().gtag) {
      const gmap: Record<PixelEvent, string> = {
        PageView: "page_view",
        ViewContent: "view_item",
        AddToCart: "add_to_cart",
        InitiateCheckout: "begin_checkout",
        Purchase: "purchase",
      };
      w().gtag("event", gmap[event], {
        currency,
        value: data.value,
        transaction_id: data.order_id,
        items: data.content_ids?.map(id => ({
          item_id: id,
          item_name: data.content_name,
          price: data.value,
          quantity: data.quantity || 1,
        })),
      });
      if (event === "Purchase" && isEnabled("google_ads")) {
        w().gtag("event", "conversion", {
          send_to: idOf("google_ads"),
          value: data.value,
          currency,
          transaction_id: data.order_id,
        });
      }
    }

    if (isEnabled("tiktok") && w().ttq) {
      const tmap: Record<PixelEvent, string> = {
        PageView: "Pageview",
        ViewContent: "ViewContent",
        AddToCart: "AddToCart",
        InitiateCheckout: "InitiateCheckout",
        Purchase: "CompletePayment",
      };
      if (event === "PageView") w().ttq.page();
      else w().ttq.track(tmap[event], {
        content_id: data.content_ids?.[0],
        content_name: data.content_name,
        value: data.value,
        currency,
        quantity: data.quantity,
      });
    }

    if (isEnabled("snapchat") && w().snaptr) {
      const smap: Record<PixelEvent, string> = {
        PageView: "PAGE_VIEW",
        ViewContent: "VIEW_CONTENT",
        AddToCart: "ADD_CART",
        InitiateCheckout: "START_CHECKOUT",
        Purchase: "PURCHASE",
      };
      w().snaptr("track", smap[event], {
        item_ids: data.content_ids,
        price: data.value,
        currency,
        transaction_id: data.order_id,
      });
    }

    if (isEnabled("x") && w().twq) {
      w().twq("event", event, {
        value: data.value,
        currency,
        contents: data.content_ids?.map(id => ({ content_id: id, content_name: data.content_name })),
      });
    }
  } catch {
    /* le suivi ne doit jamais casser la boutique */
  }
}

/** Réinitialise l'état (changement de boutique). */
export function resetPixels() {
  current = null;
  loaded = false;
  activeList = [];
}
