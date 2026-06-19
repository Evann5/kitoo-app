import { describe, it, expect } from "vitest";
import { getReply, reflect } from "@/features/chat/engine";
import { isCrisis, CRISIS_REPLY } from "@/features/chat/crisis";

describe("isCrisis", () => {
  it("détecte les expressions de détresse (avec accents)", () => {
    expect(isCrisis("je veux mourir")).toBe(true);
    expect(isCrisis("j'ai envie d'en finir ce soir")).toBe(true);
    expect(isCrisis("envie de disparaître")).toBe(true); // accent normalisé
    expect(isCrisis("je veux me faire du mal")).toBe(true);
    expect(isCrisis("je me sens en danger")).toBe(true);
  });
  it("ne se déclenche pas sur un message anodin", () => {
    expect(isCrisis("je suis un peu fatigué aujourd'hui")).toBe(false);
  });
});

describe("getReply - intentions", () => {
  it("mappe le stress et propose un exercice", () => {
    const r = getReply("je suis hyper stressé en ce moment");
    expect(r.intent).toBe("stress");
    expect(r.suggestion?.href).toBe("/exercices");
    expect(r.flagged).toBe(false);
    expect(r.quickReplies.length).toBeGreaterThan(0);
  });

  it("mappe le sommeil sur « je dors mal »", () => {
    expect(getReply("je dors mal en ce moment").intent).toBe("sleep");
  });

  it("mappe la tristesse, la solitude et la demande de ressources", () => {
    expect(getReply("je me sens très déprimé").intent).toBe("sadness");
    expect(getReply("je me sens tellement seul").intent).toBe("loneliness");
    expect(getReply("tu peux me donner des ressources ?").intent).toBe(
      "resources",
    );
  });

  it("oriente vers un humain et la page d'urgence", () => {
    const r = getReply("je voudrais parler à un professionnel");
    expect(r.intent).toBe("crisis_handoff");
    expect(r.suggestion?.href).toBe("/urgence");
  });
});

describe("getReply - anti-répétition", () => {
  it("ne renvoie pas deux fois la même réponse pour un message identique", () => {
    const first = getReply("je suis stressé", { recentReplies: [] });
    const second = getReply("je suis stressé", {
      recentReplies: [first.reply],
    });
    expect(second.reply).not.toBe(first.reply);
    expect(second.intent).toBe("stress");
  });
});

describe("getReply - crise prioritaire", () => {
  it("prime sur toute autre intention et joint les ressources d'urgence", () => {
    // Contient « stress » mais aussi une détresse : la crise l'emporte.
    const r = getReply("je suis stressé et j'ai envie d'en finir");
    expect(r.intent).toBe("crisis");
    expect(r.flagged).toBe(true);
    expect(r.reply).toBe(CRISIS_REPLY);
    expect(r.suggestion?.href).toBe("/urgence");
  });
});

describe("getReply - fallback varié", () => {
  it("renvoie un repli avec quick replies et varie d'une fois sur l'autre", () => {
    const first = getReply("xyzzy blarg", { recentReplies: [] });
    expect(first.intent).toBe("fallback");
    expect(first.quickReplies.length).toBeGreaterThan(0);
    const second = getReply("xyzzy blarg", {
      recentReplies: [first.reply],
    });
    expect(second.reply).not.toBe(first.reply);
  });
});

describe("reflect", () => {
  it("reprend un fragment des messages de longueur moyenne", () => {
    expect(reflect("je me sens vraiment perdu en ce moment")).toContain(
      "Tu me dis",
    );
  });
  it("reste vide pour les messages trop courts", () => {
    expect(reflect("ok")).toBe("");
  });
});
