const EDGE_PREFIX = 'functions/v1/';

function normaliseEdgePath(path: string): string {
  const raw = String(path ?? '');
  const [maybePath, ...queryParts] = raw.split('?');
  const trimmedPath = maybePath
    .replace(/^\/+/, '')
    .replace(new RegExp(`^${EDGE_PREFIX}`), '')
    .replace(/^\/+/, '');
  const query = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';
  return `${trimmedPath}${query}`;
}

function hasWindowInvoker(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof (window as typeof window & { __supabaseFunctionFetch?: unknown }).__supabaseFunctionFetch === 'function'
    );
  } catch {
    return false;
  }
}

export function invokeEdge(path: string, init: RequestInit = {}): Promise<Response> {
  const normalisedPath = normaliseEdgePath(path);
  const headers: HeadersInit =
    init.headers instanceof Headers
      ? init.headers
      : Array.isArray(init.headers)
        ? [...init.headers]
        : { ...(init.headers as Record<string, string> | undefined) };

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  if (hasWindowInvoker()) {
    try {
      const invoker = (window as typeof window & {
        __supabaseFunctionFetch?: (path: string, init: RequestInit) => Promise<Response>;
      }).__supabaseFunctionFetch;
      if (invoker) {
        return invoker(normalisedPath, requestInit);
      }
    } catch {
      // fall through to fetch
    }
  }

  return fetch(`/functions/v1/${normalisedPath}`, requestInit);
}

export function invokeEdgeSilently(path: string, init: RequestInit = {}): void {
  void invokeEdge(path, init).catch(() => {
    // Swallow errors to avoid noisy consoles on optional tracking calls
  });
}
