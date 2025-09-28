// Plausible Analytics Integration
declare global {
  interface Window {
    plausible?: ((
      eventName: string,
      options?: {
        props?: Record<string, string | number | boolean>;
        revenue?: { currency: string; amount: number };
        callback?: () => void;
      }
    ) => void) & {
      q?: any[];
    };
  }
}

export interface PlausibleEventProps {
  [key: string]: string | number | boolean;
}

export interface PlausibleRevenue {
  currency: string;
  amount: number;
}

export interface PlausibleEventOptions {
  props?: PlausibleEventProps;
  revenue?: PlausibleRevenue;
  callback?: () => void;
}

// Initialize Plausible Analytics
export function initPlausible() {
  if (typeof window === 'undefined') return;

  // Add the plausible function to window if it doesn't exist
  window.plausible = window.plausible || function() { 
    (window.plausible!.q = window.plausible!.q || []).push(arguments as any);
  };

  // Check if script already exists
  if (document.querySelector('script[data-domain="prismpersonality.com"]')) {
    return;
  }

  // Create and add the Plausible script
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = "prismpersonality.com";
  script.dataset.api = "https://plausible.io/api/event";
  script.src = "https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js";
  
  document.getElementsByTagName('head')[0].appendChild(script);
}

// Track custom events
export function trackPlausibleEvent(
  eventName: string,
  options?: PlausibleEventOptions
) {
  if (typeof window === 'undefined' || !window.plausible) {
    console.warn('Plausible not initialized');
    return;
  }

  try {
    window.plausible(eventName, options);
  } catch (error) {
    console.error('Plausible tracking error:', error);
  }
}

// Track page views with custom properties
export function trackPlausiblePageView(props?: PlausibleEventProps) {
  trackPlausibleEvent('pageview', { props });
}

// Track assessment events
export function trackAssessmentEvent(
  action: 'start' | 'complete' | 'abandon',
  props?: PlausibleEventProps
) {
  trackPlausibleEvent(`Assessment ${action}`, { props });
}

// Track result views
export function trackResultView(props?: PlausibleEventProps) {
  trackPlausibleEvent('Result View', { props });
}

// Track conversions with revenue
export function trackConversion(
  eventName: string,
  revenue?: PlausibleRevenue,
  props?: PlausibleEventProps
) {
  trackPlausibleEvent(eventName, { revenue, props });
}