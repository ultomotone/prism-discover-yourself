# SPA Tracking Audit — Quora, Twitter/X, LinkedIn, Facebook, Reddit, GA4

## Summary Table

| Vendor      | Loader Detected | Helper/Wrapper | SPA Page View | Business Events | Fixes & Notes |
|-------------|-----------------|----------------|---------------|-----------------|---------------|
| Quora       | ✓ `https://a.quora.com/qevents.js` | ✓ `qpTrack` consent-gated helper | ✓ via `trackRouteChange` | GenerateLead, AddToCart, Purchase, CompleteRegistration, Results guarded | Added config-aware lead mirroring + SPA router integration; debug hooks `?qdebug=1`, `__QW_STATUS__()`, `qpTest()` validated |
| Twitter/X   | ✓ `https://static.ads-twitter.com/uwt.js` | ✓ `twqTrack` consent guard + results gate | ✓ via `sendTwitterPageView` | Lead, AddToCart, Purchase, SignUp, Results guarded | Confirmed debug hooks `?twdebug=1`, `__twStatus()`, `twqTest()`; SPA route + event mapping repaired |
| LinkedIn    | ✓ `https://snap.licdn.com/li.lms-analytics/insight.min.js` | ✓ Config-driven helpers (`sendLinkedIn*`) | ✓ Site Page View via config + consent | Lead, Signup, Purchase, AddToCart (config opt-in) | Added conversion ID config keys + client/server bridge; CAPI guard respects consent |
| Facebook    | ✓ `https://connect.facebook.net/en_US/fbevents.js` | ✓ `fbTrack` helper | ✓ via route tracker | Lead, CompleteRegistration, Purchase, AddToCart | Route tracker mirrors key events; DPA payload preserved |
| Reddit      | ✓ `https://www.redditstatic.com/ads/pixel.js` | ✓ `rdtTrack` wrapper + CAPI bridge | ✓ via route tracker | PageVisit, Lead, SignUp, AddToCart | SPA router unified; honours consent before client pixel |
| GA4         | ✓ `gtag` + `G-J2XXMC9VWV` | N/A | ✓ `gtag('config', …)` | Page view, generate_lead, sign_up | Added route-driven page_path + milestone events |

Console summary printed once per load (see `logAnalyticsSummary`) to confirm status.

## Key Fixes Applied

1. **LinkedIn**
   - Introduced config-aware helpers (`sendLinkedInLead`, `sendLinkedInSignupEvent`, `sendLinkedInPurchase`, `sendLinkedInAddToCart`, `sendLinkedInPageView`).
   - Added consent gate + optional client pixel firing with shared conversion IDs.
   - Enabled SPA route tracking for Site Page View events.

2. **Route Tracking**
   - Centralised consent detection and SPA page view propagation for all vendors.
   - Added business event mirroring (Lead, SignUp) aligned with guard requirements (no heavy events on `/results*`).
   - Console audit table emitted for quick verification.

3. **Business Events**
   - Updated analytics helpers to broadcast LinkedIn events alongside Quora/Twitter/Facebook/Reddit.
   - Extended booking CTA (`ServiceCard`) to send AddToCart events to Twitter, LinkedIn, Reddit, Quora, Facebook.

4. **Configuration**
   - `index.html` defaults include LinkedIn conversion ID keys (override via `window.__APP_CONFIG__`).
   - Removed legacy LinkedIn route watcher to prevent duplicate events.

5. **Documentation & QA**
   - Added this audit report with QA checklist, CSP domains, debug references, and rollback guidance.

## QA Checklist

1. **Consent Gate**
   - With consent denied (`window.__consent.analytics = false`), trigger SPA navigation and CTA clicks → no pixel network calls.
   - Grant consent (`window.__consent.analytics = true`) and repeat → all vendors fire according to table.

2. **Page Views**
   - Load any route → Network tab should show requests:
     - Quora `q.quora.com/_/ad/...`
     - Twitter `i/adsct`, `t.co/i/adsct`
     - LinkedIn `px.ads.linkedin.com/collect`
     - Facebook `/tr?`
     - Reddit `events.reddit.com`
     - GA4 `/g/collect`

3. **SPA Navigation**
   - Navigate between SPA routes (`/`, `/assessment`, `/pricing`, etc.). Observe console table once and confirm each navigation emits page view events per vendor.

4. **Business Events**
   - Assessment start (`/assessment`) → Lead events recorded across Quora/Twitter/Facebook/Reddit/LinkedIn/GA4.
   - Click “Book” CTA on pricing cards → AddToCart events for all vendors, LinkedIn helper resolves conversion ID via config.
   - Complete assessment → CompleteRegistration/SignUp events for Quora/Twitter/Facebook/LinkedIn/Reddit; GA4 custom event.
   - Successful purchase flow → Purchase events include `value` + `currency`, LinkedIn CAPI logs 2xx with `requestId`.
   - Results route (`/results*`) → only page views fire; heavy conversions remain suppressed unless `__allowResults` is set.

5. **Debug Hooks**
   - `?qdebug=1` → console emits Quora diagnostics, `__QW_STATUS__()` & `qpTest()` return payload.
   - `?twdebug=1` → console logs Twitter debug, `__twStatus()` & `twqTest()` available.
   - `window.liTest('<conversion>', '[email protected]')` exercises LinkedIn CAPI smoke.

6. **LinkedIn Config Validation**
   - Ensure `window.__APP_CONFIG__` defines:
     - `LINKEDIN_SITE_PAGE_VIEW_ID`
     - `LINKEDIN_LEAD_CONVERSION_ID`
     - `LINKEDIN_SIGNUP_CONVERSION_ID`
     - `LINKEDIN_PURCHASE_CONVERSION_ID`
     - `LINKEDIN_ADD_TO_CART_CONVERSION_ID`
   - Defaults are `null`; override via deployment environment or inline config before boot.

## CSP Requirements

Ensure server CSP allowlists include the following for `script-src`, `img-src`, and `connect-src` as appropriate:

- `a.quora.com`
- `q.quora.com`
- `static.ads-twitter.com`
- `t.co`
- `analytics.twitter.com`
- `snap.licdn.com`
- `px.ads.linkedin.com`
- `connect.facebook.net`
- `www.facebook.com`
- `www.redditstatic.com`
- `events.reddit.com`
- `www.google-analytics.com`

## Consent & Results Guarding

- All helper wrappers short-circuit when `window.__consent.analytics !== true`.
- `/results*` routes fire page views only; additional conversions require explicit `__allowResults` flag.

## Debug Flags

- Quora: `?qdebug=1`, functions `__QW_STATUS__()`, `qpTest()`.
- Twitter/X: `?twdebug=1`, functions `__twStatus()`, `twqTest()`.
- LinkedIn: `window.liTest(conversionId, email)` for CAPI smoke; console table summarises vendor status on load.

## Rollback Plan

1. Revert commits touching analytics via `git revert <commit>` or `git checkout HEAD^ -- index.html src/lib ...`.
2. Remove LinkedIn config keys from `index.html` if not required.
3. Restore previous `route-tracking.ts`, `analytics.ts`, and `ServiceCard.tsx` implementations.
4. Re-run `npm run lint && npm test` to confirm green state before redeploying.

