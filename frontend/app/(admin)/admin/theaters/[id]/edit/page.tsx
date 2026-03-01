/**
 * @file Admin — edit existing theater form
 * @module app/(admin)/admin/theaters/[id]/edit/page
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { apiClient } from '../../../../../../lib/api';
import { ImageUpload } from '../../../../../../components/admin/ImageUpload';
import type { Theater } from '../../../../../../types/theater';

/** Editable subset of Theater fields shown in the form */
interface TheaterFormState {
  name:                string;
  slug:                string;
  screen_size:         string;
  screen_resolution:   string;
  sound_system:        string;
  max_capacity:        number;
  base_capacity:       number;
  base_price:          number;
  short_slot_price:    number;
  extra_adult_price:   number;
  extra_child_price:   number;
  allow_extra_persons: boolean;
  couple_only:         boolean;
  description:         string;
  youtube_url:         string;
  is_active:           boolean;
  sort_order:          number;
}

/** Map a full Theater record to the editable form state */
const theaterToForm = (theater: Theater): TheaterFormState => ({
  name:                theater.name,
  slug:                theater.slug,
  screen_size:         theater.screen_size,
  screen_resolution:   theater.screen_resolution,
  sound_system:        theater.sound_system,
  max_capacity:        theater.max_capacity,
  base_capacity:       theater.base_capacity,
  base_price:          theater.base_price,
  short_slot_price:    theater.short_slot_price,
  extra_adult_price:   theater.extra_adult_price,
  extra_child_price:   theater.extra_child_price,
  allow_extra_persons: theater.allow_extra_persons,
  couple_only:         theater.couple_only,
  description:         theater.description,
  youtube_url:         theater.youtube_url ?? '',
  is_active:           theater.is_active,
  sort_order:          theater.sort_order,
});

export default function EditTheaterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<TheaterFormState | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const { data: theater, isLoading } = useQuery<Theater>({
    queryKey: ['admin', 'theater', params.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Theater }>(
        `/admin/theaters/${params.id}`,
      );
      return res.data.data;
    },
  });

  // Pre-fill form once theater data arrives
  useEffect(() => {
    if (theater) {
      setForm(theaterToForm(theater));
      setImages(theater.images ?? []);
    }
  }, [theater]);

  const setField = <K extends keyof TheaterFormState>(
    key: K,
    value: TheaterFormState[K],
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiClient.put(`/admin/theaters/${params.id}`, { ...form, images });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to update theater.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#D4A017]" />
      </div>
    );
  }

  /** Reusable text/number input */
  const TextField = ({
    label,
    field,
    type = 'text',
    placeholder = '',
  }: {
    label: string;
    field: keyof TheaterFormState;
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
              ? (Number(e.target.value) as TheaterFormState[typeof field])
              : (e.target.value as TheaterFormState[typeof field]),
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
          Edit Theater
        </h1>
        <p className="text-[#888] text-sm mt-1">{theater?.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <TextField label="Theater Name *" field="name" />
        <TextField label="URL Slug *" field="slug" />
        <TextField label="YouTube Tour URL" field="youtube_url" placeholder="https://youtu.be/..." />

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Theater Images
          </label>
          <p className="text-xs text-[#666] mb-3">
            First image is used as the main thumbnail. Upload up to 8 images.
          </p>
          <ImageUpload
            value={images}
            onChange={setImages}
            max={8}
            folder="themagicscreen/theaters"
          />
        </div>

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
            className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 resize-none"
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
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-[#D4A017] text-black hover:bg-[#D4A017]/90'
          }`}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
