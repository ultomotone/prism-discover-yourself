# Reddit Pixel + Conversions API Implementation

Complete implementation of Reddit's advertising pixel (client-side) and Conversions API (server-to-server) for full-funnel tracking with PII hashing and attribution.

## Architecture Overview

```
Browser (Client)              Edge Function (Server)           Reddit API
┌─────────────────┐          ┌─────────────────────┐          ┌──────────────┐
│ Reddit Pixel    │          │ reddit-conversions  │          │ Conversions  │
│ + Client Utils  │ ────────▶│ OAuth + PII Hash   │ ────────▶│ API          │
│ (No raw PII)    │          │ + Attribution      │          │ (ads-api.*)  │
└─────────────────┘          └─────────────────────┘          └──────────────┘
```

## Required Secrets

These secrets must be configured in Supabase Edge Functions settings:

```bash
REDDIT_PIXEL_ID=rp_xxxxxxxxxxxxx        # Reddit Pixel ID  
REDDIT_APP_ID=xxxxxxxxxxxxxxxx          # OAuth2 Client ID
REDDIT_CLIENT_SECRET=xxxxxxxxxxxx       # OAuth2 Client Secret
REDDIT_AD_ACCOUNT_ID=act_XXXXXXXX       # Ad Account ID
REDDIT_API_BASE=https://ads-api.reddit.com  # API Base URL (configurable)
```

## Event Mapping

### Reddit Standard Events → PRISM Application Events

| Reddit Event | PRISM Context | Trigger | Conversion ID Pattern |
|-------------|---------------|---------|---------------------|
| `PageVisit` | Page loads/navigation | SPA route changes | N/A (not conversion) |
| `Lead` | Assessment interest | Assessment started | `{sessionId}-assessment-start` |
| `SignUp` | Major milestone | 248Q completed OR account created | `{sessionId}-assessment-complete` |
| `ViewContent` | Content engagement | Results viewed, info pages | `{sessionId}-results-view` |
| `Search` | Search activity | Search queries (if implemented) | `{sessionId}-search-{query}` |
| `AddToWishlist` | Interest signals | Wishlist/favorites (if implemented) | `{sessionId}-wishlist-{itemId}` |
| `AddToCart` | Purchase intent | Cart additions (if implemented) | `{sessionId}-cart-{itemId}` |
| `Purchase` | Revenue events | Payment success | `{orderId}-purchase` |

## Implementation Files

### Client-Side (`src/lib/reddit/`)

**`client.ts`** - Core client utilities
- `getAttributionContext()` - Capture click IDs, screen dimensions
- `trackRedditS2S()` - Send events to Edge Function (no raw PII)
- `trackRedditPixel()` - Fire pixel events
- `trackRedditFull()` - Combined pixel + S2S tracking
- `generateConversionId()` - Deterministic ID generation for idempotency

**`spa-tracker.ts`** - Single Page Application tracking
- Auto-track route changes → `PageVisit` events
- History API override for programmatic navigation
- Custom event listeners for app-specific milestones
- Debounced tracking to prevent duplicate events

**`tracking-integration.ts`** - Enhanced tracking functions
- `trackAssessmentStartEnhanced()` - Lead conversion
- `trackAssessmentCompleteEnhanced()` - SignUp conversion  
- `trackResultsViewedEnhanced()` - ViewContent conversion
- Additional helper functions for full-funnel tracking

### Server-Side (`supabase/functions/reddit-conversions/`)

**`index.ts`** - Conversions API Edge Function
- OAuth2 client credentials flow for Reddit API access
- SHA-256 hashing of PII (email, phone, external_id) server-side
- IP address and User-Agent extraction from request headers
- Retry logic with exponential backoff for API failures
- Never breaks UX - always returns 200 with error details

### Pixel Integration (`index.html`)

Enhanced Reddit pixel code with:
- Configurable `REDDIT_PIXEL_ID` from app config
- Initial `PageVisit` tracking on page load
- SPA navigation detection and tracking
- Custom event handlers for PRISM-specific milestones

## Usage Examples

### Basic Event Tracking

```typescript
import { trackRedditFull, generateConversionId } from '@/lib/reddit/client';

// Track assessment start
const sessionId = 'uuid-session-id';
const conversionId = generateConversionId(sessionId, 'assessment-start');

await trackRedditFull('Lead', {
  conversion_id: conversionId,
  product_category: 'personality-assessment',
  product_name: 'PRISM Assessment Started'
});
```

### Enhanced Integration Functions

```typescript
import { 
  trackAssessmentStartEnhanced,
  trackAssessmentCompleteEnhanced,
  trackResultsViewedEnhanced 
} from '@/lib/reddit/tracking-integration';

// In your assessment flow
await trackAssessmentStartEnhanced(sessionId);

// On completion
await trackAssessmentCompleteEnhanced(sessionId, 248);

// When viewing results  
await trackResultsViewedEnhanced(sessionId, 'ENFP-A');
```

### Purchase Tracking

```typescript
import { trackPaymentSuccessEnhanced } from '@/lib/reddit/tracking-integration';

await trackPaymentSuccessEnhanced(
  29.99,           // value
  'USD',           // currency
  'order-123',     // transaction ID (becomes conversion_id)
  sessionId,       // optional session context
  'Premium Report' // product name
);
```

## Attribution & PII Handling

### Client-Side Attribution Context
- `click_id` - Reddit campaign click identifier (from URL params or storage)
- `uuid` - Client-generated event identifier
- `screen_width/height` - Device dimensions
- URL parameters: `rdt_cid`, `reddit_cid` captured and persisted

### Server-Side Enhancement
- `ip_address` - Extracted from `x-forwarded-for` or `x-real-ip` headers
- `user_agent` - Browser/device identification
- **PII Hashing** - Email, phone, external_id are SHA-256 hashed before sending to Reddit
- Attribution linking between pixel and conversions API events

### Security & Privacy
- **No raw PII** leaves the browser - only hashed server-side
- Client only sends: email, phone, external_id (if provided) → Server hashes these
- IP and User-Agent only available server-side
- Conversion IDs enable idempotency without exposing user data

## Idempotency & Reliability

### Conversion ID Strategy
```typescript
// Pattern: {contextId}-{eventType}-{additional?}
generateConversionId('session-123', 'assessment-start')  
// → 'session-123-assessment-start'

generateConversionId('order-456', 'purchase')
// → 'order-456-purchase'
```

### Retry Logic
- **Exponential backoff**: 1s, 2s, 4s delays
- **Only retry 5xx errors**: Don't retry client errors (4xx)
- **Max 3 retries** then log failure
- **Never break UX**: Always return success response to client

### Error Handling
- Client tracking failures logged but don't block UI
- Server errors return 200 OK with error details (preserves UX)
- OAuth token failures trigger retry with fresh credentials
- Network timeouts handled gracefully

## Testing & Validation

### Unit Tests
```bash
# Hash function validation
sha256Hash('test@example.com') === 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'

# Conversion ID generation
generateConversionId('session-123', 'test') === 'session-123-test'
```

### Integration Tests
1. **Page Load**: Pixel loads → PageVisit fired (both pixel + S2S)
2. **Assessment Start**: `app:assessment:start` event → Lead conversion
3. **Assessment Complete**: 248+ questions → SignUp conversion with item_count
4. **Results View**: Results page load → ViewContent conversion
5. **Purchase Flow**: Payment success → Purchase conversion with value/currency

### Network Validation
```bash
# Check Reddit Conversions API calls
curl -X POST https://your-project.supabase.co/functions/v1/reddit-conversions \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "event_name": "Lead",
    "ctx": {"uuid": "test-uuid"},
    "payload": {"conversion_id": "test-conversion"}
  }'
```

## Compliance & Consent

### GDPR Considerations
- Reddit tracking should respect user consent preferences
- Gate conversion API calls based on analytics consent status
- Provide opt-out mechanisms for users in regulated regions

### Consent Integration Pattern
```typescript
// Example consent gating
if (hasAnalyticsConsent()) {
  await trackRedditFull('Lead', payload);
} else {
  console.log('Reddit tracking skipped - no consent');
}
```

## Debugging & Monitoring

### Client-Side Debugging
```javascript
// Enable debug logging
localStorage.setItem('reddit_debug', 'true');

// Check attribution context
console.log(getAttributionContext());

// Verify pixel loading
console.log(window.rdt ? 'Pixel loaded' : 'Pixel missing');
```

### Server-Side Monitoring
- Check Edge Function logs: [Reddit Conversions Logs](https://supabase.com/dashboard/project/gnkuikentdtnatazeriu/functions/reddit-conversions/logs)
- Monitor OAuth token refresh success/failure rates
- Track conversion API response codes and error patterns
- Alert on high failure rates or missing required secrets

## Deployment Notes

### Environment Configuration
- Secrets configured in Supabase Edge Functions settings
- Reddit Pixel ID configurable via app config (`REDDIT_PIXEL_ID`)
- API base URL configurable for different Reddit API versions
- All secrets automatically available in Edge Function runtime

### CI/CD Integration
- Secrets managed through Supabase dashboard (not in code)
- Edge Functions deploy automatically with code changes
- No additional deployment steps required
- Test conversions in staging environment before production

## API Endpoint Reference

### Reddit Conversions API
- **Endpoint**: `${REDDIT_API_BASE}/api/v3/measurements/conversions`
- **Method**: POST
- **Auth**: Bearer token (OAuth2 client credentials)
- **Content-Type**: application/json

### Payload Structure
```json
{
  "ad_account_id": "act_XXXXXXXX",
  "data": [{
    "event_name": "Lead",
    "event_time": 1640995200,
    "pixel_id": "rp_xxxxxxxxxxxxx",
    "attribution": {
      "click_id": "reddit-click-id",
      "uuid": "client-event-uuid",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "email": "hashed-email-sha256",
      "phone": "hashed-phone-sha256"
    },
    "metadata": {
      "value": 29.99,
      "currency": "USD",
      "conversion_id": "session-123-purchase"
    }
  }]
}
```

## Troubleshooting

### Common Issues

**OAuth Failures**
- Verify `REDDIT_APP_ID` and `REDDIT_CLIENT_SECRET` are correct
- Check Reddit app permissions include Conversions API access
- Confirm ad account ID format: `act_XXXXXXXX`

**Missing Conversions**
- Verify `conversion_id` is unique and deterministic
- Check that PII hashing is working (email/phone should be 64-char hex)
- Confirm IP address extraction from headers

**Pixel Not Loading**
- Check `REDDIT_PIXEL_ID` format: `rp_xxxxxxxxxxxxx`
- Verify pixel script loads before tracking calls
- Confirm CORS settings allow Reddit domain

**Rate Limiting**
- Reddit API has rate limits - check response headers
- Implement exponential backoff (already included)
- Consider batching conversions if high volume

### Debug Commands

```bash
# Test Edge Function directly
curl -X POST https://gnkuikentdtnatazeriu.functions.supabase.co/reddit-conversions \
  -H "Content-Type: application/json" \
  -d '{"event_name":"Lead","ctx":{"uuid":"test"},"payload":{}}'

# Check secrets configuration
# (Access via Supabase dashboard only)

# Monitor function logs
# https://supabase.com/dashboard/project/gnkuikentdtnatazeriu/functions/reddit-conversions/logs
```