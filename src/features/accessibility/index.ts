export { AccessibilitySync } from "./AccessibilitySync";
export { AccessibilityToggle } from "./AccessibilityToggle";
export { getAccessibilityPrefs } from "./server";
export { saveAccessibilityPrefs } from "./actions";
export {
  parsePrefs,
  applyPrefsToDocument,
  DEFAULT_PREFS,
  A11Y_STORAGE_KEY,
  ANTI_FLASH_SCRIPT,
  type AccessibilityPrefs,
} from "./prefs";
