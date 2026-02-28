/**
 * hooks/useAuth.ts
 * Authentication hook that wraps the Zustand authStore and the API calls
 * needed for OTP-based phone authentication.
 *
 * Flow:
 *   1. sendOtp(phone)     → POST /api/auth/send-otp
 *   2. login(phone, otp)  → POST /api/auth/verify-otp → stores JWT → hydrates store
 *   3. logout()           → clears JWT + store
 */
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AuthCustomer } from '@/store/authStore';
import type { ApiSuccessResponse } from '@/types/api';

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

/** Shape of the data object returned by POST /api/auth/send-otp */
interface SendOtpResponseData {
  message: string;
}

/** Shape of the data object returned by POST /api/auth/verify-otp */
interface VerifyOtpResponseData {
  token: string;           // JWT for subsequent authenticated requests
  customer: AuthCustomer;  // Minimal customer identity
}

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------

/** Key under which the customer JWT is stored in localStorage */
const TOKEN_KEY = 'cinenest_token';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides OTP-based authentication actions and current auth state.
 *
 * @returns sendOtp, login, logout, isAuthenticated, customer, isLoading, error
 */
export const useAuth = () => {
  const { customer, isAuthenticated, setCustomer, clearCustomer } = useAuthStore();

  // Shared loading / error state for all async operations in this hook
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // sendOtp
  // ---------------------------------------------------------------------------

  /**
   * Request a one-time password to be sent to the given phone number via SMS.
   * @param phone - Indian mobile number (with or without +91 prefix)
   * @returns true on success, false on failure (error is set in state)
   */
  const sendOtp = useCallback(async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post<ApiSuccessResponse<SendOtpResponseData>>(
        '/auth/send-otp',
        { phone },
      );
      return true;
    } catch (err) {
      // Extract a human-readable message from whatever shape the error takes
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------

  /**
   * Verify the OTP and, on success, persist the JWT and hydrate the auth store.
   * @param phone - The phone number used in sendOtp
   * @param otp   - The 6-digit code received by the customer
   * @returns true on success, false on failure
   */
  const login = useCallback(
    async (phone: string, otp: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<ApiSuccessResponse<VerifyOtpResponseData>>(
          '/auth/verify-otp',
          { phone, otp },
        );

        const { token, customer: customerData } = response.data.data;

        // Persist the JWT so the Axios request interceptor can attach it
        // to all subsequent requests automatically
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
        }

        // Hydrate the in-memory auth store so UI components react immediately
        setCustomer(customerData);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'OTP verification failed';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setCustomer],
  );

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------

  /**
   * Clear the customer's session — removes the JWT from localStorage and
   * resets the auth store so all protected UI re-renders immediately.
   */
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    clearCustomer();
    // Reset any lingering error from a previous auth attempt
    setError(null);
  }, [clearCustomer]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    /** Currently authenticated customer, or null */
    customer,
    /** True when a valid customer session exists */
    isAuthenticated,
    /** True while any async auth operation is in progress */
    isLoading,
    /** Human-readable error message from the last failed operation, or null */
    error,
    /** Send an OTP SMS to the given phone number */
    sendOtp,
    /** Verify the OTP and establish a session */
    login,
    /** Destroy the current session */
    logout,
  } as const;
};
