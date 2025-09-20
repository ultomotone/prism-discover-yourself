export type RpcErrorCategory =
  | 'expired_or_invalid_token'
  | 'not_authorized'
  | 'transient'
  | 'unknown';

export function classifyRpcError(err: unknown): RpcErrorCategory {
  const e = (err ?? {}) as { status?: number; message?: string };
  if (e.status === 401 || e.status === 404 || e.message === 'no_data_found') {
    return 'expired_or_invalid_token';
  }
  if (e.status === 403) return 'not_authorized';
  if (e.status === 429 || e.status === 503) return 'transient';
  return 'unknown';
}
