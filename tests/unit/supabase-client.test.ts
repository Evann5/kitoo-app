import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

describe("supabase browser client", () => {
  const original = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("does not throw when env vars are absent", () => {
    expect(() => createClient()).not.toThrow();
    const client = createClient();
    expect(client).toBeTruthy();
    expect(typeof client.from).toBe("function");
  });

  it("reports not configured when env vars are absent", () => {
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("reports configured when both env vars are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    expect(isSupabaseConfigured()).toBe(true);
  });
});
