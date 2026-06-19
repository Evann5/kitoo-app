import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EMERGENCY_CONTACTS } from "@/lib/emergency";
import UrgencePage from "@/app/urgence/page";

describe("emergency data", () => {
  it("contient les numéros clés (3114, 112, 114 en SMS)", () => {
    const numbers = EMERGENCY_CONTACTS.map((c) => c.number);
    expect(numbers).toContain("3114");
    expect(numbers).toContain("112");
    expect(numbers).toContain("15");
    const sms114 = EMERGENCY_CONTACTS.find((c) => c.number === "114");
    expect(sms114?.kind).toBe("sms");
  });
});

describe("UrgencePage", () => {
  it("affiche le disclaimer et des liens tel:/sms: issus des données", () => {
    render(<UrgencePage />);
    // Titre soutenant + disclaimer danger immédiat.
    expect(screen.getByText(/tu n'es pas seul/i)).toBeInTheDocument();
    expect(screen.getByText(/danger immédiat.*112.*15/i)).toBeInTheDocument();

    // Appel en un geste : lien tel: pour le 3114, sms: pour le 114.
    const call3114 = screen.getByRole("link", { name: /appeler le 3114/i });
    expect(call3114).toHaveAttribute("href", "tel:3114");
    const sms114 = screen.getByRole("link", { name: /sms.*114/i });
    expect(sms114).toHaveAttribute("href", "sms:114");

    // Un lien par contact.
    const telOrSms = screen
      .getAllByRole("link")
      .filter((a) => /^(tel|sms):/.test(a.getAttribute("href") ?? ""));
    expect(telOrSms.length).toBe(EMERGENCY_CONTACTS.length);
  });
});
