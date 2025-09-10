import { JSDOM } from "jsdom";

// Minimal DOM
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
});

// Assign globals BEFORE importing React/components
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node,
});

process.env.NODE_ENV = "test";

// Core stubs (idempotent)
if (!globalThis.HTMLElement.prototype.scrollIntoView) {
  globalThis.HTMLElement.prototype.scrollIntoView = function () {};
}

if (!globalThis.window.matchMedia) {
  globalThis.window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    media: "",
    onchange: null,
  }) as any;
}

if (!globalThis.ResizeObserver) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = ResizeObserver;
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id as any);
}

if (!globalThis.customElements) {
  (globalThis as any).customElements = { define() {}, get() {} };
}
