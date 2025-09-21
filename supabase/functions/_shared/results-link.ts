export type BuildResultsLinkOptions = {
  version?: string | null;
  scoringVersion?: string | null;
};

export function buildResultsLink(
  baseUrl: string,
  resultId: string,
  token: string | null,
  options: BuildResultsLinkOptions = {},
): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const params = new URLSearchParams();
  if (token && token.trim().length > 0) {
    params.set('t', token.trim());
  }
  const scoringVersion = options.scoringVersion ?? options.version;
  if (scoringVersion && scoringVersion.trim().length > 0) {
    params.set('sv', scoringVersion.trim());
  }
  const query = params.toString();
  return query
    ? `${normalizedBase}/results/${resultId}?${query}`
    : `${normalizedBase}/results/${resultId}`;
}
