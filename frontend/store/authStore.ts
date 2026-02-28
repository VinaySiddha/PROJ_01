/**
 * store/authStore.ts
 * Zustand authentication store for customer UI state.
 *
 * This store holds only in-memory UI state (who is logged in).
 * The actual JWT is stored in localStorage by the useAuth hook — this store
 * is intentionally NOT persisted so that React renders stay consistent with
 * the token's validity without needing rehydration logic here.
 */
import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

/** Minimal customer identity surfaced in UI (name, phone) */
export interface AuthCustomer {
  /** Internal database ID */
  id: string;
  /** Customer's display name */
  name: string;
  /** Verified phone number (E.164 or local format) */
  phone: string;
}

/** All state and actions in the auth store */
export interface AuthStore {
  /** Currently logged-in customer, or null when unauthenticated */
  customer: AuthCustomer | null;

  /**
   * Derived boolean — true when customer is not null.
   * Stored explicitly so components can do a cheap equality check
   * without needing to evaluate `customer !== null` on every render.
   */
  isAuthenticated: boolean;

  /**
   * Persist the customer identity after a successful OTP verification.
   * Sets `isAuthenticated` to true as a side effect.
   */
  setCustomer: (customer: AuthCustomer) => void;

  /**
   * Clear the customer identity (e.g. on logout or token expiry).
   * Sets `isAuthenticated` to false as a side effect.
   */
  clearCustomer: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>()((set) => ({
  customer: null,
  isAuthenticated: false,

  setCustomer: (customer) =>
    set({
      customer,
      isAuthenticated: true,
    }),

  clearCustomer: () =>
    set({
      customer: null,
      isAuthenticated: false,
    }),
}));
