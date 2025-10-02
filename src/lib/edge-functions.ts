import { supabase } from '@/integrations/supabase/client';

function normaliseEdgePath(path: string): { functionName: string; queryString: string } {
  const raw = String(path ?? '');
  const [functionName, ...queryParts] = raw.split('?');
  const trimmedPath = functionName
    .replace(/^\/+/, '')
    .replace(/^functions\/v1\//, '')
    .replace(/^\/+/, '');
  const query = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';
  return { functionName: trimmedPath, queryString: query };
}

export async function invokeEdge(path: string, init: RequestInit = {}): Promise<Response> {
  const { functionName, queryString } = normaliseEdgePath(path);
  
  // Build the full URL using the Supabase client
  const supabaseUrl = (supabase as any).supabaseUrl;
  const anonKey = (supabase as any).supabaseKey;
  
  const url = `${supabaseUrl}/functions/v1/${functionName}${queryString}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`,
    'apikey': anonKey,
    ...(init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : (init.headers as Record<string, string> | undefined)),
  };

  return fetch(url, {
    ...init,
    headers,
  });
}

export function invokeEdgeSilently(path: string, init: RequestInit = {}): void {
  void invokeEdge(path, init).catch(() => {
    // Swallow errors to avoid noisy consoles on optional tracking calls
  });
}
