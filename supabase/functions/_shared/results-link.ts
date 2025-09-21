export type BuildResultsLinkOptions = {
  version?: string | null;
};

export function buildResultsLink(
  baseUrl: string,
  sessionId: string,
  token: string,
  options: BuildResultsLinkOptions = {},
): string {
  const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const params = new URLSearchParams();
  params.set('t', token);
  if (options.version && options.version.trim() !== '') {
    params.set('sv', options.version.trim());
  }
  const query = params.toString();
  return `${normalized}/results/${sessionId}?${query}`;
}

