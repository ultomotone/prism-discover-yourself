// Reddit Pixel & CAPI tracking utility
declare global {
  interface Window {
    rdt: (...args: any[]) => void;
    rdtTrack: (eventName: string, props?: any) => string;
    rdtSetUser: (props: { email?: string }) => void;
    redditNormalizeEmail: (email: string) => string;
    __lastConversionId: string;
    __supabaseFunctionFetch: (path: string, init: RequestInit) => Promise<Response>;
  }
}

export interface RedditEventProps {
  conversion_id?: string;
  click_id?: string;
  email?: string;
  content_name?: string;
  custom_event_name?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  [key: string]: any;
}

// Reddit event tracking utility - handles both pixel and CAPI
export const trackRedditEvent = (eventName: string, props: RedditEventProps = {}) => {
  if (typeof window === 'undefined') return;

  try {
    // Track via Reddit pixel if available
    if (window.rdtTrack) {
      return window.rdtTrack(eventName, props);
    }
    
    // Fallback: direct pixel call if rdtTrack not available
    if (window.rdt) {
      const enrichedProps = {
        conversion_id: generateConversionId(),
        ...props
      };
      window.rdt('track', eventName, enrichedProps);
      return enrichedProps.conversion_id;
    }
  } catch (error) {
    console.warn('Reddit tracking error (non-blocking):', error);
  }
};

// Set user data for advanced matching
export const setRedditUser = (props: { email?: string }) => {
  if (typeof window === 'undefined') return;

  try {
    if (window.rdtSetUser) {
      window.rdtSetUser(props);
    }
  } catch (error) {
    console.warn('Reddit user setting error (non-blocking):', error);
  }
};

// Generate unique conversion ID
const generateConversionId = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Specific event tracking functions matching the required milestones
export const trackRedditLead = (email?: string, metadata: Record<string, any> = {}) => {
  const props: RedditEventProps = { ...metadata };
  if (email) {
    props.email = email;
    setRedditUser({ email });
  }
  return trackRedditEvent('Lead', props);
};

export const trackRedditSignUp = (email?: string, metadata: Record<string, any> = {}) => {
  const props: RedditEventProps = { ...metadata };
  if (email) {
    props.email = email;
    setRedditUser({ email });
  }
  return trackRedditEvent('SignUp', props);
};

export const trackRedditViewContent = (contentName: string, metadata: Record<string, any> = {}) => {
  return trackRedditEvent('ViewContent', {
    content_name: contentName,
    ...metadata
  });
};

export const trackRedditCompleteRegistration = (metadata: Record<string, any> = {}) => {
  return trackRedditEvent('CompleteRegistration', metadata);
};

export const trackRedditPurchase = (value: number, currency: string = 'USD', transactionId?: string, metadata: Record<string, any> = {}) => {
  return trackRedditEvent('Purchase', {
    value,
    currency,
    transaction_id: transactionId,
    ...metadata
  });
};

export const trackRedditCustom = (customEventName: string, metadata: Record<string, any> = {}) => {
  return trackRedditEvent('Custom', {
    custom_event_name: customEventName,
    ...metadata
  });
};

// Assessment-specific Reddit tracking
export const trackRedditAssessmentStart = (sessionId: string) => {
  return trackRedditLead(undefined, { 
    content_name: 'PRISM Assessment',
    session_id: sessionId
  });
};

export const trackRedditAssessmentComplete = (sessionId: string, questionCount: number = 248) => {
  return trackRedditCompleteRegistration({ 
    content_name: 'PRISM Assessment Complete',
    session_id: sessionId,
    question_count: questionCount
  });
};

export const trackRedditResultsView = (sessionId: string, typeCode?: string) => {
  return trackRedditViewContent('PRISM Results', {
    session_id: sessionId,
    type_code: typeCode
  });
};

export const trackRedditAccountCreated = (email: string, sessionId?: string) => {
  return trackRedditSignUp(email, {
    source: 'assessment',
    session_id: sessionId
  });
};

export const trackRedditPaymentSuccess = (value: number, currency: string = 'USD', transactionId: string, sessionId?: string) => {
  return trackRedditPurchase(value, currency, transactionId, {
    session_id: sessionId
  });
};