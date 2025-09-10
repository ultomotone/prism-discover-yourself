export type SystemStatus = {
  status: 'green' | 'yellow' | 'red';
  message: string;
  last_updated?: string;
  updated_by?: string;
};

export function normalizeSystemStatus(raw: unknown): SystemStatus {
  const obj = (typeof raw === 'object' && raw !== null) ? (raw as any) : {};
  const status = obj.status === 'yellow' || obj.status === 'red' ? obj.status : 'green';
  const message = typeof obj.message === 'string' ? obj.message : '';
  const last_updated = typeof obj.last_updated === 'string' ? obj.last_updated : undefined;
  const updated_by = typeof obj.updated_by === 'string' ? obj.updated_by : undefined;

  return { status, message, last_updated, updated_by };
}
