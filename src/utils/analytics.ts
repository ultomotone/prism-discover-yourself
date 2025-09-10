export function trackEvent(name: string, data: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const payload = { event: name, ...data };
  // Prefer Google Tag Manager's dataLayer if available
  if ((window as unknown as { dataLayer?: unknown[] }).dataLayer) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push(payload);
  } else {
    // Fallback to console for debugging
    console.debug("trackEvent", payload);
  }
}
