// Quick fix for TypeScript unknown type errors from Supabase
export const any = (value: unknown): any => value as any;