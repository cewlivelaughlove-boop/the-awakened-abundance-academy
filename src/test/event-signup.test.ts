// @vitest-environment node
import { afterEach, describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { handleEventSignup, EVENT_CONSENT_VERSION } from "../lib/event-signup.server";
import { withEventSignup } from "../lib/event-signup-markup";
import { eventPage } from "../content/event-page";

const base = "https://awakened-abundance-academy.lovable.app";
const env = { SUPABASE_URL: "https://test-project.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-server-only-key" };
const payload = { email: " Visitor@Example.com ", requestId: "00000000-0000-4000-8000-000000000001", consent: true, consentVersion: EVENT_CONSENT_VERSION, source: "event-page", website: "" };
afterEach(() => vi.unstubAllEnvs());
function post(body: unknown = payload, headers: Record<string,string> = {}) {
  return new Request(base + "/api/event-signup", { method: "POST", headers: { origin: base, "Content-Type": "application/json", "cf-connecting-ip": "192.0.2.1", ...headers }, body: JSON.stringify(body) });
}
function upstream(body: unknown = { ok: true }, status = 200) {
  return vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));
}
describe("event signup server boundary", () => {
  it("fails closed when managed configuration is missing", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const fetcher = upstream();
    expect(await (await handleEventSignup(new Request(base + "/api/event-signup"), {})).json()).toEqual({ready:false});
    expect((await handleEventSignup(post(), {}, fetcher)).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects cross-site posts", async () => {
    const fetcher = upstream();
    expect((await handleEventSignup(post(payload,{origin:"https://other.example"}),env,fetcher)).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    {consent:false}, {email:"not-an-email"}, {email:"a".repeat(255)+"@example.com"},
    {consentVersion:"old"}, {website:"spam"}, {source:"untrusted"}, {requestId:"invalid"},
  ])("rejects invalid or nonconsensual input %j", async (change) => {
    const fetcher=upstream();
    expect((await handleEventSignup(post({...payload,...change}),env,fetcher)).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects oversized bodies even without Content-Length", async () => {
    expect((await handleEventSignup(post({...payload,extra:"a".repeat(2100)}),env,upstream())).status).toBe(400);
  });
  it("saves via private RPC, normalizes email and never returns stored data", async () => {
    const fetcher=upstream();
    const response=await handleEventSignup(post(),env,fetcher);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ok:true});
    const call=fetcher.mock.calls[0];
    if (!call) throw new Error("RPC was not called");
    const [url, options]=call;
    expect(url).toBe(env.SUPABASE_URL+"/rest/v1/rpc/record_event_signup");
    const sent=JSON.parse(options?.body as string);
    expect(sent.p_email).toBe("visitor@example.com");
    expect(sent.p_client_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(sent)).not.toContain("192.0.2.1");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("does not claim success on server failure, timeout or inconsistent response", async () => {
    for (const fetcher of [upstream({ok:false}),upstream({},500),vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"))]) {
      const result=await handleEventSignup(post(),env,fetcher);
      expect(result.status).toBe(503);
      expect(await result.json()).toEqual({ok:false,code:"unavailable"});
    }
  });
  it("honors durable rate limiting", async () => {
    expect((await handleEventSignup(post(),env,upstream({ok:false,code:"rate_limit"}))).status).toBe(429);
  });
  it("rejects missing consent", async () => {
    const { consent: _consent, ...withoutConsent } = payload;
    expect((await handleEventSignup(post(withoutConsent),env,upstream())).status).toBe(400);
  });
  it("uses apikey without an opaque credential bearer", async () => {
    const fetcher=upstream();
    expect((await handleEventSignup(post(),{...env,SUPABASE_SERVICE_ROLE_KEY:"sb_secret_test"},fetcher)).status).toBe(200);
    const headers=new Headers(fetcher.mock.calls[0]?.[1]?.headers);
    expect(headers.get("apikey")).toBe("sb_secret_test");
    expect(headers.has("Authorization")).toBe(false);
  });
  it("does not enable list reads or unsupported methods", async () => {
    const result=await handleEventSignup(new Request(base+"/api/event-signup",{method:"DELETE"}),env,upstream());
    expect(result.status).toBe(405);
    const status=await handleEventSignup(new Request(base+"/api/event-signup"),env);
    expect(await status.json()).toEqual({ready:true});
  });
});
describe("event page and additive book integration", () => {
  it("replaces only the original release section and preserves source", () => {
    const html=readFileSync(new URL("../approved/v23/books.html",import.meta.url),"utf8");
    const result=withEventSignup(html);
    expect(html).toContain("Email signup is not open yet");
    expect(result).not.toContain("Email signup is not open yet");
    expect(result).toContain('data-source="book-page"');
    expect(result).toContain('id="book-preview"');
    expect(result).toContain('class="hero-copy"');
    expect(result).toContain('id="release"');
  });
  it("provides truthful consent and no secret or instant-download promise", () => {
    for(const html of [eventPage, withEventSignup(readFileSync(new URL("../approved/v23/books.html",import.meta.url),"utf8"))]) {
      expect(html).toContain('type="checkbox" required');
      expect(html).toContain('authorized project editors');
      expect(html).toContain('does not send an instant email or PDF');
      expect(html).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(html).not.toContain('type="checkbox" checked');
    }
  });
});
