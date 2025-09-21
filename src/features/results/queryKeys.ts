const baseKey = ['results'] as const;

export const resultsQueryKeys = {
  all: baseKey,
  sessionScope: (sessionId: string) => [...baseKey, sessionId] as const,
  session: (sessionId: string, identity: string | null, version?: string | null) =>
    [...resultsQueryKeys.sessionScope(sessionId), identity, version ?? null] as const,
} as const;

export type ResultsQueryKey = ReturnType<typeof resultsQueryKeys.session>;
