/** Minimal existing jsdom test surface; no new runtime dependency is needed. */
declare module "jsdom" {
  export class JSDOM {
    constructor(html?: string, options?: Record<string, unknown>);
    window: Window & typeof globalThis;
  }
}
