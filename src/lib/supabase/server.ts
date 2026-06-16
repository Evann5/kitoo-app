import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server-side Supabase client (Server Components, Route Handlers, Server Actions).
 *
 * Tolerant to missing env vars: created with empty strings when no Supabase
 * project is configured yet, so `next build` never throws. Real queries will
 * fail at runtime until the env vars are set in `.env.local`.
 *
 * Must be called within a request scope (it reads/writes cookies).
 */
// Harmless placeholders used when no Supabase project is configured yet — the
// client is constructed without throwing; real calls fail until env is set.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` was called from a Server Component. This can be ignored
          // when middleware refreshes the user session.
        }
      },
    },
  });
}
