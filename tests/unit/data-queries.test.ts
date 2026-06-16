import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock chainable du client Supabase serveur : chaque méthode enregistre son
// appel et renvoie le même builder ; `await` résout `result`.
let calls: unknown[][] = [];
const result = { data: [], error: null };

function makeQueryBuilder() {
  const qb: Record<string, unknown> = {};
  return new Proxy(qb, {
    get(_target, prop: string) {
      if (prop === "then") {
        return (resolve: (r: typeof result) => unknown) => resolve(result);
      }
      return (...args: unknown[]) => {
        calls.push([prop, ...args]);
        return proxy;
      };
    },
  });
}

let proxy: ReturnType<typeof makeQueryBuilder>;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      calls.push(["from", table]);
      return proxy;
    },
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
  }),
}));

import {
  listMoodTags,
  getTodayEntry,
  upsertTodayEntry,
} from "@/features/mood/queries";
import { suggestResourcesForLevel } from "@/features/wellbeing/queries";

beforeEach(() => {
  calls = [];
  proxy = makeQueryBuilder();
});

function findCall(name: string) {
  return calls.find((c) => c[0] === name);
}

describe("mood queries", () => {
  it("listMoodTags lit mood_tags trié par label", async () => {
    await listMoodTags();
    expect(findCall("from")).toEqual(["from", "mood_tags"]);
    expect(findCall("order")).toEqual(["order", "label"]);
  });

  it("getTodayEntry filtre sur la date du jour", async () => {
    await getTodayEntry();
    const today = new Date().toISOString().slice(0, 10);
    expect(findCall("from")).toEqual(["from", "mood_entries"]);
    expect(findCall("eq")).toEqual(["eq", "entry_date", today]);
    expect(findCall("maybeSingle")).toBeTruthy();
  });

  it("upsertTodayEntry upsert avec user_id et onConflict 1/jour", async () => {
    // single() doit résoudre un objet : on ajuste le result le temps du test.
    proxy = makeQueryBuilder();
    await upsertTodayEntry({ level: 3, comment: "ok" }).catch(() => {});
    const upsert = findCall("upsert");
    expect(upsert?.[0]).toBe("upsert");
    expect(upsert?.[1]).toMatchObject({ user_id: "user-1", level: 3 });
    expect(upsert?.[2]).toEqual({ onConflict: "user_id,entry_date" });
  });
});

describe("wellbeing queries", () => {
  it("suggestResourcesForLevel filtre via contains(mood_levels)", async () => {
    await suggestResourcesForLevel(2);
    expect(findCall("from")).toEqual(["from", "resources"]);
    expect(findCall("contains")).toEqual(["contains", "mood_levels", [2]]);
    expect(findCall("limit")).toEqual(["limit", 3]);
  });
});
