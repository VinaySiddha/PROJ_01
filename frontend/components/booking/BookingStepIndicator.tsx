/**
 * @file BookingStepIndicator.tsx
 * @description Multi-step progress indicator for the The Magic Screen booking flow.
 * Server Component — purely presentational, driven by currentStep prop.
 */

import { Check } from 'lucide-react';

interface BookingStepIndicatorProps {
  /** The currently active step (1-based). */
  currentStep: number;
  /** Ordered array of step labels matching the booking flow. */
  steps: string[];
}

interface StepCircleProps {
  stepNumber: number;
  status: 'complete' | 'current' | 'upcoming';
}

/** Renders the numbered circle or checkmark for a step. */
function StepCircle({ stepNumber, status }: StepCircleProps) {
  if (status === 'complete') {
    return (
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D4A017] text-black">
        <Check className="w-4 h-4 strokeWidth-3" />
      </span>
    );
  }
  if (status === 'current') {
    return (
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D4A017] text-black text-xs font-bold ring-4 ring-[#D4A017]/30">
        {stepNumber}
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2A2A2A] border border-white/20 text-gray-500 text-xs font-medium">
      {stepNumber}
    </span>
  );
}

/**
 * Horizontal step indicator for the booking wizard.
 * On small screens falls back to a compact "Step X of Y" text badge.
 */
export function BookingStepIndicator({ currentStep, steps }: BookingStepIndicatorProps) {
  return (
    <nav aria-label="Booking progress">
      {/* Mobile: compact label */}
      <div className="flex sm:hidden items-center justify-between px-4 py-3 rounded-lg bg-[#1A1A1A] border border-white/10">
        <span className="text-sm font-medium text-white">{steps[currentStep - 1]}</span>
        <span className="text-sm text-gray-400">
          Step {currentStep} of {steps.length}
        </span>
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden sm:flex items-center w-full">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const status: StepCircleProps['status'] =
            stepNumber < currentStep
              ? 'complete'
              : stepNumber === currentStep
              ? 'current'
              : 'upcoming';

          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              {/* Step */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <StepCircle stepNumber={stepNumber} status={status} />
                <span
                  className={`text-[10px] font-medium whitespace-nowrap ${
                    status === 'complete'
                      ? 'text-gray-400'
                      : status === 'current'
                      ? 'text-[#D4A017]'
                      : 'text-gray-600'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connector line — not after the last step */}
              {idx < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-2 mb-5 transition-colors duration-300 ${
                    stepNumber < currentStep ? 'bg-[#D4A017]' : 'bg-white/10'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
