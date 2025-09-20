import type { Service } from "@/data/services";

export interface FacebookProductInput {
  id: string;
  name: string;
  price?: number | string;
  currency?: string;
  quantity?: number;
}

export interface FacebookContentItem {
  content_id: string;
  content_name?: string;
  content_price?: number;
  num_items?: number;
}

export interface FacebookDpaEventPayload {
  content_type: "product";
  contents: FacebookContentItem[];
  content_ids: string[];
  value?: number;
  currency?: string;
  transaction_id?: string;
  session_id?: string;
  [key: string]: unknown;
}

const DEFAULT_CURRENCY = "USD";

function normalisePrice(value?: number | string): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === "string") {
    const stripped = value.replace(/[^0-9.,-]+/g, "").replace(/,(?=\d{3}(?:\D|$))/g, "");
    const parsed = Number.parseFloat(stripped.replace(/,/g, ""));
    if (Number.isFinite(parsed)) {
      return Math.round(parsed * 100) / 100;
    }
  }
  return undefined;
}

function deriveCurrency(value?: number | string, fallback?: string): string | undefined {
  if (typeof fallback === "string" && fallback.trim().length > 0) {
    return fallback.trim().toUpperCase();
  }
  if (typeof value === "string") {
    if (/usd/i.test(value) || value.includes("$")) return DEFAULT_CURRENCY;
  }
  if (typeof value === "number") {
    return DEFAULT_CURRENCY;
  }
  return undefined;
}

function clonePayload(payload: FacebookDpaEventPayload): FacebookDpaEventPayload {
  return {
    ...payload,
    contents: payload.contents.map((item) => ({ ...item })),
    content_ids: [...payload.content_ids],
  };
}

export function buildFacebookDpaPayload(product: FacebookProductInput): FacebookDpaEventPayload {
  const quantity = product.quantity && product.quantity > 0 ? product.quantity : 1;
  const price = normalisePrice(product.price);
  const currency = deriveCurrency(product.price, product.currency);
  const value = price !== undefined ? Math.round(price * quantity * 100) / 100 : undefined;

  const contents: FacebookContentItem[] = [
    {
      content_id: product.id,
      content_name: product.name,
      ...(price !== undefined ? { content_price: price } : {}),
      num_items: quantity,
    },
  ];

  const payload: FacebookDpaEventPayload = {
    content_type: "product",
    contents,
    content_ids: [product.id],
    ...(value !== undefined ? { value } : {}),
    ...(currency ? { currency } : {}),
  };

  return payload;
}

export function buildFacebookPayloadFromService(
  service: Pick<Service, "id" | "title" | "price">,
  quantity?: number,
): FacebookDpaEventPayload {
  return buildFacebookDpaPayload({
    id: service.id,
    name: service.title,
    price: service.price,
    quantity,
  });
}

export function rememberFacebookDpaPayload(payload: FacebookDpaEventPayload): void {
  if (typeof window === "undefined") return;
  (window as WindowWithFacebookState).__lastFbDpaPayload = clonePayload(payload);
}

export function getRememberedFacebookDpaPayload(): FacebookDpaEventPayload | undefined {
  if (typeof window === "undefined") return undefined;
  const state = (window as WindowWithFacebookState).__lastFbDpaPayload;
  return state ? clonePayload(state) : undefined;
}

type WindowWithFacebookState = Window & {
  __lastFbDpaPayload?: FacebookDpaEventPayload;
};

declare global {
  interface Window {
    __lastFbDpaPayload?: FacebookDpaEventPayload;
  }
}

export function mergePurchaseDetails(
  base: FacebookDpaEventPayload | undefined,
  value: number,
  currency: string,
  metadata: { transaction_id?: string; session_id?: string },
): FacebookDpaEventPayload | undefined {
  if (!base) return undefined;
  const safeValue = Number.isFinite(value) ? Math.round(value * 100) / 100 : base.value;
  const safeCurrency = typeof currency === "string" && currency.trim().length > 0
    ? currency.trim().toUpperCase()
    : (typeof base.currency === "string" ? String(base.currency) : DEFAULT_CURRENCY);
  const payload: FacebookDpaEventPayload = {
    ...base,
    ...(safeValue !== undefined ? { value: safeValue } : {}),
    currency: safeCurrency,
    ...(metadata.transaction_id ? { transaction_id: metadata.transaction_id } : {}),
    ...(metadata.session_id ? { session_id: metadata.session_id } : {}),
  };
  return payload;
}

export type { FacebookProductInput as FacebookProduct };
