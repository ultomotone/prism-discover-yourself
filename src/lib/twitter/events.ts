import { IS_PREVIEW } from '../env';

export type TwitterEventPayload = Record<string, unknown> & {
  value?: number;
  currency?: string;
  contents?: Array<Record<string, unknown>>;
  conversion_id?: string;
  email_address?: string;
  phone_number?: string;
  search_string?: string;
  status?: string;
};

export interface TwitterTrackOptions {
  allowOnResults?: boolean;
}

const ALLOW_RESULTS_FLAG = '__allowResults';

declare global {
  interface Window {
    twq?: (...args: unknown[]) => void;
    twqTrack?: (eventName: string, props?: Record<string, unknown>) => string | undefined;
  }
}

const sanitizeMetadata = (metadata: Record<string, unknown>) => {
  const payload: Record<string, unknown> = {};
  Object.entries(metadata).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === 'email' || key === 'email_address') {
      payload.email_address = value;
      return;
    }
    if (key === 'phone' || key === 'phone_number') {
      payload.phone_number = value;
      return;
    }
    payload[key] = value;
  });
  return payload;
};

export const sendTwitterEvent = (
  eventName: string,
  props: TwitterEventPayload = {},
  options: TwitterTrackOptions = {},
): string | undefined => {
  if (IS_PREVIEW) return undefined;
  if (typeof window === 'undefined' || typeof window.twqTrack !== 'function') return undefined;

  const payload: Record<string, unknown> = sanitizeMetadata(props);

  if (options.allowOnResults) {
    payload[ALLOW_RESULTS_FLAG] = true;
  }

  try {
    return window.twqTrack(eventName, payload);
  } catch (error) {
    console.warn('Twitter Pixel tracking error (non-blocking):', error);
    return undefined;
  }
};

export const sendTwitterPageView = (path?: string) => {
  const props: TwitterEventPayload = {};
  if (path) {
    props.page_path = path;
  }
  sendTwitterEvent('PageView', props);
};
