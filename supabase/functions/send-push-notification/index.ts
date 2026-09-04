import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@stocknix.com";

const enc = new TextEncoder();

function b64urlToBytes(input: string): Uint8Array {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data as BufferSource));
}

/** Jeton VAPID (ES256) pour l'origine du service de push. */
async function createVapidToken(audience: string): Promise<string> {
  const pub = b64urlToBytes(VAPID_PUBLIC_KEY);
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    d: VAPID_PRIVATE_KEY,
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    ext: true,
  };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);

  const header = bytesToB64url(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = bytesToB64url(
    enc.encode(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: VAPID_SUBJECT,
      }),
    ),
  );
  const signingInput = `${header}.${payload}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(signingInput) as BufferSource),
  );
  return `${signingInput}.${bytesToB64url(signature)}`;
}

/** Chiffrement du corps au format aes128gcm (RFC 8291). */
async function encryptPayload(
  plaintext: string,
  uaPublicB64: string,
  authSecretB64: string,
): Promise<Uint8Array> {
  const uaPublic = b64urlToBytes(uaPublicB64);
  const authSecret = b64urlToBytes(authSecretB64);

  const localKeys = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", localKeys.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic as BufferSource, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, localKeys.privateKey, 256),
  );

  const prkKey = await hmac(authSecret, sharedSecret);
  const keyInfo = concat(enc.encode("WebPush: info\0"), uaPublic, asPublic, new Uint8Array([1]));
  const ikm = await hmac(prkKey, keyInfo);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);

  const aesKey = await crypto.subtle.importKey("raw", cek as BufferSource, { name: "AES-GCM" }, false, ["encrypt"]);
  const body = concat(enc.encode(plaintext), new Uint8Array([2]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce as BufferSource }, aesKey, body as BufferSource),
  );

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ciphertext);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      return new Response(JSON.stringify({ error: "Clés VAPID manquantes" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json().catch(() => null);
    const title = typeof payload?.title === "string" ? payload.title.slice(0, 120) : "";
    const message = typeof payload?.body === "string" ? payload.body.slice(0, 400) : "";
    const url = typeof payload?.url === "string" ? payload.url : "/app";
    const tag = typeof payload?.tag === "string" ? payload.tag : undefined;
    const requireInteraction = payload?.requireInteraction === true;
    const userIds: string[] = Array.isArray(payload?.user_ids)
      ? payload.user_ids.filter((v: unknown) => typeof v === "string")
      : typeof payload?.user_id === "string"
        ? [payload.user_id]
        : [];

    const serviceKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}")["default"] ?? "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey);

    if (typeof payload?.company_id === "string") {
      const { error: notificationError } = await supabase.from("notifications").insert({
        company_id: payload.company_id,
        type: payload.type || "info",
        title: payload.title,
        message: payload.body,
      });
      if (notificationError) console.error("notification insert failed", notificationError.message);
    }

    if (!title || userIds.length === 0) {
      return new Response(JSON.stringify({ error: "Paramètres invalides: user_id(s) et title requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", userIds);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, removed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const notification = JSON.stringify({ title, body: message, url, tag, requireInteraction });
    let sent = 0;
    const expired: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
        try {
          const audience = new URL(sub.endpoint).origin;
          const [token, encrypted] = await Promise.all([
            createVapidToken(audience),
            encryptPayload(notification, sub.p256dh, sub.auth),
          ]);

          const res = await fetch(sub.endpoint, {
            method: "POST",
            headers: {
              TTL: "86400",
              "Content-Encoding": "aes128gcm",
              "Content-Type": "application/octet-stream",
              Urgency: "normal",
              Authorization: `vapid t=${token}, k=${VAPID_PUBLIC_KEY}`,
            },
            body: encrypted as BodyInit,
          });

          if (res.status === 404 || res.status === 410) {
            expired.push(sub.id);
          } else if (res.ok) {
            sent++;
          } else {
            console.error("push failed", res.status, await res.text());
          }
        } catch (err) {
          console.error("push error", (err as Error).message);
        }
      }),
    );

    if (expired.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", expired);
    }

    return new Response(JSON.stringify({ sent, removed: expired.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-push-notification error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
