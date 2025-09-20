const baseKey = ['results'] as const;

export const resultsQueryKeys = {
  all: baseKey,
  sessionScope: (sessionId: string) => [...baseKey, sessionId] as const,
  session: (sessionId: string, shareToken?: string | null) =>
    [...resultsQueryKeys.sessionScope(sessionId), shareToken ?? null] as const,
} as const;

export type ResultsQueryKey = ReturnType<typeof resultsQueryKeys.session>;
