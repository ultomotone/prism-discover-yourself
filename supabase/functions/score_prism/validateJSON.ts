/**
 * Phase 3: JSON Schema validation utility for PRISM scoring
 * Provides safe validation and sanitization of JSON fields
 */

export function validateJSON(value: any, fieldName: string, fallback: any = null): any {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // If it's already a valid object/array, return as-is
  if (typeof value === 'object') {
    return value;
  }
  
  // If it's a string, try to parse
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`JSON validation failed for ${fieldName}:`, message);
      return fallback;
    }
  }
  
  console.warn(`Unexpected type for ${fieldName}:`, typeof value);
  return fallback;
}

export function validateFCMap(fcMap: any): Record<string, string> | null {
  if (!fcMap) return null;
  
  const validated = validateJSON(fcMap, 'fc_map', {});
  
  // Ensure all values are strings and keys are valid choice letters
  if (typeof validated === 'object' && !Array.isArray(validated)) {
    const validChoices = /^[A-E]$/;
    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(validated)) {
      if (validChoices.test(key) && typeof value === 'string') {
        sanitized[key] = value;
      }
    }
    
    return Object.keys(sanitized).length > 0 ? sanitized : null;
  }
  
  return null;
}

export function validateMeta(meta: any): Record<string, any> {
  const validated = validateJSON(meta, 'meta', {});
  
  // Ensure it's an object, not an array
  if (typeof validated === 'object' && !Array.isArray(validated)) {
    return validated;
  }
  
  return {};
}

export function sanitizeResponseValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Handle array responses (multiple choice)
  if (Array.isArray(value)) {
    return value.filter(v => v !== null && v !== undefined);
  }
  
  // Handle string responses
  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // Check if it's JSON
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || 
        (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }
    
    return trimmed;
  }
  
  return value;
}