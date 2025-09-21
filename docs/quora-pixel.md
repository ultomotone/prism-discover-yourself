# Quora Pixel & Conversions API Integration

## Overview
- Consent-gated Quora Pixel initialised from `index.html` via `qpTrack` helper.
- Pixel ID sourced from runtime config (`window.__APP_CONFIG__.QUORA_PIXEL_ID`) or build env (`VITE_QUORA_PIXEL_ID`).
- SPA-aware page view tracking pipes through `src/lib/route-tracking.ts` and `sendQuoraPageView` to keep URLs accurate.
- Business events wired from `src/lib/analytics.ts`, `src/components/ServiceCard.tsx`, and `src/components/CalEmbed.tsx`.
- Optional Conversions API edge function lives at `supabase/functions/quora-capi` and reuses client `conversion_id` values for dedupe.

## Event Matrix
| Event | Trigger | Key Props |
| --- | --- | --- |
| `ViewContent` | SPA route change & results views | `page_path`, `content_name`, `session_id`, `type_code` |
| `GenerateLead` | Assessment start, marketing lead capture | `email`, `session_id`, `content_name` |
| `AddToCart` | Service booking CTA click | `value`, `currency`, `contents`, `content_ids` |
| `InitiateCheckout` | Booking CTA + Cal embed load | `step`, `content_id`, `slug` |
| `AddPaymentInfo` | Cal embed payment step messages | `step` |
| `Purchase` | Cal booking success, payment success flows | `value`, `currency`, `transaction_id`, `contents` |
| `CompleteRegistration` | Assessment completion & signup flows | `session_id`, `question_count`, `email` |

Results routes remain suppressed unless `allowOnResults` is passed via `sendQuoraEvent(..., { allowOnResults: true })`.

## Consent & Debugging
- Pixel initialises only when `window.__consent.analytics === true`.
- Debug mode via `?qdebug=1` enables verbose console output and exposes `window.__QW_STATUS__()` plus `window.qpTest()`.
- Helper auto-attaches `conversion_id` (UUID) and posts to `/functions/v1/quora-capi` for server dedupe when consent is granted.

## Conversions API
- Edge function expects `QUORA_TOKEN` (bearer token) and `QUORA_PIXEL_ID` env vars.
- Request payload: `{ event_name, conversion_id, value?, currency?, email?, contents?, content_ids?, event_time?, client_ip?, user_agent? }`.
- Email is normalised + SHA-256 hashed server-side via `_shared/crypto.ts`.
- Retries (3x exponential backoff) on 429 / 5xx responses, returns `{ ok, status, eventId }`.
- Pass consent using `x-consent-analytics: true` header; function returns 204 when analytics consent is denied.

## CSP Allowlist
Ensure the following origins are present in `script-src`, `img-src`, and `connect-src` as appropriate:
- `https://a.quora.com`
- `https://q.quora.com`

## QA Checklist
1. Load any page with `?qdebug=1` → console shows `[Quora] configured` once consent is granted.
2. Navigate SPA routes → verify `ViewContent` beacons include accurate `page_path`.
3. Start an assessment → `GenerateLead` fires with session metadata.
4. Click a service `Book` CTA → `AddToCart` beacon contains `contents` payload.
5. Open Cal booking flow → `InitiateCheckout` fired; proceed to payment step to see `AddPaymentInfo`.
6. Complete a booking → `Purchase` beacon includes `value`, `currency`, `transaction_id`; check Supabase logs for matching `/functions/v1/quora-capi` 2xx response with shared `conversion_id`.
7. Deny analytics consent → no Quora network activity.
8. Results pages (`/results*`) emit only `ViewContent` unless `allowOnResults` override used.

## Rollback
1. Remove Quora scripts and helper block from `index.html`.
2. Delete `src/lib/quora` utilities and references from analytics / route tracking / components.
3. Remove Quora-related tests and docs, update `tests/run-tests.mjs`.
4. Delete `supabase/functions/quora-capi` and `_shared/quoraCapi.ts` helpers.
5. Revert CSP entries if they were added solely for Quora.

