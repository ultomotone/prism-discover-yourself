# X (Twitter) Pixel Implementation

## Summary

- Loaded the X Pixel (`nwcm8`) asynchronously on every page and enabled first-party cookies via `twq('config', { use_1p: true })`.
- Added consent-aware helpers that defer configuration until `window.__consent.analytics === true`, capture/stash the `twclid` click ID, generate `conversion_id` values for deduplication, and guard heavy tracking on `/results` routes unless explicitly permitted.
- Extended SPA tracking utilities to send Twitter `PageView`, `ContentView`, `SignUp`, `Lead`, `CompleteRegistration`, and `Purchase` events in lockstep with existing Reddit/Facebook logic and our `track*` helpers.
- Documented CSP allowances, enablement steps, validation procedures, and rollback instructions.

## CSP Updates

Allow the following domains in both `img-src` and `connect-src` directives (or equivalent server config):

- `https://static.ads-twitter.com`
- `https://ads-twitter.com`
- `https://ads-api.twitter.com`
- `https://analytics.twitter.com`
- `https://t.co`

These cover the loader (`uwt.js`), pixel GIF beacons, and the analytics endpoints used by the tag.

## Consent Handling

- The helpers call `twq('config', 'nwcm8', { use_1p: true })` only after `window.__consent.analytics === true`.
- We re-check consent for up to 20 seconds, and subscribe to `consent:updated`, `app:consent:updated`, and `consentchange` events to configure immediately when the CMP toggles analytics on.
- All event dispatches are funneled through `window.twqTrack`, which exits early if consent was not granted or the pixel is not yet configured.

## SPA Behaviour & Results Page Protection

- `sendTwitterPageView` mirrors the existing history listeners and fires on initial load, `pushState`, `replaceState`, and `popstate` navigations.
- Non-essential events are suppressed on URLs matching `/results` unless the caller opts in via `allowOnResults`. Only the explicit results view event and page views set that flag, preventing accidental heavy tracking on the results page.

## Event Mapping

| Event Name            | Trigger / Condition                                                | Parameters (source)                                                                                                                                             | Excluded Pages |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `PageView`            | Every SPA navigation (initial load + history changes)              | `page_path` (current `window.location.pathname`)                                                                                                               | No             |
| `Lead`                | `trackLead` helper (`/assessment` start, marketing lead capture)   | `email_address` (user input), `session_id`, any metadata already passed to `trackLead`                                                                         | `/results*` unless explicitly invoked with `allowOnResults` (not used) |
| `ContentView`         | Assessment intro routes, results views via `trackResultsViewed`    | `content_name` (`'Assessment'` or `'PRISM Results'`), `session_id`, `type_code` (results only). Results path calls set `allowOnResults` to permit firing there. | Assessment intro: No; Results: Only via opt-in |
| `CompleteRegistration`| Assessment completion (`trackAssessmentComplete`)                  | `content_name`, `session_id`, `question_count`                                                                                                                 | No             |
| `SignUp`              | Account completion routes + `trackAccountCreation` helper          | `email_address`, `source` (`'assessment'`), `session_id`                                                                                                       | No             |
| `Purchase`            | `trackPaymentSuccess` helper                                       | `value`, `currency`, `transaction_id`, `session_id`                                                                                                            | No             |

Every call flows through `sendTwitterEvent`, which attaches:

- `conversion_id` (auto-generated UUID when not provided) for CAPI deduplication.
- `twclid` from `localStorage` (populated from the query string).

## Test Plan

1. **Home / marketing pages** – Load with analytics consent granted. Verify via the Twitter Pixel Helper that the base tag, `PageView`, and `Lead` fire when submitting marketing forms that already call `trackLead`.
2. **Assessment start (`/assessment/...`)** – Confirm `Lead` + `ContentView` events trigger once when the assessment begins.
3. **Assessment completion** – Complete the required questions and confirm `CompleteRegistration` fires with `question_count` populated.
4. **Account creation** – Finish the signup flow; check for a single `SignUp` event with the captured email.
5. **Purchase / checkout confirmation** – Execute a test purchase and confirm `Purchase` fires with `value`, `currency`, and `transaction_id`.
6. **Results page (`/results/...`)** – Ensure only `PageView` and the intentional `ContentView` fire; no extra listeners or duplicate events should appear.
7. **Consent denied scenario** – Deny analytics consent in the CMP. Reload and verify that no Twitter calls are logged.
8. **Events Manager verification** – After testing, confirm Events Manager shows recent activity for the above events with correct parameters and host.

## Rollback

1. Revert `index.html` to remove the Twitter loader, helper script, and `<noscript>` fallback.
2. Delete `src/lib/twitter/events.ts`.
3. Remove Twitter-specific imports and calls from:
   - `src/lib/analytics.ts`
   - `src/lib/route-tracking.ts`
4. Run `npm run lint` and `npm test` to confirm the build is clean.
5. Deploy the revert and monitor Events Manager to ensure the pixel stops firing.

## Additional Notes

- Enable first-party cookies for Pixel `nwcm8` in X Events Manager → Pixel Settings.
- Conversion API integrations should reuse the `conversion_id` generated by the client (`window.twqTrack` return value) to avoid duplicate reporting.
- No UI mutations, blocking scripts, or persistent observers were introduced; the helpers rely on lightweight checks and listeners that exit once configured.
