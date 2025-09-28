import { trackCTAClick } from './plausible-analytics';

interface CTATrackerOptions {
  section?: string;
  autoTrack?: boolean;
  selectors?: {
    startAssessment?: string;
    subscribe?: string;
    share?: string;
    contact?: string;
  };
}

class CTATracker {
  private section?: string;
  private selectors: Required<CTATrackerOptions['selectors']>;
  private isTracking = false;

  constructor(options: CTATrackerOptions = {}) {
    this.section = options.section;
    this.selectors = {
      startAssessment: '[data-cta="start-assessment"], .cta-start, .start-assessment, .btn-start',
      subscribe: '[data-cta="subscribe"], .cta-subscribe, .subscribe-btn, .newsletter-signup',
      share: '[data-cta="share"], .cta-share, .share-btn, .share-link',
      contact: '[data-cta="contact"], .cta-contact, .contact-btn, .contact-form',
      ...options.selectors
    };

    if (options.autoTrack !== false) {
      this.start();
    }
  }

  start() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    document.addEventListener('click', this.handleClick);
  }

  stop() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    document.removeEventListener('click', this.handleClick);
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Find the closest matching element
    const element = target.closest(Object.values(this.selectors).join(', ')) as HTMLElement;
    if (!element) return;

    const ctaId = element.getAttribute('data-cta-id') || 
                  element.id || 
                  element.className.replace(/\s+/g, '_');

    // Determine CTA type based on selectors
    if (element.matches(this.selectors.startAssessment)) {
      trackCTAClick('StartAssessment', ctaId, this.section, {
        source_type: this.getSourceType(),
        element_type: element.tagName.toLowerCase(),
        element_text: element.textContent?.trim().substring(0, 50)
      });
    } else if (element.matches(this.selectors.subscribe)) {
      trackCTAClick('Subscribe', ctaId, this.section, {
        source_type: this.getSourceType(),
        element_type: element.tagName.toLowerCase()
      });
    } else if (element.matches(this.selectors.share)) {
      trackCTAClick('Share', ctaId, this.section, {
        source_type: this.getSourceType(),
        element_type: element.tagName.toLowerCase()
      });
    } else if (element.matches(this.selectors.contact)) {
      trackCTAClick('Contact', ctaId, this.section, {
        source_type: this.getSourceType(),
        element_type: element.tagName.toLowerCase()
      });
    }
  };

  private getSourceType(): string {
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source');
    const utm_medium = params.get('utm_medium');
    
    if (utm_medium === 'email') return 'email';
    if (utm_medium === 'social') return 'social';
    if (utm_medium === 'cpc' || utm_medium === 'paid') return 'paid';
    if (document.referrer && !document.referrer.includes(window.location.hostname)) return 'referral';
    if (utm_source || utm_medium) return 'organic';
    
    return 'direct';
  }

  // Manual tracking methods
  trackStartAssessment(ctaId?: string, props?: Record<string, any>) {
    trackCTAClick('StartAssessment', ctaId, this.section, {
      source_type: this.getSourceType(),
      ...props
    });
  }

  trackSubscribe(ctaId?: string, props?: Record<string, any>) {
    trackCTAClick('Subscribe', ctaId, this.section, {
      source_type: this.getSourceType(),
      ...props
    });
  }

  trackShare(ctaId?: string, props?: Record<string, any>) {
    trackCTAClick('Share', ctaId, this.section, {
      source_type: this.getSourceType(),
      ...props
    });
  }

  trackContact(ctaId?: string, props?: Record<string, any>) {
    trackCTAClick('Contact', ctaId, this.section, {
      source_type: this.getSourceType(),
      ...props
    });
  }
}

// Global instance for easy access
let globalCTATracker: CTATracker | null = null;

export function initCTATracking(options: CTATrackerOptions = {}): CTATracker {
  if (globalCTATracker) {
    globalCTATracker.stop();
  }
  
  globalCTATracker = new CTATracker(options);
  return globalCTATracker;
}

export function getCTATracker(): CTATracker | null {
  return globalCTATracker;
}

// Convenience functions for manual tracking
export function trackStartAssessmentCTA(ctaId?: string, section?: string, props?: Record<string, any>) {
  trackCTAClick('StartAssessment', ctaId, section, {
    source_type: getSourceType(),
    ...props
  });
}

export function trackSubscribeCTA(ctaId?: string, section?: string, props?: Record<string, any>) {
  trackCTAClick('Subscribe', ctaId, section, {
    source_type: getSourceType(),
    ...props
  });
}

export function trackShareCTA(ctaId?: string, section?: string, props?: Record<string, any>) {
  trackCTAClick('Share', ctaId, section, {
    source_type: getSourceType(),
    ...props
  });
}

export function trackContactCTA(ctaId?: string, section?: string, props?: Record<string, any>) {
  trackCTAClick('Contact', ctaId, section, {
    source_type: getSourceType(),
    ...props
  });
}

function getSourceType(): string {
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  
  if (utm_medium === 'email') return 'email';
  if (utm_medium === 'social') return 'social';
  if (utm_medium === 'cpc' || utm_medium === 'paid') return 'paid';
  if (document.referrer && !document.referrer.includes(window.location.hostname)) return 'referral';
  if (utm_source || utm_medium) return 'organic';
  
  return 'direct';
}

export { CTATracker };