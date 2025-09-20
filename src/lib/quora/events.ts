declare global {
  interface Window {
    qpTrack?: (event: string, props?: Record<string, unknown>) => string | undefined;
    __lastQuoraConversionId?: string;
  }
}

export type QuoraPayload = {
  value?: number;
  currency?: string;
  email?: string;
  content_ids?: string[];
  contents?: Array<Record<string, unknown>>;
  conversion_id?: string;
  [key: string]: unknown;
};

export function sendQuoraEvent(
  event: string,
  props: QuoraPayload = {},
  { allowOnResults = false }: { allowOnResults?: boolean } = {}
): string | undefined {
  if (typeof window === 'undefined' || typeof window.qpTrack !== 'function') return undefined;
  const payload: QuoraPayload = { ...props };
  if (allowOnResults) {
    (payload as Record<string, unknown>).__allowResults = true;
  }
  const conversionId = window.qpTrack(event, payload);
  if (conversionId) {
    window.__lastQuoraConversionId = conversionId;
  }
  return conversionId;
}

export function sendQuoraPageView(path?: string) {
  const props: QuoraPayload = {};
  if (path) {
    (props as Record<string, unknown>).page_path = path;
  }
  sendQuoraEvent('ViewContent', props);
}
