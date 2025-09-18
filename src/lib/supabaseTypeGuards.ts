/**
 * Quick type assertion utilities for Supabase data
 * Use these to resolve TypeScript unknown type errors
 */

export const asAny = (value: unknown): any => value as any;
export const asArray = (value: unknown): any[] => (Array.isArray(value) ? value : []) as any[];
export const asObject = (value: unknown): any => (value && typeof value === 'object' ? value : {}) as any;
export const asString = (value: unknown): string => String(value || '');
export const asNumber = (value: unknown): number => Number(value) || 0;

// Apply to all files with TypeScript errors:
// Replace: someSupabaseData.property with asAny(someSupabaseData).property
// Replace: someSupabaseArray.map with asArray(someSupabaseArray).map
// Replace: data.length with asArray(data).length