# Reddit Ads Event Tracking Implementation

This document outlines the Reddit Pixel and Conversion API (CAPI) tracking implementation for the PRISM assessment application.

## Overview

The implementation tracks key user actions and assessment milestones through Reddit's advertising platform using both client-side pixel tracking and server-side conversion API calls.

## Configuration

### Environment Variables

Set the following environment variables:

```bash
# Required: Reddit Pixel ID for client-side tracking
REDDIT_PIXEL_ID=a2_hisg7r10d2ta

# Optional: For future server-side conversions API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REDIRECT_URI=your_redirect_uri
```

### Current Implementation

- **Client-side**: Reddit Pixel loads automatically and tracks events via `window.rdt`
- **Server-side**: Events are also sent to the `reddit-capi` Edge Function for CAPI tracking
- **Environment**: Pixel ID is configurable via `window.__APP_CONFIG__.REDDIT_PIXEL_ID`

## Event Mapping

The following app events are automatically tracked to Reddit:

| App Event | Reddit Event | Trigger | Additional Data |
|-----------|--------------|---------|-----------------|
| Assessment Started | `Lead` | User begins PRISM assessment | `session_id`, `content_name: "PRISM Assessment"` |
| 248+ Questions Complete | `CompleteRegistration` | User completes full assessment (≥248 questions) | `session_id`, `question_count`, `content_name: "PRISM Assessment Complete"` |
| Results Viewed | `ViewContent` | User views assessment results | `session_id`, `type_code`, `content_name: "PRISM Results"` |
| Account Created | `SignUp` | User creates account during/after assessment | `email`, `session_id`, `source: "assessment"` |
| Payment Success | `Purchase` | User completes payment transaction | `value`, `currency`, `transaction_id`, `session_id` |

## Implementation Details

### Client-Side Tracking

The Reddit pixel is initialized in `index.html`:

```javascript
// Pixel loads and initializes
rdt('init', redditPixelId);

// Events are tracked via window.rdtTrack wrapper
window.rdtTrack('Lead', { content_name: 'PRISM Assessment' });
```

### Server-Side Tracking (CAPI)

Events are also sent to the `reddit-capi` Edge Function:

```javascript
// Automatic CAPI call for each pixel event
fetch('/functions/v1/reddit-capi', {
  method: 'POST',
  body: JSON.stringify({
    event_name: 'Lead',
    conversion_id: 'uuid',
    click_id: 'optional_click_id',
    email: 'hashed_email_if_available'
  })
});
```

### SPA Route Tracking

- `PageVisit` events fire on:
  - Initial page load
  - SPA route changes (pushState/replaceState/popstate)
- Additional context events fire based on route patterns:
  - `/assessment` → `ViewContent` (Assessment)
  - `/results/*` → Custom assessment complete tracking
  - Signup completion paths → `SignUp`

### Tracking Functions

Main tracking functions in `src/lib/analytics.ts`:

```javascript
// These automatically include Reddit tracking
trackAssessmentStart(sessionId)      // → Reddit 'Lead'
trackAssessmentComplete(sessionId)   // → Reddit 'CompleteRegistration' (if ≥248Q)
trackResultsViewed(sessionId, type)  // → Reddit 'ViewContent'
trackAccountCreation(email, session) // → Reddit 'SignUp'
trackPaymentSuccess(value, currency, txId, session) // → Reddit 'Purchase'
```

## Testing

### Client-Side Testing

1. **Network Tab**: Look for requests to:
   - `https://www.redditstatic.com/ads/pixel.js` (pixel script load)
   - Reddit event beacons (pixel firing)

2. **Console**: Check for Reddit tracking logs and any error messages

3. **Browser Events**: 
   - Navigate between pages → should see `PageVisit` events
   - Start assessment → should see `Lead` event
   - Complete assessment → should see `CompleteRegistration` event
   - View results → should see `ViewContent` event

### Server-Side Testing

1. **Edge Function Logs**: Check `reddit-capi` function logs in Supabase dashboard
2. **Network Tab**: Look for POST requests to `/functions/v1/reddit-capi`
3. **CAPI Events**: Events should appear in Reddit Ads Manager (with delay)

### Reddit Ads Manager

Events will appear in Reddit Ads Manager under:
- **Events Manager** → **Conversion Events**
- **Campaigns** → **Conversion Tracking**

Note: There may be a delay of several hours before events appear in Reddit's interface.

## Error Handling

The implementation includes robust error handling:

- **Client-side**: All tracking calls are wrapped in try-catch blocks
- **Guards**: Events only fire if `window.rdt` is available
- **Fallbacks**: If CAPI fails, pixel tracking continues
- **Non-blocking**: Tracking failures never break app functionality

## Privacy & Compliance

- Email addresses are hashed using Reddit's normalization before transmission
- Click IDs are captured and persisted for attribution
- Users can opt-out of tracking via browser settings
- GDPR/CCPA compliance maintained through existing privacy controls

## OAuth App Setup (Future)

For advanced CAPI features, set up a Reddit app:

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create a new app (web app type)
3. Note the client ID and secret for environment variables
4. Set redirect URI for OAuth flow

This enables:
- Conversion lift studies
- Advanced attribution models
- Audience creation for remarketing

## Troubleshooting

### Common Issues

1. **Events not firing**: Check that `window.rdt` exists and pixel loaded successfully
2. **CAPI errors**: Check Edge Function logs and ensure secrets are configured
3. **Missing events**: Verify event mapping and check browser console for errors
4. **Attribution issues**: Ensure click IDs are captured and persisted correctly

### Debug Mode

Add `?reddit_debug=1` to URLs to enable additional logging:

```javascript
// Additional debug logging when ?reddit_debug=1
if (new URLSearchParams(location.search).get('reddit_debug')) {
  console.log('Reddit event fired:', eventName, props);
}
```