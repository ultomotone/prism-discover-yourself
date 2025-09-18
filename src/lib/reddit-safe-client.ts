import { createTrackingClient } from '@/lib/supabaseClient';

// Safe Reddit tracking client that handles missing env vars gracefully
let trackingClient: ReturnType<typeof createTrackingClient> | null = null;

export const getTrackingClient = () => {
  if (!trackingClient) {
    trackingClient = createTrackingClient();
  }
  return trackingClient;
};

// Safe Reddit tracking that won't cause 404/500 noise
export const safeTrackRedditEvent = async (eventName: string, payload: any = {}) => {
  try {
    // Check if Reddit tracking is configured
    const redditAppId = localStorage.getItem('reddit_app_id');
    if (!redditAppId) {
      console.log('Reddit tracking not configured, skipping event:', eventName);
      return;
    }

    const client = getTrackingClient();
    const { data, error } = await client.functions.invoke('reddit-capi', {
      body: { event_name: eventName, ...payload }
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