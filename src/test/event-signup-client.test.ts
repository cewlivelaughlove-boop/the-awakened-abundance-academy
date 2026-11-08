import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { eventSignupMarkup } from "../lib/event-signup-markup";
const script = readFileSync("public/assets/event-signup.js", "utf8");
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const getForm = () => document.querySelector<HTMLFormElement>("form")!;
const status = () => document.querySelector("#event-status")!.textContent;
function reply(payload: unknown, status = 200) { return Promise.resolve(new Response(JSON.stringify(payload),{status})); }
async function setup(postResponse = { ok:true }) {
  document.body.innerHTML=eventSignupMarkup("event-page");
  vi.stubGlobal("crypto",{ randomUUID: () => "00000000-0000-4000-8000-000000000001" });
  const fetcher=vi.fn().mockImplementationOnce(()=>reply({ready:true})).mockImplementationOnce(()=>reply(postResponse));
  vi.stubGlobal("fetch",fetcher);
  window.eval(script);
  await tick();
  return fetcher;
}
afterEach(()=>{document.body.replaceChildren();vi.unstubAllGlobals();vi.restoreAllMocks();});
describe("event signup client",()=>{
  it("has no preselected consent and refuses submission until validation succeeds",async()=>{
    const fetcher=await setup();
    expect(document.querySelector<HTMLInputElement>("#event-consent")!.checked).toBe(false);
    vi.spyOn(getForm(),"reportValidity").mockReturnValue(false);
    getForm().dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
    await tick();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("claims a saved signup only after real backend confirmation",async()=>{
    const fetcher=await setup();
    document.querySelector<HTMLInputElement>("#event-email")!.value="visitor@example.com";
    document.querySelector<HTMLInputElement>("#event-consent")!.checked=true;
    vi.spyOn(getForm(),"reportValidity").mockReturnValue(true);
    getForm().dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
    await tick();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(status()).toContain("Your interest is saved");
    expect(status()).toContain("no email or download has been sent");
  });
  it("does not claim success on unconfirmed persistence",async()=>{
    await setup({ok:false});
    document.querySelector<HTMLInputElement>("#event-email")!.value="visitor@example.com";
    document.querySelector<HTMLInputElement>("#event-consent")!.checked=true;
    vi.spyOn(getForm(),"reportValidity").mockReturnValue(true);
    getForm().dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
    await tick();
    expect(status()).toContain("could not confirm");
    expect(document.querySelector<HTMLButtonElement>("[type=submit]")!.disabled).toBe(false);
  });
});
