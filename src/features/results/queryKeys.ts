const baseKey = ['results'] as const;

export const resultsQueryKeys = {
  all: baseKey,
  sessionScope: (sessionId: string) => [...baseKey, 'by-session', sessionId] as const,
  session: (sessionId: string, tokenOrNoToken: string, scoringVersion?: string) =>
    ['results', 'by-session', sessionId, tokenOrNoToken ?? 'no-token', scoringVersion ?? 'v?'] as const,
  result: (resultId: string, scoringVersion?: string) =>
    ['results', 'by-result', resultId, scoringVersion ?? 'v?'] as const,
} as const;

export type ResultsQueryKey = ReturnType<typeof resultsQueryKeys.session>;
