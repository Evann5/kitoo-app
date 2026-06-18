import "@testing-library/jest-dom/vitest";

// jsdom n'implémente pas matchMedia ; stub pour les composants qui lisent les
// préférences de mouvement (useReducedMotion) - par défaut : pas de réduction.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom n'implémente pas IntersectionObserver ; stub no-op pour les animations
// d'entrée (framer-motion `whileInView`). Les éléments restent dans le DOM.
if (!("IntersectionObserver" in globalThis)) {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  globalThis.IntersectionObserver =
    IO as unknown as typeof IntersectionObserver;
}
