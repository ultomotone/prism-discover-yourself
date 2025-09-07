import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ResultsProfile extends Record<string, unknown> {
  id: string;
}

export interface ResultsSession {
  id: string;
  status: string;
}

export interface FetchResultsResponse {
  profile: ResultsProfile;
  session: ResultsSession;
}

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
  const base = 100 * 2 ** attempt;
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
  if (e && typeof e === 'object' && 'name' in e && (e as any).name === 'AbortError') {
    return new FetchResultsError('transient', 'aborted');
  }
  return new FetchResultsError('unknown', e instanceof Error ? e.message : undefined);
}

function parseEdgePayload(
  payload: unknown,
  _sessionId: string,
): FetchResultsResponse {
  const data = payload as { profile?: ResultsProfile; session?: Partial<ResultsSession> } | null;
  if (data?.profile && data.session && typeof data.session.id === 'string') {
    return {
      profile: data.profile,
      session: { id: data.session.id, status: data.session.status ?? 'unknown' },
    };
  }
  throw new FetchResultsError('unknown', 'invalid response');
}

async function rpcCall(
  client: SupabaseClient,
  sessionId: string,
  shareToken: string,
  _signal: AbortSignal,
): Promise<FetchResultsResponse> {
  type RpcRow = ResultsProfile;
  const { data, error } = await client.rpc<RpcRow | RpcRow[]>(
    'get_profile_by_session',
    { p_session_id: sessionId, p_share_token: shareToken }
  );
  if (error) throw mapStatus((error as any).status, (error as any).message);
  const profile: RpcRow | undefined = Array.isArray(data) ? data[0] : (data ?? undefined);
  if (!profile) throw new FetchResultsError('not_found');
  return { profile, session: { id: sessionId, status: 'completed' } };
}

async function edgeCall(
  client: SupabaseClient,
  sessionId: string,
  shareToken: string | undefined,
  signal: AbortSignal,
): Promise<FetchResultsResponse> {
  const { data, error } = await client.functions.invoke(
    'get-results-by-session',
    { body: { sessionId, shareToken }, signal }
  );
  if (error) throw mapStatus((error as any).status, (error as any).message);
  return parseEdgePayload(data, sessionId);
}

async function executeWithRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  controller: AbortController,
): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      if (controller.signal.aborted) throw new FetchResultsError('transient', 'aborted');
      return await fn(controller.signal);
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

export async function fetchResults(
  { sessionId, shareToken }: { sessionId: string; shareToken?: string },
  client: SupabaseClient = supabase,
): Promise<FetchResultsResponse> {
  const key = `${sessionId}|${shareToken ?? ''}`;
  const existing = inFlight.get(key);
  if (existing) return existing.promise;

  const controller = new AbortController();

  const promise = (async () => {
    try {
      if (shareToken) {
        return await executeWithRetry(
          (signal) => rpcCall(client, sessionId, shareToken, signal),
          controller
        );
      }
      return await executeWithRetry(
        (signal) => edgeCall(client, sessionId, undefined, signal),
        controller
      );
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, { promise, controller });
  return promise;
}

export function cancelFetchResults(sessionId: string, shareToken?: string) {
  const key = `${sessionId}|${shareToken ?? ''}`;
  const entry = inFlight.get(key);
  if (entry) entry.controller.abort();
}
