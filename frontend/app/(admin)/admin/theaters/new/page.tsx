/**
 * @file Admin — add new theater form
 * @module app/(admin)/admin/theaters/new/page
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { apiClient } from '../../../../../lib/api';

/** Initial form state for a new theater */
const INITIAL_FORM = {
  name:                '',
  slug:                '',
  location_id:         '',
  screen_size:         '150 inch',
  screen_resolution:   '4K',
  sound_system:        '1000W Dolby Atmos',
  max_capacity:        20,
  base_capacity:       4,
  base_price:          1499,
  short_slot_price:    999,
  extra_adult_price:   200,
  extra_child_price:   150,
  allow_extra_persons: true,
  couple_only:         false,
  description:         '',
  is_active:           true,
  sort_order:          0,
  youtube_url:         '',
};

type FormState = typeof INITIAL_FORM;

export default function NewTheaterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Theater name is required.');
      return;
    }
    if (!form.slug.trim()) {
      setError('URL slug is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/admin/theaters', form);
      router.push('/admin/theaters');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to create theater.',
      );
    } finally {
      setLoading(false);
    }
  };

  /** Reusable text / number input row */
  const TextField = ({
    label,
    field,
    type = 'text',
    placeholder = '',
  }: {
    label: string;
    field: keyof FormState;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <input
        type={type}
        value={String(form[field])}
        onChange={(e) =>
          setField(
            field,
            type === 'number'
              ? (Number(e.target.value) as FormState[typeof field])
              : (e.target.value as FormState[typeof field]),
          )
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555]"
      />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[#888] hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Add Theater
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <TextField label="Theater Name *" field="name" placeholder="e.g. Platinum Theatre" />
        <TextField label="URL Slug *" field="slug" placeholder="e.g. platinum-theatre" />
        <TextField label="Location ID *" field="location_id" placeholder="UUID of the location" />
        <TextField label="YouTube Tour URL" field="youtube_url" placeholder="https://youtu.be/..." />

        {/* Tech specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="Screen Size" field="screen_size" />
          <TextField label="Resolution" field="screen_resolution" />
          <TextField label="Sound System" field="sound_system" />
        </div>

        {/* Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Max Capacity" field="max_capacity" type="number" />
          <TextField label="Base Capacity" field="base_capacity" type="number" />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Base Price (₹)" field="base_price" type="number" />
          <TextField label="Short Slot Price (₹)" field="short_slot_price" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Extra Adult Price (₹)" field="extra_adult_price" type="number" />
          <TextField label="Extra Child Price (₹)" field="extra_child_price" type="number" />
        </div>
        <TextField label="Sort Order" field="sort_order" type="number" />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={4}
            placeholder="Describe the theater experience..."
            className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 resize-none placeholder:text-[#555]"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.allow_extra_persons}
              onChange={(e) => setField('allow_extra_persons', e.target.checked)}
              className="accent-[#D4A017] w-4 h-4"
            />
            Allow Extra Persons
          </label>
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.couple_only}
              onChange={(e) => setField('couple_only', e.target.checked)}
              className="accent-[#D4A017] w-4 h-4"
            />
            Couple Only
          </label>
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setField('is_active', e.target.checked)}
              className="accent-[#D4A017] w-4 h-4"
            />
            Active
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Theater
        </button>
      </form>
    </div>
  );
}
