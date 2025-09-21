import { createTrackingClient } from '@/lib/supabaseClient';
import { getConfiguredRedditPixelId } from '@/lib/reddit/config';

// Safe Reddit tracking client that handles missing env vars gracefully
let trackingClient: ReturnType<typeof createTrackingClient> | null = null;

export const getTrackingClient = () => {
  if (!trackingClient) {
    trackingClient = createTrackingClient();
  }
  return trackingClient;
};

// Safe Reddit tracking that won't cause 404/500 noise
let safeClientCustomWarned = false;

export const safeTrackRedditEvent = async (eventName: string, payload: any = {}) => {
  try {
    // Check if Reddit tracking is configured
    const redditAppId = getConfiguredRedditPixelId();
    if (!redditAppId) {
      console.log('Reddit tracking not configured, skipping event:', eventName);
      return;
    }

    const normalizedPayload = { ...payload };
    let customName: string | undefined;
    if (eventName === 'Custom') {
      customName = normalizedPayload.custom_event_name || normalizedPayload.customEventName || normalizedPayload.name;
      if (!customName) {
        if (!safeClientCustomWarned) {
          safeClientCustomWarned = true;
          console.warn('Reddit Custom event skipped: missing custom event name', normalizedPayload);
        }
        return;
      }
      normalizedPayload.custom_event_name = customName;
      normalizedPayload.customEventName = customName;
    }

    const client = getTrackingClient();
    const { data, error } = await client.functions.invoke('reddit-capi', {
      body: {
        ...normalizedPayload,
        event_name: customName ?? eventName,
        event_type: eventName,
        ...(customName ? { custom_event_name: customName } : {}),
      }
    });

    if (error) {
      console.warn('Reddit tracking failed (non-blocking):', error);
      return;
    }

    console.log('Reddit event tracked:', eventName);
  } catch (error) {
    console.warn('Reddit tracking error (non-blocking):', error);
  }
};