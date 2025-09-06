export function validateUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function assertUuid(value: unknown, field = 'id'): asserts value is string {
  if (typeof value !== 'string' || !validateUuid(value)) {
    throw new Error(`${field} must be a valid UUID`);
  }
}
