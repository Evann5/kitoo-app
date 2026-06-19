"use client";

import { useEffect } from "react";

/**
 * Masque la barre de navigation flottante (persistante dans le layout racine)
 * tant qu'elle est montée — utilisé pendant l'onboarding (consentement RGPD),
 * pour que la barre n'apparaisse qu'une fois dans l'app. Pose un attribut sur
 * `<html>` ciblé par une règle CSS (`html[data-onboarding] [data-app-nav]`).
 */
export function HideTabBar() {
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-onboarding", "");
    return () => el.removeAttribute("data-onboarding");
  }, []);
  return null;
}

export default HideTabBar;
