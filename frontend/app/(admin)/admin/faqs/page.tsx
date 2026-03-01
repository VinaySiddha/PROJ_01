/**
 * @file Admin FAQ editor — manage FAQ questions and answers shown on the public site
 * @module app/(admin)/admin/faqs/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Save,
  Loader2,
  CheckCircle,
  Plus,
  Trash2,
  GripVertical,
  HelpCircle,
} from 'lucide-react';
import { apiClient } from '../../../../lib/api';

interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  { q: 'What is a private theater?', a: 'A private theater is an exclusively booked screening room for just you and your guests.' },
  { q: 'What is the advance payment?', a: 'We charge ₹700 as advance to confirm your booking.' },
];

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/settings');
      return (res.data as { data: Record<string, string> }).data;
    },
  });

  useEffect(() => {
    if (!data) return;
    if (data['faqs']) {
      try {
        setFaqs(JSON.parse(data['faqs']) as FaqItem[]);
      } catch {
        setFaqs(DEFAULT_FAQS);
      }
    } else {
      setFaqs(DEFAULT_FAQS);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (items: FaqItem[]) => {
      await apiClient.put('/admin/settings', [
        { key: 'faqs', value: JSON.stringify(items) },
      ]);
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const addFaq = () => {
    setFaqs((prev) => [...prev, { q: '', a: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
    setFaqs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index]!, [field]: value };
      return updated;
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFaqs((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index]!, arr[index - 1]!];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    setFaqs((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1]!, arr[index]!];
      return arr;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#D4A017]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            FAQ Manager
          </h1>
          <p className="text-[#888] text-sm mt-1">
            {faqs.length} question{faqs.length !== 1 ? 's' : ''} · Changes appear on the public FAQ page instantly after saving
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[#D4A017]/40 text-[#D4A017] hover:bg-[#D4A017]/10 transition-all"
          >
            <Plus size={15} /> Add Question
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate(faqs)}
            disabled={saveMutation.isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
              saved ? 'bg-green-500 text-white' : 'bg-[#D4A017] text-black hover:bg-[#D4A017]/90'
            }`}
          >
            {saveMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : saved ? (
              <CheckCircle size={15} />
            ) : (
              <Save size={15} />
            )}
            {saved ? 'Saved!' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {faqs.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 rounded-2xl border border-dashed border-white/10 text-center">
          <HelpCircle size={40} className="text-[#333]" />
          <p className="text-[#555]">No FAQs yet. Click &quot;Add Question&quot; to get started.</p>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-[#1A1A1A] overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/2">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="text-[#555] hover:text-white disabled:opacity-20 transition-colors leading-none"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === faqs.length - 1}
                  className="text-[#555] hover:text-white disabled:opacity-20 transition-colors leading-none"
                  title="Move down"
                >
                  ▼
                </button>
              </div>
              <GripVertical size={14} className="text-[#333]" />
              <span className="text-xs text-[#555] font-mono">Q{i + 1}</span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="p-1.5 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Question */}
              <div>
                <label className="block text-xs font-medium text-[#D4A017] mb-1 uppercase tracking-wider">
                  Question
                </label>
                <input
                  type="text"
                  value={item.q}
                  onChange={(e) => updateFaq(i, 'q', e.target.value)}
                  placeholder="e.g. What is the cancellation policy?"
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#333]"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-medium text-[#555] mb-1 uppercase tracking-wider">
                  Answer
                </label>
                <textarea
                  value={item.a}
                  onChange={(e) => updateFaq(i, 'a', e.target.value)}
                  placeholder="Type the answer here..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 resize-none placeholder:text-[#333]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add button at bottom */}
      {faqs.length > 0 && (
        <button
          type="button"
          onClick={addFaq}
          className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-[#555] hover:text-white hover:border-[#D4A017]/30 transition-all text-sm flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Another Question
        </button>
      )}

      {/* Error */}
      {saveMutation.isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to save FAQs. Please try again.
        </div>
      )}
    </div>
  );
}
