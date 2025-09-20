export interface BuildQuoraPayloadInput {
  pixelId: string;
  eventName: string;
  eventTime: number;
  conversionId?: string;
  value?: number;
  currency?: string;
  contents?: Array<Record<string, unknown>>;
  contentIds?: string[];
  hashedEmail?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface QuoraRequestEvent {
  event_name: string;
  event_time: number;
  action_source: 'website';
  conversion_id?: string;
  user_data?: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
  content_ids?: string[];
}

export interface QuoraRequestBody {
  pixel_id: string;
  data: QuoraRequestEvent[];
}

export function buildQuoraRequestBody(input: BuildQuoraPayloadInput): QuoraRequestBody {
  const userData: Record<string, unknown> = {};
  if (input.hashedEmail) {
    userData.email = input.hashedEmail;
  }
  if (input.clientIp) {
    userData.client_ip_address = input.clientIp;
  }
  if (input.userAgent) {
    userData.client_user_agent = input.userAgent;
  }

  const customData: Record<string, unknown> = {};
  if (typeof input.value === 'number' && Number.isFinite(input.value)) {
    customData.value = input.value;
  }
  if (typeof input.currency === 'string' && input.currency.trim()) {
    customData.currency = input.currency.trim();
  }
  if (Array.isArray(input.contents) && input.contents.length > 0) {
    customData.contents = input.contents;
  }
  if (Array.isArray(input.contentIds) && input.contentIds.length > 0) {
    customData.content_ids = input.contentIds;
  }

  const event: QuoraRequestEvent = {
    event_name: input.eventName,
    event_time: input.eventTime,
    action_source: 'website',
  };

  if (input.conversionId) {
    event.conversion_id = input.conversionId;
  }
  if (Object.keys(userData).length > 0) {
    event.user_data = userData;
  }
  if (Object.keys(customData).length > 0) {
    event.custom_data = customData;
  }
  if (Array.isArray(input.contentIds) && input.contentIds.length > 0) {
    event.content_ids = input.contentIds;
  }

  return {
    pixel_id: input.pixelId,
    data: [event],
  };
}

export function shouldRetry(status: number): boolean {
  if (status === 429) return true;
  if (status >= 500) return true;
  return false;
}
