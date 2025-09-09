export function buildResultsLink(baseUrl: string, sessionId: string, token: string): string {
  const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalized}/results/${sessionId}?t=${token}`;
}

