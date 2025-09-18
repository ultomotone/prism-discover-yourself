import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gnkuikentdtnatazeriu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U";

// Create singleton client to avoid multiple GoTrueClient instances
const client = (globalThis as any).__supabase ?? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'prism-auth'
  }
});

(globalThis as any).__supabase ||= client;

export const supabase = client;

// For tracking utilities that need a separate client (to avoid auth conflicts)
export const createTrackingClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    storageKey: 'prism-track'
  }
});