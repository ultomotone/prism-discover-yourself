import { JSDOM } from "jsdom";
import React from "react";

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
  Element: dom.window.Element,
  Node: dom.window.Node,
  DocumentFragment: dom.window.DocumentFragment,
  Event: dom.window.Event,
});

(globalThis as any).React = React;

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

if (!globalThis.MutationObserver) {
  (globalThis as any).MutationObserver = dom.window.MutationObserver;
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id as any);
}

if (!globalThis.customElements) {
  (globalThis as any).customElements = { define() {}, get() {} };
}
