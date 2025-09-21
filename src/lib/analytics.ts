// Google Analytics tracking utility
import { IS_PREVIEW } from './env';
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

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    rdt: (...args: any[]) => void;
    rdtTrack: (eventName: string, props?: any) => string;
    rdtSetUser: (props: { email?: string }) => void;
    fbq: (...args: any[]) => void;
    fbTrack: (eventName: string, props?: any) => string;
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