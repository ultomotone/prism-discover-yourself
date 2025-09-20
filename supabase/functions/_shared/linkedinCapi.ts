export interface LinkedInEventInput {
  conversionId: string;
  eventId: string;
  eventTime: number;
  hashedEmail?: string;
  hashedPhone?: string;
  value?: number;
  currency?: string;
  ip?: string;
  userAgent?: string;
}

export interface LinkedInIdentifierSummary {
  hasEmail: boolean;
  hasPhone: boolean;
}

export interface LinkedInRequestBody {
  conversion: {
    id: string;
  };
  eventId: string;
  eventTime: number;
  value?: {
    amount: number;
    currencyCode: string;
  };
  user?: {
    userIdentifiers?: Array<{
      hashedEmail?: string;
      hashedPhoneNumber?: string;
    }>;
    sourceIpAddress?: string;
    userAgent?: string;
  };
}

export interface BuildLinkedInPayloadResult {
  body: LinkedInRequestBody;
  identifiers: LinkedInIdentifierSummary;
}

function sanitizeCurrency(currency?: string): string | undefined {
  if (!currency) return undefined;
  const normalized = currency.trim().toUpperCase();
  return normalized.length === 3 ? normalized : undefined;
}

function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function buildLinkedInRequestBody(input: LinkedInEventInput): BuildLinkedInPayloadResult {
  const identifiers: LinkedInIdentifierSummary = {
    hasEmail: Boolean(input.hashedEmail),
    hasPhone: Boolean(input.hashedPhone),
  };

  const userIdentifiers: Array<{ hashedEmail?: string; hashedPhoneNumber?: string }> = [];
  if (input.hashedEmail) {
    userIdentifiers.push({ hashedEmail: input.hashedEmail });
  }
  if (input.hashedPhone) {
    userIdentifiers.push({ hashedPhoneNumber: input.hashedPhone });
  }

  const payload: LinkedInRequestBody = {
    conversion: {
      id: input.conversionId,
    },
    eventId: input.eventId,
    eventTime: input.eventTime,
  };

  const currency = sanitizeCurrency(input.currency);
  if (typeof input.value === "number" && Number.isFinite(input.value) && currency) {
    payload.value = {
      amount: roundToCents(input.value),
      currencyCode: currency,
    };
  }

  if (userIdentifiers.length > 0 || input.ip || input.userAgent) {
    payload.user = {};
    if (userIdentifiers.length > 0) {
      payload.user.userIdentifiers = userIdentifiers;
    }
    if (input.ip) {
      payload.user.sourceIpAddress = input.ip;
    }
    if (input.userAgent) {
      payload.user.userAgent = input.userAgent;
    }
  }

  return { body: payload, identifiers };
}

export function shouldRetry(status: number): boolean {
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}
