import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Browser-side Supabase client (Client Components).
 *
 * Tolerant to missing env vars: during build or when no Supabase project is
 * configured yet, the client is created with empty strings rather than throwing.
 * Real queries will fail at runtime until `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.
 */
// Harmless placeholders used when no Supabase project is configured yet.
// They let the client be constructed without throwing; real network calls
// will simply fail until `.env.local` is filled in.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

  return createBrowserClient<Database>(url, anonKey);
}

/** True when both public Supabase env vars are present. */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
