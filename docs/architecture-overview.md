# PRISM System Overview

**Version:** v1.2.1

## Data Flow
Assessment → Responses → `finalizeAssessment` → `score_prism` → `profiles` → `get_results_by_session`

## Trust Boundaries
- **Client** (anon/auth)
- **Edge Functions** (service role)
- **Database** (RLS + SECURITY DEFINER RPCs)

## Components
- Scoring engine (deterministic, versioned, goldens)
- Tokenized access (share_token + owner path) with rotation + TTL
- Observability (access logs, rotation events)
