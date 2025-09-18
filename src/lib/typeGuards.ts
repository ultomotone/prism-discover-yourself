/**
 * Type guards and utilities for handling unknown types from Supabase
 */

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function safeNumber(value: unknown, fallback: number = 0): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

export function safeString(value: unknown, fallback: string = ''): string {
  if (isString(value)) return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

export function safeArray<T = unknown>(value: unknown): T[] {
  if (isArray(value)) return value as T[];
  return [];
}

// Type guard utility for all Supabase responses
export function asAny<T = any>(value: unknown): T {
  return value as T;
}

export function safeSupabaseArray<T = any>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

export function safeObject(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}