/**
 * @file Error boundary — shown when an unhandled error occurs
 * @module app/error
 */
'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle size={32} className="text-red-400" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-[#888] max-w-md">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 bg-[#D4A017] text-black font-semibold rounded-xl hover:bg-[#D4A017]/90 transition-colors"
      >
        <RefreshCw size={16} /> Try Again
      </button>
    </div>
  );
}
