// SPA route change tracking for analytics vendors

import { sendLinkedInLead, sendLinkedInPageView, sendLinkedInSignupEvent } from './linkedin/track';
import { sendQuoraEvent, sendQuoraPageView } from './quora/events';
import { sendTwitterEvent, sendTwitterPageView } from './twitter/events';

interface RouteTrackingContext {
  consent: boolean;
  knownEmail?: string;
}

const RESULTS_ROUTE_PATTERN = /\bresults\b/;

const ANALYTICS_AUDIT_SUMMARY: Array<{ vendor: string; status: string; updates: string }> = [
  {
    vendor: 'Quora',
    status: '✓',
    updates: 'Consent-gated qpTrack helper + SPA page views and lead mapping',
  },
  {
    vendor: 'Twitter',
    status: '✓',
    updates: 'Consent-aware twqTrack wrapper + PageView + Lead hooks',
  },
  {
    vendor: 'LinkedIn',
    status: '✓',
    updates: 'Config-driven Site Page View + Lead/Signup/Purchase helpers',
  },
  {
    vendor: 'Facebook',
    status: '✓',
    updates: 'SPA PageView + Lead/Signup parity via route tracker',
  },
  {
    vendor: 'Reddit',
    status: '✓',
    updates: 'SPA PageVisit + Lead/Signup parity via route tracker',
  },
  {
    vendor: 'GA4',
    status: '✓',
    updates: 'Route-aware page_path updates via gtag config',
  },
];

let summaryLogged = false;

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const consent = window.__consent;
    return Boolean(consent && typeof consent === 'object' && consent.analytics === true);
  } catch (_) {
    return false;
  }
}

function getKnownUserEmail(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const candidate = (window as any).__knownUser;
  if (candidate && typeof candidate.email === 'string' && candidate.email.trim().length > 0) {
    return candidate.email.trim();
  }
  return undefined;
}

function logAnalyticsSummary(): void {
  if (summaryLogged) return;
  summaryLogged = true;
  if (typeof console === 'undefined' || typeof console.table !== 'function') return;
  console.table(ANALYTICS_AUDIT_SUMMARY);
}

function trackRouteSpecificEvents(path: string, context: RouteTrackingContext) {
  if (typeof window === 'undefined') return;

  const normalizedPath = path.toLowerCase();
  const onResultsRoute = RESULTS_ROUTE_PATTERN.test(normalizedPath);

  if (!onResultsRoute && normalizedPath.startsWith('/assessment')) {
    if (context.consent && typeof window.rdtTrack === 'function') {
      window.rdtTrack('Lead', { content_name: 'PRISM Assessment', page_path: path });
    }
    if (context.consent && typeof window.fbTrack === 'function') {
      window.fbTrack('Lead', { content_name: 'PRISM Assessment' });
    }
    sendTwitterEvent('Lead', { content_name: 'PRISM Assessment', page_path: path });
    sendQuoraEvent('GenerateLead', { content_name: 'PRISM Assessment', page_path: path });
    void sendLinkedInLead({
      consentGranted: context.consent,
      alsoFireClient: true,
    });
    if (context.consent && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { page_path: path });
    }
  }

  if (!onResultsRoute && (
    normalizedPath.startsWith('/signup/complete') ||
    normalizedPath.startsWith('/welcome') ||
    normalizedPath.includes('/account/create/complete')
  )) {
    if (context.consent && typeof window.rdtTrack === 'function') {
      window.rdtTrack('SignUp');
    }
    if (context.consent && typeof window.fbTrack === 'function') {
      window.fbTrack('CompleteRegistration');
    }
    sendTwitterEvent('SignUp', { page_path: path });
    sendQuoraEvent('CompleteRegistration', { page_path: path });
    if (context.knownEmail) {
      void sendLinkedInSignupEvent({
        email: context.knownEmail,
        consentGranted: context.consent,
        alsoFireClient: true,
      });
    }
    if (context.consent && typeof window.gtag === 'function') {
      window.gtag('event', 'sign_up', { method: 'assessment', page_path: path });
    }
  }
}

// Track route changes for SPA navigation
export const trackRouteChange = (path: string) => {
  if (typeof window === 'undefined') return;

  const consent = hasAnalyticsConsent();
  const knownEmail = getKnownUserEmail();

  if (consent && typeof window.rdtTrack === 'function') {
    window.rdtTrack('PageVisit');
  }

  if (consent && typeof window.fbTrack === 'function') {
    window.fbTrack('PageView');
  }

  sendTwitterPageView(path);
  sendQuoraPageView(path);
  if (consent) {
    sendLinkedInPageView();
  }

  if (window.__TW_DEBUG__ === true) {
    console.info('[Twitter Pixel] PageView fired', { path });
  }

  if (consent && typeof window.gtag === 'function') {
    window.gtag('config', 'G-J2XXMC9VWV', {
      page_path: path,
    });
  }

  trackRouteSpecificEvents(path, { consent, knownEmail });
};

// Set up SPA route tracking listeners
export const initializeRouteTracking = () => {
  if (typeof window === 'undefined') return;

  trackRouteChange(window.location.pathname);

  ['pushState', 'replaceState'].forEach((method) => {
    const original = history[method as keyof History] as (...args: unknown[]) => unknown;
    (history as any)[method] = function patchedHistoryMethod(this: History, ...args: unknown[]) {
      const result = original.apply(this, args);
      setTimeout(() => {
        trackRouteChange(window.location.pathname);
      }, 0);
      return result;
    };
  });

  window.addEventListener('popstate', () => {
    trackRouteChange(window.location.pathname);
  });

  setTimeout(logAnalyticsSummary, 0);

  if (window.__TW_DEBUG__ === true) {
    console.log('✅ SPA route tracking initialized');
  }
};

declare global {
  interface Window {
    __consent?: { analytics?: boolean };
    __knownUser?: { email?: string };
    rdtTrack?: (eventName: string, props?: Record<string, unknown>) => void;
    fbTrack?: (eventName: string, props?: Record<string, unknown>) => void;
    gtag?: (...args: unknown[]) => void;
  }
}