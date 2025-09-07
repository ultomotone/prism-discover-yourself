export interface GetRecentAssessmentsParams {
  limit?: number;
  cursor?: string | null;
  filter_status?: string | null;
  filter_user_id?: string | null;
  filter_email?: string | null;
}

export interface RecentSafe {
  id: string;
  user_id?: string;
  email?: string;
  status?: string;
  started_at: string;
  completed_at?: string;
  total_questions?: number;
  completed_questions?: number;
  share_token?: string;
  metadata?: Record<string, unknown>;
  country_iso2?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryStatusCodes: number[];
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  retryStatusCodes: [429, 500, 502, 503, 504],
};

interface SupabaseClientLike {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: any; error: { message: string; code?: number | string } | null }>;
}

export async function getRecentAssessmentsSafe(
  client: SupabaseClientLike,
  params: GetRecentAssessmentsParams = {},
  retryConfig: Partial<RetryConfig> = {},
): Promise<PaginatedResponse<RecentSafe>> {
  const config: RetryConfig = { ...defaultRetryConfig, ...retryConfig };
  let retries = 0;
  let delay = config.initialDelay;

  while (true) {
    try {
      const { data, error } = await client.rpc('get_recent_assessments_safe_cursor', {
        limit: params.limit ?? 20,
        cursor: params.cursor ?? null,
        filter_status: params.filter_status ?? null,
        filter_user_id: params.filter_user_id ?? null,
        filter_email: params.filter_email ?? null,
      });

      if (error) {
        const code = typeof error.code === 'string' ? Number(error.code) : error.code ?? 0;
        if (retries < config.maxRetries && config.retryStatusCodes.includes(code)) {
          retries++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay = Math.min(delay * config.backoffFactor, config.maxDelay);
          continue;
        }
        throw new Error(`Failed to fetch assessments: ${error.message}`);
      }

      return {
        data: data?.items ?? [],
        next_cursor: data?.next_cursor ?? null,
        has_more: data?.has_more ?? false,
      };
    } catch (err) {
      if (retries < config.maxRetries) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
        continue;
      }
      throw err;
    }
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
