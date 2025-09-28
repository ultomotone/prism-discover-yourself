// Plausible Stats API Client
// Based on the Plausible Stats API v2 specification

export interface PlausibleQueryParams {
  site_id: string;
  metrics: string[];
  date_range: string;
  filters?: Array<[string, string, string[]]>;
  dimensions?: string[];
  order_by?: Array<[string, 'asc' | 'desc']>;
  include?: {
    time_labels?: boolean;
    total_rows?: boolean;
  };
  pagination?: {
    limit: number;
    offset: number;
  };
}

export interface PlausibleQueryResponse {
  results: Array<{
    dimensions: Record<string, string>;
    metrics: Record<string, number>;
  }>;
  meta: {
    warning?: string;
  };
}

export class PlausibleStatsAPI {
  private apiKey: string;
  private baseUrl = 'https://plausible.io/api/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async query(params: PlausibleQueryParams): Promise<PlausibleQueryResponse> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Plausible API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Pre-built queries for the PRISM analytics schema

  async getWeeklyContentDepth(siteId: string) {
    return this.query({
      site_id: siteId,
      metrics: ['visitors', 'pageviews', 'bounce_rate'],
      date_range: '7d',
      filters: [
        ['is', 'event:goal', ['View:Signals', 'View:Dimensionality', 'View:Blocks']]
      ],
      dimensions: ['event:goal']
    });
  }

  async getSignalsReadingDepth(siteId: string) {
    return this.query({
      site_id: siteId,
      metrics: ['events', 'percentage'],
      date_range: '28d',
      filters: [
        ['is', 'event:goal', ['Engagement:Read75']],
        ['contains', 'event:page', ['/signals']]
      ],
      dimensions: ['event:props:signal'],
      order_by: [['events', 'desc']]
    });
  }

  async getChannelPerformance(siteId: string) {
    return this.query({
      site_id: siteId,
      metrics: ['visitors', 'events', 'conversion_rate', 'group_conversion_rate'],
      date_range: '28d',
      filters: [['is', 'event:goal', ['CTA:StartAssessment']]],
      dimensions: ['visit:channel', 'visit:utm_source'],
      order_by: [['group_conversion_rate', 'desc']]
    });
  }

  async getTypingLabGeography(siteId: string) {
    return this.query({
      site_id: siteId,
      metrics: ['visitors', 'pageviews', 'bounce_rate'],
      date_range: '30d',
      filters: [['contains', 'event:page', ['/typing-lab']]],
      dimensions: ['visit:country_name', 'visit:city_name'],
      order_by: [['visitors', 'desc']]
    });
  }

  async getRealTimeTypeHourly(siteId: string) {
    return this.query({
      site_id: siteId,
      metrics: ['visitors'],
      date_range: 'day',
      filters: [['contains', 'event:page', ['/real-time-type']]],
      dimensions: ['time:hour'],
      include: { time_labels: true }
    });
  }

  async getUTMMatrix(siteId: string) {
    return this.query({
      site_id: siteId,
      metrics: ['visitors', 'events', 'pageviews'],
      date_range: '7d',
      dimensions: ['visit:utm_medium', 'visit:utm_source'],
      include: { total_rows: true },
      pagination: { limit: 1000, offset: 0 }
    });
  }

  async getContentSubscriptions(siteId: string) {
    return this.query({
      site_id: siteId,
      metrics: ['events', 'group_conversion_rate'],
      date_range: '12mo',
      filters: [['is', 'event:goal', ['CTA:Subscribe']]],
      dimensions: ['event:props:section'],
      order_by: [['events', 'desc']]
    });
  }

  // Dashboard summary queries
  async getDashboardMetrics(siteId: string) {
    const [
      traffic,
      ctaPerformance,
      contentEngagement,
      geography,
      subscriptions
    ] = await Promise.all([
      this.query({
        site_id: siteId,
        metrics: ['visitors', 'pageviews', 'bounce_rate'],
        date_range: '28d',
        dimensions: ['time:day']
      }),
      this.getChannelPerformance(siteId),
      this.query({
        site_id: siteId,
        metrics: ['events'],
        date_range: '28d',
        filters: [['is', 'event:goal', ['Engagement:Read75']]],
        dimensions: ['event:props:section']
      }),
      this.query({
        site_id: siteId,
        metrics: ['visitors'],
        date_range: '30d',
        dimensions: ['visit:country_name'],
        order_by: [['visitors', 'desc']],
        pagination: { limit: 10, offset: 0 }
      }),
      this.getContentSubscriptions(siteId)
    ]);

    return {
      traffic,
      ctaPerformance,
      contentEngagement,
      geography,
      subscriptions
    };
  }
}

// Singleton instance
let plausibleAPI: PlausibleStatsAPI | null = null;

export function initPlausibleAPI(apiKey: string): PlausibleStatsAPI {
  plausibleAPI = new PlausibleStatsAPI(apiKey);
  return plausibleAPI;
}

export function getPlausibleAPI(): PlausibleStatsAPI | null {
  return plausibleAPI;
}