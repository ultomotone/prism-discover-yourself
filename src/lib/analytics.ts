// Google Analytics tracking utility
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    rdt: (...args: any[]) => void;
    rdtTrack: (eventName: string, props?: any) => string;
    rdtSetUser: (props: { email?: string }) => void;
    fbq: (...args: any[]) => void;
    fbTrack: (eventName: string, props?: any) => string;
    fbSetUser: (props: { email?: string }) => void;
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
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
  trackEvent('lead', 'marketing');

  if (typeof window !== 'undefined') {
    const w = window as any;

    if (email) {
      if (w.rdtSetUser) w.rdtSetUser({ email });
      if (w.fbSetUser) w.fbSetUser({ email });
    }

    // Reddit tracking
    if (w.rdtTrack) w.rdtTrack('Lead', { email, ...metadata });
    // Facebook tracking
    if (w.fbTrack) w.fbTrack('Lead', { email, ...metadata });
  }
};

// Assessment-specific tracking functions
export const trackAssessmentStart = (sessionId: string) => {
  trackEvent('assessment_started', 'assessment', sessionId);
  
  // Track Reddit Lead event for assessment start (legacy pixel method)
  if (typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('Lead', { 
      content_name: 'PRISM Assessment',
      session_id: sessionId
    });
  }
  
  // Fire custom event for Reddit S2S tracking
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:assessment:start', { 
      detail: { sessionId }
    }));
  }
};

export const trackAssessmentProgress = (questionIndex: number, totalQuestions: number, sessionId: string) => {
  const progress = Math.round((questionIndex + 1) / totalQuestions * 100);
  trackEvent('assessment_progress', 'assessment', `${progress}%_complete`, progress);
  
  // Track milestone progress
  if (progress === 25 || progress === 50 || progress === 75) {
    trackEvent(`milestone_${progress}`, 'assessment', sessionId);
  }
};

export const trackAssessmentComplete = (sessionId: string, totalQuestions: number) => {
  trackEvent('assessment_completed', 'assessment', sessionId, totalQuestions);
  
  // Track Reddit CompleteRegistration for 248+ question completion
  if (totalQuestions >= 248 && typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('CompleteRegistration', {
      content_name: 'PRISM Assessment Complete',
      session_id: sessionId,
      question_count: totalQuestions
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

  // Fire app event that other trackers can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:user:signup', { 
      detail: { email, sessionId }
    }));
  }
};

export const trackResultsViewed = (sessionId: string, typeCode?: string) => {
  trackEvent('results_viewed', 'assessment', typeCode || 'unknown');
  
  // Track Reddit ViewContent for results page (legacy pixel method)
  if (typeof window !== 'undefined' && window.rdtTrack) {
    window.rdtTrack('ViewContent', {
      content_name: 'PRISM Results',
      session_id: sessionId,
      type_code: typeCode
    });
  }
  
  // Fire custom event for Reddit S2S tracking
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:results:viewed', { 
      detail: { sessionId, typeCode }
    }));
  }
};

export const trackPaymentSuccess = (value: number, currency: string = 'USD', transactionId: string, sessionId?: string) => {
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
};