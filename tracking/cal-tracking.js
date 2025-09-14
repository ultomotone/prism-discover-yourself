/*
 * Cal booking tracking utility.
 * Replace PIXELS ids/labels with your own.
 * To test Meta events use Events Manager > Test Events.
 */

const PIXELS = {
  META_PIXEL_ID: 'YOUR_META_PIXEL_ID', // TODO: paste Meta Pixel ID
  REDDIT_PIXEL_ID: 'YOUR_REDDIT_PIXEL_ID', // TODO: paste Reddit Pixel ID
  TIKTOK_PIXEL_ID: 'YOUR_TIKTOK_PIXEL_ID', // TODO: paste TikTok Pixel ID
  GOOGLE: {
    ID: 'AW-XXXXXXX', // TODO: Google Ads ID
    PURCHASE_LABEL: 'abcdEFghijk', // TODO: purchase label
    LEAD_LABEL: 'lmnoPQrsTU', // TODO: lead label
  },
  LINKEDIN: {
    PURCHASE_ID: 1234567, // TODO: LinkedIn purchase conversion ID
    LEAD_ID: 2345678, // TODO: LinkedIn lead conversion ID
  },
};

const UTM_KEY = 'cal_utms';
const SENT_KEY = 'cal_sent_events';
const sentEventIds = new Set(
  (() => {
    try {
      return JSON.parse(sessionStorage.getItem(SENT_KEY) || '[]');
    } catch {
      return [];
    }
  })()
);

function persistSent() {
  sessionStorage.setItem(SENT_KEY, JSON.stringify(Array.from(sentEventIds)));
}

function wasSent(id) {
  return sentEventIds.has(id);
}

function markSent(id) {
  sentEventIds.add(id);
  persistSent();
}

function consentGranted() {
  return window.__consent?.analytics === true;
}

function uuid() {
  return crypto.randomUUID();
}

function getUTMs() {
  try {
    return JSON.parse(localStorage.getItem(UTM_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUTMs() {
  const params = new URLSearchParams(window.location.search);
  const current = getUTMs();
  let changed = false;
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ttclid', 'ttp'].forEach((k) => {
    const v = params.get(k);
    if (v) {
      current[k] = v;
      changed = true;
    }
  });
  if (document.referrer) {
    current.referrer = document.referrer;
    changed = true;
  }
  if (changed) {
    localStorage.setItem(UTM_KEY, JSON.stringify(current));
  }
  return current;
}

async function hashPII(email) {
  const data = new TextEncoder().encode(email.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function postTikTokEvent(body) {
  if (window.TRACK_TEST) {
    console.log('TRACK_TEST server', body);
    return;
  }
  try {
    await fetch('/functions/v1/tiktok-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    /* swallow */
  }
}

function fireAllNetworks({ type, value, currency, name, eventID }) {
  if (!consentGranted()) return;
  if (window.TRACK_TEST) {
    console.log('TRACK_TEST fire', { type, value, currency, name, eventID });
    return;
  }

  const payload = {
    value,
    currency,
    content_name: name,
    eventID,
  };

  if (type === 'purchase') {
    if (window.fbq) window.fbq('track', 'Purchase', payload);
    if (window.rdt) window.rdt('track', 'Purchase', payload);
    if (window.ttq) window.ttq.track('CompletePayment', payload);
    if (window.gtag)
      window.gtag('event', 'purchase', {
        send_to: `${PIXELS.GOOGLE.ID}/${PIXELS.GOOGLE.PURCHASE_LABEL}`,
        value,
        currency,
      });
    if (window.lintrk)
      window.lintrk('track', { conversion_id: PIXELS.LINKEDIN.PURCHASE_ID });
  } else if (type === 'schedule') {
    if (window.fbq) window.fbq('track', 'Schedule', payload);
    if (window.rdt) window.rdt('track', 'Lead', payload);
    if (window.ttq) window.ttq.track('Contact', payload);
    if (window.gtag)
      window.gtag('event', 'generate_lead', {
        send_to: `${PIXELS.GOOGLE.ID}/${PIXELS.GOOGLE.LEAD_LABEL}`,
        value,
        currency,
      });
    if (window.lintrk)
      window.lintrk('track', { conversion_id: PIXELS.LINKEDIN.LEAD_ID });
  } else if (type === 'lead') {
    if (window.fbq) {
      window.fbq('track', 'Lead', payload);
      window.fbq('track', 'InitiateCheckout', payload);
    }
    if (window.rdt) window.rdt('track', 'Lead', payload);
    if (window.ttq) window.ttq.track('Lead', payload);
    if (window.gtag)
      window.gtag('event', 'generate_lead', {
        send_to: `${PIXELS.GOOGLE.ID}/${PIXELS.GOOGLE.LEAD_LABEL}`,
        value,
        currency,
      });
    if (window.lintrk)
      window.lintrk('track', { conversion_id: PIXELS.LINKEDIN.LEAD_ID });
  }
}

async function sendServerSide({ type, value, currency, name, eventID, email }) {
  const utms = getUTMs();
  const user = {};
  if (email) {
    const hashedEmail = await hashPII(email);
    user.email = hashedEmail;
    if (window.ttq && consentGranted()) {
      window.ttq.identify({ email: hashedEmail });
    }
  }
  if (window.__ip) user.ip = window.__ip;
  user.user_agent = navigator.userAgent;
  if (utms.ttclid) user.ttclid = utms.ttclid;
  if (utms.ttp) user.ttp = utms.ttp;
  const properties = { value, currency, content_name: name };
  const event =
    type === 'purchase' ? 'CompletePayment' : type === 'lead' ? 'Lead' : 'Contact';
  const body = { event, event_id: eventID, properties, user };
  await postTikTokEvent(body);
}

async function trackTikTokEvent(
  event,
  properties = {},
  { email, phone, external_id } = {},
) {
  if (!consentGranted() || !window.ttq) return;
  const eventID = uuid();
  const utms = getUTMs();
  const identify = {};
  const user = { user_agent: navigator.userAgent };
  if (window.__ip) user.ip = window.__ip;
  if (utms.ttclid) user.ttclid = utms.ttclid;
  if (utms.ttp) user.ttp = utms.ttp;
  if (email) {
    const h = await hashPII(email);
    identify.email = h;
    user.email = h;
  }
  if (phone) {
    const h = await hashPII(phone);
    identify.phone_number = h;
    user.phone = h;
  }
  if (external_id) {
    const h = await hashPII(external_id);
    identify.external_id = h;
    user.external_id = h;
  }
  if (Object.keys(identify).length) {
    window.ttq.identify(identify);
  }
  window.ttq.track(event, { ...properties, event_id: eventID });
  await postTikTokEvent({ event, event_id: eventID, properties, user });
  return eventID;
}

function bindCalClickTracking(
  selector = '[data-cal-link], .cal-link, a[href*="cal.com/"]'
) {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const el = target.closest(selector);
    if (!el) return;
    const name = el.dataset.contentName || el.textContent?.trim() || 'Cal Link';
    const eventID = uuid();
    if (wasSent(eventID)) return;
    markSent(eventID);
    const payload = { type: 'lead', name, eventID };
    fireAllNetworks(payload);
    sendServerSide(payload);
  });
}

function listenForCalMessages() {
  window.addEventListener('message', (e) => {
    let data = e.data;
    if (!data) return;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return;
      }
    }
    const evt = data.event;
    if (
      ![
        'cal:booking:successful',
        'cal:booking:created',
        'cal:booking:completed',
      ].includes(evt)
    )
      return;
    const payload = data.payload || {};
    const { bookingId, title, price, currency, email } = payload;
    const eventID = bookingId || uuid();
    if (wasSent(eventID)) return;
    markSent(eventID);
    const type = price ? 'purchase' : 'schedule';
    const value = price || 0;
    const name = title || 'Cal Booking';
    const evtPayload = { type, value, currency, name, eventID };
    fireAllNetworks(evtPayload);
    sendServerSide({ ...evtPayload, email });
  });
}

function init() {
  saveUTMs();
  trackTikTokEvent('ViewContent', {
    content_name: document.title || 'Page',
    url: window.location.href,
  });
  bindCalClickTracking();
  listenForCalMessages();
}

export {
  init,
  fireAllNetworks,
  sendServerSide,
  getUTMs,
  saveUTMs,
  consentGranted,
  uuid,
  hashPII,
  trackTikTokEvent,
  bindCalClickTracking,
  listenForCalMessages,
  wasSent,
  markSent,
};

export default {
  init,
  fireAllNetworks,
  sendServerSide,
  uuid,
  wasSent,
  markSent,
  trackTikTokEvent,
};
