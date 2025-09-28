// Google Analytics tracking utility
import { sendLinkedInLead, sendLinkedInPurchase, sendLinkedInSignupEvent } from './linkedin/track';
import { sendQuoraEvent } from './quora/events';
import { sendTwitterEvent } from './twitter/events';
import {
  buildFacebookDpaPayload,
  getRememberedFacebookDpaPayload,
  mergePurchaseDetails,
  rememberFacebookDpaPayload,
  type FacebookProduct,
} from './facebook';
import { initPlausible, trackPlausibleEvent, trackContentView, trackCTAClick } from './plausible-analytics';
import { initScrollTracking } from './scroll-tracker';
import { initCTATracking } from './cta-tracker';

// Environment flag for preview mode
const IS_PREVIEW = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovableproject.com') || 
   window.location.hostname === 'localhost');

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    rdt: (...args: unknown[]) => void;
    rdtTrack: (eventName: string, props?: Record<string, unknown>) => void;
    rdtSetUser: (props: { email?: string }) => void;
    fbq: (...args: unknown[]) => void;
    fbTrack: (eventName: string, props?: Record<string, unknown>) => void;
    fbSetUser: (props: { email?: string }) => void;
    __consent?: { analytics?: boolean };
    __knownUser?: { email?: string };
  }
}

function getAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const consent = window.__consent;
    return Boolean(consent && typeof consent === 'object' && consent.analytics === true);
  } catch (_) {
    return false;
  }
}

function getKnownEmail(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const candidate = window.__knownUser;
  if (candidate && typeof candidate.email === 'string' && candidate.email.trim().length > 0) {
    return candidate.email.trim();
  }
  return undefined;
}

// Initialize analytics with enhanced Plausible tracking
export function initAnalytics() {
  // Initialize Plausible Analytics
  initPlausible();
  
  // Initialize automatic tracking
  if (typeof window !== 'undefined') {
    // Auto-track CTAs globally
    initCTATracking({ autoTrack: true });
    
    // Auto-track scroll depth based on current page
    const path = window.location.pathname;
    const section = getSectionFromPath(path);
    
    if (['signals', 'dimensionality', 'blocks'].includes(section)) {
      initScrollTracking({ section });
    }
  }
  
  console.log('Analytics initialized with enhanced Plausible tracking');
}

// Helper to determine section from URL path
function getSectionFromPath(path: string): string {
  if (path.includes('/signals')) return 'signals';
  if (path.includes('/dimensionality')) return 'dimensionality';
  if (path.includes('/blocks')) return 'blocks';
  if (path.includes('/core-alignments')) return 'core-alignments';
  if (path.includes('/how-it-works')) return 'how-it-works';
  if (path.includes('/real-time-type')) return 'real-time-type';
  if (path.includes('/profiles')) return 'profiles';
  if (path.includes('/roadmap')) return 'roadmap';
  if (path.includes('/typing-lab')) return 'typing-lab';
  return 'unknown';
}

// Enhanced page view tracking with content view goals
export function trackPageView(path: string) {
  const section = getSectionFromPath(path);
  
  // Track basic page view
  trackEvent('page_view', 'Navigation', path);
  
  // Track content view goals for specific sections
  if (section !== 'unknown') {
    trackContentView(section, {
      source_type: getTrafficSource()
    });
  }
}

// Get traffic source for enhanced tracking
function getTrafficSource(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const params = new URLSearchParams(window.location.search);
  const utm_medium = params.get('utm_medium');
  const utm_source = params.get('utm_source');
  
  if (utm_medium === 'email') return 'email';
  if (utm_medium === 'social') return 'social';
  if (utm_medium === 'cpc' || utm_medium === 'paid') return 'paid';
  if (document.referrer && !document.referrer.includes(window.location.hostname)) return 'referral';
  if (utm_source || utm_medium) return 'organic';
  
  return 'direct';
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (IS_PREVIEW) return;
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Lead tracking for marketing funnels
export const trackLead = (email?: string, metadata: Record<string, any> = {}) => {
  if (IS_PREVIEW) return;
  trackEvent('lead', 'marketing');

  if (typeof window !== 'undefined') {
    const w = window as any;
    const consentGranted = getAnalyticsConsent();

    if (email) {
      if (w.rdtSetUser) w.rdtSetUser({ email });
      if (w.fbSetUser) w.fbSetUser({ email });
    }

    // Reddit tracking
    if (w.rdtTrack) w.rdtTrack('Lead', { email, ...metadata });
    // Facebook tracking
    if (w.fbTrack) w.fbTrack('Lead', { email, ...metadata });
    // Twitter tracking
    sendTwitterEvent('Lead', {
      ...metadata,
      email_address: email,
    });
    sendQuoraEvent('GenerateLead', {
      email: email || undefined,
      ...metadata,
    });
    void sendLinkedInLead({
      email: email || getKnownEmail(),
      consentGranted,
    });
  }
};

// Assessment-specific tracking functions
export const trackAssessmentStart = (sessionId: string) => {
  if (IS_PREVIEW) return;
  trackEvent('assessment_started', 'assessment', sessionId);
  
  // Track with Plausible
  trackPlausibleEvent('Assessment Start', {
    props: { session_id: sessionId }
  });
  
  // Track Reddit Lead event for assessment start (legacy pixel method)
  if (typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('Lead', {
      content_name: 'PRISM Assessment',
      session_id: sessionId
    });
  }

  sendTwitterEvent('Lead', {
    content_name: 'PRISM Assessment',
    session_id: sessionId,
  });
  sendQuoraEvent('GenerateLead', {
    content_name: 'PRISM Assessment',
    session_id: sessionId,
  });
  void sendLinkedInLead({
    consentGranted: getAnalyticsConsent(),
    email: getKnownEmail(),
  });

  // Fire custom event for Reddit S2S tracking
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:assessment:start', {
      detail: { sessionId }
    }));
  }
};

export const trackAssessmentProgress = (questionIndex: number, totalQuestions: number, sessionId: string) => {
  if (IS_PREVIEW) return;
  const progress = Math.round((questionIndex + 1) / totalQuestions * 100);
  trackEvent('assessment_progress', 'assessment', `${progress}%_complete`, progress);
  
  // Track milestone progress
  if (progress === 25 || progress === 50 || progress === 75) {
    trackEvent(`milestone_${progress}`, 'assessment', sessionId);
  }
};

export const trackAssessmentComplete = (sessionId: string, totalQuestions: number) => {
  if (IS_PREVIEW) return;
  trackEvent('assessment_completed', 'assessment', sessionId, totalQuestions);
  
  // Track with Plausible
  trackPlausibleEvent('Assessment Complete', {
    props: { 
      session_id: sessionId,
      question_count: totalQuestions 
    }
  });
  
  // Track Reddit CompleteRegistration for 248+ question completion
  if (totalQuestions >= 248 && typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('CompleteRegistration', {
      content_name: 'PRISM Assessment Complete',
      session_id: sessionId,
      question_count: totalQuestions
    });
  }

  sendTwitterEvent('CompleteRegistration', {
    content_name: 'PRISM Assessment Complete',
    session_id: sessionId,
    question_count: totalQuestions,
  });
  sendQuoraEvent('CompleteRegistration', {
    session_id: sessionId,
    question_count: totalQuestions,
  });
  const knownEmail = getKnownEmail();
  if (knownEmail) {
    void sendLinkedInSignupEvent({
      email: knownEmail,
      consentGranted: getAnalyticsConsent(),
    });
  }

  // Fire app event that other trackers can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:assessment:complete', {
      detail: { sessionId, totalQuestions }
    }));
  }
};

export const trackAccountCreation = (email: string, sessionId?: string) => {
  if (IS_PREVIEW) return;
  trackEvent('account_created', 'user', 'from_assessment');
  trackEvent('signup_completed', 'user');
  trackLead(email);
  
  // Track Reddit SignUp event
  if (typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('SignUp', {
      email,
      source: 'assessment',
      session_id: sessionId
    });
  }

  sendTwitterEvent('SignUp', {
    email_address: email,
    source: 'assessment',
    session_id: sessionId,
  });
  sendQuoraEvent('CompleteRegistration', {
    email,
    session_id: sessionId,
  });
  void sendLinkedInSignupEvent({
    email,
    consentGranted: getAnalyticsConsent(),
  });

  // Fire app event that other trackers can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:user:signup', {
      detail: { email, sessionId }
    }));
  }
};

export const trackResultsViewed = (sessionId: string, typeCode?: string) => {
  if (IS_PREVIEW) return;
  trackEvent('results_viewed', 'assessment', typeCode || 'unknown');

  // Track with Plausible
  trackPlausibleEvent('Results Viewed', {
    props: { 
      session_id: sessionId,
      type_code: typeCode || 'unknown'
    }
  });

  // Track Reddit ViewContent for results page (legacy pixel method)
  if (typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('ViewContent', {
      content_name: 'PRISM Results',
      session_id: sessionId,
      type_code: typeCode
    });
  }

  sendTwitterEvent(
    'ContentView',
    {
      content_name: 'PRISM Results',
      session_id: sessionId,
      type_code: typeCode,
    },
    { allowOnResults: true },
  );
  sendQuoraEvent(
    'ViewContent',
    {
      content_name: 'PRISM Results',
      session_id: sessionId,
      type_code: typeCode,
    },
    { allowOnResults: true },
  );

  // Fire custom event for Reddit S2S tracking
  if (
    typeof window !== 'undefined' &&
    typeof window.dispatchEvent === 'function' &&
    typeof window.CustomEvent === 'function'
  ) {
    window.dispatchEvent(new window.CustomEvent('app:results:viewed', {
      detail: { sessionId, typeCode }
    }));
  }
};

export { sendLinkedInSignup, testLinkedInSignup } from "./linkedin/track";

export const trackPaymentSuccess = (
  value: number,
  currency: string = 'USD',
  transactionId: string,
  sessionId?: string,
  product?: FacebookProduct,
) => {
  if (IS_PREVIEW) return;
  trackEvent('purchase_completed', 'ecommerce', transactionId, value);

  // Track Reddit Purchase event
  if (typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('Purchase', {
      value,
      currency,
      transaction_id: transactionId,
      session_id: sessionId
    });
  }

  sendTwitterEvent('Purchase', {
    value,
    currency,
    transaction_id: transactionId,
    session_id: sessionId,
  });
  sendQuoraEvent('Purchase', {
    value,
    currency,
    transaction_id: transactionId,
    session_id: sessionId,
  });
  void sendLinkedInPurchase({
    value,
    currency,
    email: getKnownEmail(),
    consentGranted: getAnalyticsConsent(),
  });

  if (typeof window !== 'undefined' && window.fbTrack) {
    const metadata = { transaction_id: transactionId, session_id: sessionId };
    const basePayload = product
      ? buildFacebookDpaPayload({
          id: product.id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          quantity: product.quantity,
        })
      : getRememberedFacebookDpaPayload();

    const purchasePayload = mergePurchaseDetails(basePayload, value, currency, metadata);

    if (purchasePayload) {
      rememberFacebookDpaPayload(purchasePayload);
      window.fbTrack('Purchase', purchasePayload);
    } else {
      console.warn(
        'trackPaymentSuccess: skipped Facebook Purchase - missing dynamic ads payload',
        {
          transactionId,
          sessionId,
        },
      );
    }
  }
};