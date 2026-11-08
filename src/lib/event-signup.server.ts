/** Server-only. Never import this module from a browser component or VITE_* configuration. */
export const EVENT_CONSENT_VERSION = "carla-event-updates-v1-20261108";
type Bindings = { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string };
type Config = { url: string; key: string };
const MAX_BODY = 2048;

function configFrom(env: unknown): Config | undefined {
  const bindings = (env && typeof env === "object" ? env : {}) as Bindings;
  const processEnv = typeof process !== "undefined" ? process.env : {};
  const url = bindings.SUPABASE_URL || processEnv["SUPABASE_URL"];
  const key = bindings.SUPABASE_SERVICE_ROLE_KEY || processEnv["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) return undefined;
    return { url: parsed.origin, key };
  } catch { return undefined; }
}

function reply(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

async function limitedBody(request: Request) {
  if (!request.body) throw new Error("empty");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new Error("too_large"); }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}

async function clientDigest(request: Request, secret: string) {
  // Cloudflare overwrites this header. Never trust a caller-supplied X-Forwarded-For.
  const network = request.headers.get("cf-connecting-ip") || "unavailable-network";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const result = await crypto.subtle.sign("HMAC", key, encoder.encode("carla-event-limit-v1:" + network));
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** The same-origin server boundary is the only caller allowed to write the private list. */
export async function handleEventSignup(request: Request, env: unknown, fetcher: typeof fetch = fetch): Promise<Response> {
  const config = configFrom(env);
  if (request.method === "GET") return reply(200, { ready: Boolean(config) });
  if (request.method !== "POST") return reply(405, { ok: false, code: "method" });
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return reply(403, { ok: false, code: "origin" });
  }
  if (!config) return reply(503, { ok: false, code: "unavailable" });
  if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") {
    return reply(415, { ok: false, code: "content_type" });
  }
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return reply(413, { ok: false, code: "too_large" });
  let body;
  try { body = await limitedBody(request); } catch { return reply(400, { ok: false, code: "invalid" }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, { ok: false, code: "invalid" });
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length < 3 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || body.consent !== true || body.consentVersion !== EVENT_CONSENT_VERSION
      || !["event-page", "book-page"].includes(body.source)
      || typeof body.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)
      || typeof body.website !== "string" || body.website !== "") {
    return reply(400, { ok: false, code: "invalid" });
  }
  try {
    const response = await fetcher(config.url + "/rest/v1/rpc/record_event_signup", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.key, Authorization: "Bearer " + config.key },
      body: JSON.stringify({ p_email: email, p_request_id: body.requestId, p_consent_version: EVENT_CONSENT_VERSION, p_source: body.source, p_client_hash: await clientDigest(request, config.key) }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return reply(503, { ok: false, code: "unavailable" });
    const result = await response.json();
    if (result?.code === "rate_limit") return reply(429, { ok: false, code: "rate_limit" });
    if (result?.ok !== true) return reply(503, { ok: false, code: "unavailable" });
    return reply(200, { ok: true });
  } catch {
    // Never log request bodies, addresses, credentials, or upstream error responses.
    return reply(503, { ok: false, code: "unavailable" });
  }
}
