/**
 * @file Customer login page — WhatsApp OTP authentication
 * @module app/(auth)/my-bookings/login/page
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { MessageCircle, Loader2, ChevronRight } from 'lucide-react';

/** Two-step flow state type */
type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, login, isLoading, error } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setLocalError('Please enter a valid 10-digit phone number.');
      return;
    }
    setLocalError(null);
    const formattedPhone = `+91${digits.slice(-10)}`;
    const success = await sendOtp(formattedPhone);
    if (success) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setLocalError('Please enter the 6-digit OTP.');
      return;
    }
    setLocalError(null);
    const digits = phone.replace(/\D/g, '');
    const formattedPhone = `+91${digits.slice(-10)}`;
    const success = await login(formattedPhone, otp);
    if (success) {
      router.push('/my-bookings');
    }
  };

  const displayError = localError ?? error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0D0D0D]">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#D4A017]/15 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-[#D4A017]" />
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {step === 'phone' ? 'Sign In' : 'Enter OTP'}
          </h1>
          <p className="text-[#888] text-sm mt-2">
            {step === 'phone'
              ? 'Enter your phone number to receive an OTP via WhatsApp.'
              : `Enter the 6-digit OTP sent to +91 ${phone.replace(/\D/g, '').slice(-10)}`}
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] space-y-4">
          {step === 'phone' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-[#2A2A2A] text-[#888] text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="98765 43210"
                    maxLength={10}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSendOtp();
                    }}
                    className="flex-1 rounded-r-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555]"
                  />
                </div>
              </div>

              {displayError && (
                <p className="text-xs text-red-400">{displayError}</p>
              )}

              <button
                type="button"
                onClick={() => void handleSendOtp()}
                disabled={isLoading || phone.replace(/\D/g, '').length < 10}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Send OTP <ChevronRight size={16} />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleVerifyOtp();
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555] placeholder:text-base placeholder:tracking-normal"
                />
              </div>

              {displayError && (
                <p className="text-xs text-red-400">{displayError}</p>
              )}

              <button
                type="button"
                onClick={() => void handleVerifyOtp()}
                disabled={isLoading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setLocalError(null);
                  setOtp('');
                }}
                className="w-full text-center text-sm text-[#888] hover:text-white transition-colors py-2"
              >
                ← Change phone number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
