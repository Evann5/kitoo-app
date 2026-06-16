import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateAuthForm,
  isValid,
  PASSWORD_MIN_LENGTH,
} from "@/lib/validation";

describe("validation des entrées d'auth", () => {
  it("rejette un email vide ou invalide, accepte un email valide", () => {
    expect(validateEmail("")).toBeTruthy();
    expect(validateEmail("pas-un-email")).toBeTruthy();
    expect(validateEmail("toi@exemple")).toBeTruthy();
    expect(validateEmail("toi@exemple.fr")).toBeNull();
  });

  it(`exige un mot de passe d'au moins ${PASSWORD_MIN_LENGTH} caractères`, () => {
    expect(validatePassword("court")).toBeTruthy();
    expect(validatePassword("1234567")).toBeTruthy();
    expect(validatePassword("12345678")).toBeNull();
  });

  it("inscription : vérifie email, longueur et confirmation", () => {
    const errors = validateAuthForm("signup", {
      email: "mauvais",
      password: "abc",
      confirmation: "xyz",
    });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(errors.confirmation).toBeTruthy();
    expect(isValid(errors)).toBe(false);
  });

  it("inscription valide ne renvoie aucune erreur", () => {
    const errors = validateAuthForm("signup", {
      email: "toi@exemple.fr",
      password: "motdepasse1",
      confirmation: "motdepasse1",
    });
    expect(isValid(errors)).toBe(true);
  });

  it("connexion : n'impose pas la longueur du mot de passe existant", () => {
    const errors = validateAuthForm("signin", {
      email: "toi@exemple.fr",
      password: "court",
    });
    expect(isValid(errors)).toBe(true);
  });
});
