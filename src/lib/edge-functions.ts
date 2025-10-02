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
  
  // For GET requests with query params, construct URL directly
  if (queryString && (!init.method || init.method === 'GET')) {
    const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U';
    
    const url = `${supabaseUrl}/functions/v1/${functionName}${queryString}`;
    
    return fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        ...(init.headers instanceof Headers
          ? Object.fromEntries(init.headers.entries())
          : Array.isArray(init.headers)
            ? Object.fromEntries(init.headers)
            : (init.headers as Record<string, string> | undefined)),
      },
    });
  }
  
  // For POST/other methods without query params, use supabase.functions.invoke
  const response = await supabase.functions.invoke(functionName, {
    body: init.body ? JSON.parse(init.body as string) : undefined,
    headers: init.headers as Record<string, string>,
  });
  
  if (response.error) {
    throw new Error(response.error.message || 'Edge function invocation failed');
  }
  
  // Convert Supabase response to standard Response format
  return new Response(JSON.stringify(response.data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function invokeEdgeSilently(path: string, init: RequestInit = {}): void {
  void invokeEdge(path, init).catch(() => {
    // Swallow errors to avoid noisy consoles on optional tracking calls
  });
}
