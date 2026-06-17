import { describe, it, expect } from "vitest";
import {
  autoReply,
  isDistress,
  DISTRESS_REPLY,
} from "@/features/chat/auto-reply";

describe("isDistress", () => {
  it("détecte la détresse, avec ou sans accents", () => {
    expect(isDistress("je veux mourir")).toBe(true);
    expect(isDistress("j'ai envie d'en finir ce soir")).toBe(true);
    expect(isDistress("envie de disparaître")).toBe(true); // accent
    expect(isDistress("je veux me faire du mal")).toBe(true);
  });

  it("ne déclenche pas sur un message neutre", () => {
    expect(isDistress("je suis un peu fatigué aujourd'hui")).toBe(false);
  });
});

describe("autoReply", () => {
  it("détresse → message de soutien + ressources (3114), flagged", () => {
    const r = autoReply("j'ai envie d'en finir");
    expect(r.flagged).toBe(true);
    expect(r.content).toBe(DISTRESS_REPLY);
    expect(r.content).toContain("3114");
    expect(r.content).toMatch(/15|112/);
  });

  it("oriente vers la respiration quand c'est le stress", () => {
    const r = autoReply("je suis hyper stressé en ce moment");
    expect(r.flagged).toBe(false);
    expect(r.content.toLowerCase()).toContain("respiration");
  });

  it("répond avec douceur à la tristesse (accents gérés)", () => {
    const r = autoReply("je me sens très déprimé");
    expect(r.flagged).toBe(false);
    expect(r.content.toLowerCase()).toMatch(/ressens|là|doux/);
  });

  it("repli encourageant par défaut, sans diagnostic", () => {
    const r = autoReply("bonjour");
    expect(r.flagged).toBe(false);
    expect(r.content).toMatch(/écoute|partager|raconte/i);
    expect(r.content.toLowerCase()).not.toMatch(
      /dépression|diagnostic|trouble/,
    );
  });
});
