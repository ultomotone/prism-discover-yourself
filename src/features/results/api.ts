import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, ResultsSession, FetchResultsResponse } from './types';

export type ResultsPayload = FetchResultsResponse;

export type FetchResultsErrorKind =
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'invalid'
  | 'transient'
  | 'unknown';

export class FetchResultsError extends Error {
  kind: FetchResultsErrorKind;
  detail?: string;
  constructor(kind: FetchResultsErrorKind, detail?: string) {
    super(detail ?? kind);
    this.name = 'FetchResultsError';
    this.kind = kind;
    this.detail = detail;
  }
}

const inFlight = new Map<
  string,
  { promise: Promise<FetchResultsResponse>; controller: AbortController }
>();

function backoff(attempt: number): number {
  const base = 100 * 2 ** attempt; // 100ms, 200ms, 400ms
  const jitter = Math.random() * 100;
  return base + jitter;
}

function mapStatus(status?: number, detail?: string): FetchResultsError {
  if (status === 400) return new FetchResultsError('invalid', detail);
  if (status === 401) return new FetchResultsError('unauthorized', detail);
  if (status === 403) return new FetchResultsError('forbidden', detail);
  if (status === 404) return new FetchResultsError('not_found', detail);
  if (status === 429 || (status !== undefined && status >= 500 && status < 600)) {
    return new FetchResultsError('transient', detail);
  }
  return new FetchResultsError('unknown', detail);
}

function mapUnknown(e: unknown): FetchResultsError {
  if (e instanceof FetchResultsError) return e;
  // Aborts from fetch usually surface as DOMException('AbortError') or similar
  if (e && typeof e === 'object' && 'name' in e && (e as any).name === 'AbortError') {
    return new FetchResultsError('transient', 'aborted');
  }
  return new FetchResultsError('unknown', e instanceof Error ? e.message : undefined);
}

async function rpcCall(
  client: SupabaseClient,
  sessionId: string,
  shareToken: string | undefined,
): Promise<FetchResultsResponse> {
  const allowLegacy =
    import.meta.env?.VITE_ALLOW_LEGACY_RESULTS === 'true' ||
    (typeof process !== 'undefined' && process.env.VITE_ALLOW_LEGACY_RESULTS === 'true');

  const rpcName =
    shareToken ? 'get_results_by_session'
    : allowLegacy ? 'get_results_by_session_legacy'
    : 'get_results_by_session';

  const params: Record<string, string | undefined> = { session_id: sessionId };
  if (shareToken) params.t = shareToken;

  const { data, error } = await client.rpc(rpcName, params);
  if (error) {
    // PGRST116 => "No rows found"
    const status = (error as any)?.code === 'PGRST116' ? 404 : Number((error as any)?.code) || 500;
    throw mapStatus(status, (error as any).message);
  }

  const payload = data as { profile?: Profile; session?: ResultsSession } | null;
  if (payload?.profile && payload.session) return payload as FetchResultsResponse;
  throw new FetchResultsError('unknown', 'invalid response');
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  controller: AbortController,
): Promise<T> {
  let attempt = 0;
  while (true) { // eslint-disable-line no-constant-condition
    try {
      if (controller.signal.aborted) throw new FetchResultsError('transient', 'aborted');
      return await fn();
    } catch (e) {
      const mapped = mapUnknown(e);
      if (mapped.kind === 'transient' && attempt < 2) {
        await new Promise((r) => setTimeout(r, backoff(attempt)));
        attempt++;
        continue;
      }
      throw mapped;
    }
  }
}

export async function fetchResultsBySession(
  { sessionId, shareToken }: { sessionId: string; shareToken?: string },
  client: SupabaseClient = supabase,
): Promise<FetchResultsResponse> {
  const key = `${sessionId}|${shareToken ?? ''}`;
  const existing = inFlight.get(key);
  if (existing) return existing.promise;

  const controller = new AbortController();
  const promise = (async () => {
    try {
      return await executeWithRetry(
        () => rpcCall(client, sessionId, shareToken),
        controller
      );
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, { promise, controller });
  return promise;
}

// Optional: let callers proactively cancel a specific in-flight call
export function cancelFetchResults(sessionId: string, shareToken?: string) {
  const key = `${sessionId}|${shareToken ?? ''}`;
  const entry = inFlight.get(key);
  if (entry) entry.controller.abort();
}
