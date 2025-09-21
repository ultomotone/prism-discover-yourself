/**
 * QA steps:
 * 1. In browser console: liTest('<CONVERSION_ID>', '[email protected]')
 * 2. Expect network 200 from /functions/v1/linkedin-capi, response { ok: true, eventId }
 * 3. Check Supabase logs for the function: no raw PII, LinkedIn status 2xx.
 * 4. LinkedIn Campaign Manager → Conversion → Recent activity shows the event after test traffic.
 */

export interface LinkedInSignupResult {
  ok: boolean;
  eventId?: string;
  status?: number | "dry_run";
  requestId?: string;
  warnings?: unknown;
  code?: string;
  error?: string;
}

interface SendLinkedInSignupOptions extends SendLinkedInConversionOptions {
  email: string;
}

interface SendLinkedInConversionOptions {
  conversionId: string;
  email?: string;
  value?: number;
  currency?: string;
  alsoFireClient?: boolean;
  consentGranted?: boolean;
}

export interface LinkedInConversionConfig {
  sitePageViewId?: string;
  leadConversionId?: string;
  signupConversionId?: string;
  purchaseConversionId?: string;
  addToCartConversionId?: string;
}

interface LinkedInEventOptions {
  email?: string;
  value?: number;
  currency?: string;
  consentGranted?: boolean;
  alsoFireClient?: boolean;
}

const FUNCTIONS_ENDPOINT = "/functions/v1/linkedin-capi";

function ensureEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  throw new Error("crypto.randomUUID is not available in this environment");
}

function resolveUserAgent(): string | undefined {
  if (typeof navigator !== "undefined" && typeof navigator.userAgent === "string") {
    return navigator.userAgent;
  }
  return undefined;
}

function isDev(): boolean {
  try {
    return Boolean((import.meta as any)?.env?.DEV);
  } catch (_) {
    return false;
  }
}

async function safeParseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch (_) {
    return {};
  }
}

function readAppConfig(): Record<string, unknown> {
  const source =
    (typeof window !== "undefined" && (window as any).__APP_CONFIG__) ||
    (typeof globalThis !== "undefined" && (globalThis as any).__APP_CONFIG__);
  if (source && typeof source === "object") {
    return source as Record<string, unknown>;
  }
  return {};
}

function toConversionId(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function resolveConsent(consentOverride?: boolean): boolean {
  if (typeof consentOverride === "boolean") {
    return consentOverride;
  }
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const consent = (window as any).__consent;
    return Boolean(consent && typeof consent === "object" && consent.analytics === true);
  } catch (_) {
    return false;
  }
}

function maybeFireClientPixel(conversionId: string | undefined): boolean {
  if (!conversionId || typeof window === "undefined") {
    return false;
  }
  if (typeof window.lintrk !== "function") {
    return false;
  }
  const numericId = Number(conversionId);
  const payload =
    Number.isFinite(numericId) && !Number.isNaN(numericId)
      ? { conversion_id: numericId }
      : { conversion_id: conversionId };
  try {
    window.lintrk("track", payload as { conversion_id: number | string });
    return true;
  } catch (error) {
    if (isDev()) {
      console.warn("LI client pixel error", error);
    }
    return false;
  }
}

export function getLinkedInConversionConfig(): LinkedInConversionConfig {
  const config = readAppConfig();
  return {
    sitePageViewId: toConversionId(config.LINKEDIN_SITE_PAGE_VIEW_ID),
    leadConversionId: toConversionId(config.LINKEDIN_LEAD_CONVERSION_ID),
    signupConversionId: toConversionId(config.LINKEDIN_SIGNUP_CONVERSION_ID),
    purchaseConversionId: toConversionId(config.LINKEDIN_PURCHASE_CONVERSION_ID),
    addToCartConversionId: toConversionId(config.LINKEDIN_ADD_TO_CART_CONVERSION_ID),
  };
}

async function sendLinkedInConversion({
  conversionId,
  email,
  value,
  currency,
  alsoFireClient = false,
  consentGranted,
}: SendLinkedInConversionOptions): Promise<LinkedInSignupResult> {
  const consent = resolveConsent(consentGranted);
  const eventId = ensureEventId();

  if (!consent) {
    return {
      ok: false,
      eventId,
      code: "consent_blocked",
      status: "dry_run",
    };
  }

  if (alsoFireClient) {
    maybeFireClientPixel(conversionId);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  headers["x-consent-analytics"] = "true";

  const body: Record<string, unknown> = {
    conversionId,
    eventId,
    userAgent: resolveUserAgent(),
  };

  if (typeof email === "string" && email.trim().length > 0) {
    body.email = email;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    body.value = value;
  }
  if (typeof currency === "string" && currency.trim().length > 0) {
    body.currency = currency;
  }

  try {
    const response = await fetch(FUNCTIONS_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      keepalive: true,
    });
    const payload = await safeParseJson(response);
    const result: LinkedInSignupResult = {
      ok: Boolean(payload.ok) && response.ok,
      eventId: typeof payload.eventId === "string" ? payload.eventId : eventId,
      status: typeof payload.status === "number" || payload.status === "dry_run" ? payload.status : undefined,
      requestId: typeof payload.requestId === "string" ? payload.requestId : undefined,
      warnings: payload.warnings,
      code: typeof payload.code === "string" ? payload.code : undefined,
      error: typeof payload.error === "string" ? payload.error : undefined,
    };

    if (!result.eventId) {
      result.eventId = eventId;
    }

    if (!result.ok && result.code === undefined) {
      result.code = response.ok ? "unknown_failure" : `http_${response.status}`;
    }

    if (!result.ok && result.error === undefined && !response.ok) {
      result.error = response.statusText || "unknown";
    }

    if (isDev()) {
      console.info("LI CAPI", result);
    }

    return result;
  } catch (error) {
    const failure: LinkedInSignupResult = {
      ok: false,
      eventId,
      code: "network_error",
      error: error instanceof Error ? error.message : "unknown",
    };
    if (isDev()) {
      console.info("LI CAPI", failure);
    }
    return failure;
  }
}

export async function sendLinkedInSignup({
  conversionId,
  email,
  value,
  currency,
  alsoFireClient = false,
  consentGranted = true,
}: SendLinkedInSignupOptions): Promise<LinkedInSignupResult> {
  return sendLinkedInConversion({
    conversionId,
    email,
    value,
    currency,
    alsoFireClient,
    consentGranted,
  });
}

export async function sendLinkedInLead(options: LinkedInEventOptions = {}): Promise<LinkedInSignupResult | undefined> {
  const { leadConversionId } = getLinkedInConversionConfig();
  if (!leadConversionId) {
    return undefined;
  }
  const consent = resolveConsent(options.consentGranted);
  if (!consent) {
    return undefined;
  }
  return sendLinkedInConversion({
    conversionId: leadConversionId,
    email: options.email,
    value: options.value,
    currency: options.currency,
    alsoFireClient: options.alsoFireClient ?? true,
    consentGranted: consent,
  });
}

export async function sendLinkedInSignupEvent(
  options: LinkedInEventOptions & { email: string },
): Promise<LinkedInSignupResult | undefined> {
  const { signupConversionId } = getLinkedInConversionConfig();
  if (!signupConversionId) {
    return undefined;
  }
  const consent = resolveConsent(options.consentGranted);
  if (!consent) {
    return undefined;
  }
  return sendLinkedInConversion({
    conversionId: signupConversionId,
    email: options.email,
    value: options.value,
    currency: options.currency,
    alsoFireClient: options.alsoFireClient ?? true,
    consentGranted: consent,
  });
}

export async function sendLinkedInPurchase(
  options: LinkedInEventOptions & { value: number; currency: string; conversionId?: string },
): Promise<LinkedInSignupResult | undefined> {
  const { purchaseConversionId } = getLinkedInConversionConfig();
  const conversionId = options.conversionId ?? purchaseConversionId;
  if (!conversionId) {
    return undefined;
  }
  const consent = resolveConsent(options.consentGranted);
  if (!consent) {
    return undefined;
  }
  return sendLinkedInConversion({
    conversionId,
    email: options.email,
    value: options.value,
    currency: options.currency,
    alsoFireClient: options.alsoFireClient ?? true,
    consentGranted: consent,
  });
}

export async function sendLinkedInAddToCart(options: LinkedInEventOptions = {}): Promise<LinkedInSignupResult | undefined> {
  const { addToCartConversionId } = getLinkedInConversionConfig();
  if (!addToCartConversionId) {
    return undefined;
  }
  const consent = resolveConsent(options.consentGranted);
  if (!consent) {
    return undefined;
  }
  return sendLinkedInConversion({
    conversionId: addToCartConversionId,
    email: options.email,
    value: options.value,
    currency: options.currency,
    alsoFireClient: options.alsoFireClient ?? true,
    consentGranted: consent,
  });
}

export function sendLinkedInPageView(): boolean {
  const { sitePageViewId } = getLinkedInConversionConfig();
  if (!sitePageViewId) {
    return false;
  }
  const consent = resolveConsent();
  if (!consent) {
    return false;
  }
  return maybeFireClientPixel(sitePageViewId);
}

export function testLinkedInSignup(conversionId: string, email: string) {
  return sendLinkedInSignup({ conversionId, email, alsoFireClient: false, consentGranted: true });
}

declare global {
  interface Window {
    lintrk?: (command: string, payload: { conversion_id: number | string }) => void;
    liTest?: (conversionId: string, email: string) => Promise<LinkedInSignupResult>;
    __consent?: { analytics?: boolean } | undefined;
    __APP_CONFIG__?: Record<string, unknown>;
  }
}

if (typeof window !== "undefined" && isDev()) {
  if (typeof window.liTest !== "function") {
    window.liTest = (conversionId: string, email: string) => testLinkedInSignup(conversionId, email);
  }
}

export { sendLinkedInConversion };
