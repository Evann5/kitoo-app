export { ConsentGate } from "./ConsentGate";
export { DeleteAccountDialog } from "./DeleteAccountDialog";
export { grantConsent, revokeConsent, deleteAccount } from "./actions";
export type { ActionResult } from "./actions";
export {
  getActiveConsent,
  hasActiveConsent,
  DATA_PROCESSING,
  type Consent,
} from "./consent";
