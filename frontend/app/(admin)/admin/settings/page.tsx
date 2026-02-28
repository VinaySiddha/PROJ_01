/**
 * @file Admin settings page — manage site-wide configuration key/value pairs
 * @module app/(admin)/admin/settings/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle, Settings } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

/** Setting field definition for the form */
interface SettingField {
  key: string;
  label: string;
  description: string;
  type?: 'text' | 'number' | 'textarea' | 'url';
}

/** Grouped setting sections */
interface SettingSection {
  title: string;
  fields: SettingField[];
}

/** All editable settings, grouped by section */
const SETTING_SECTIONS: SettingSection[] = [
  {
    title: 'Business Info',
    fields: [
      { key: 'site_name', label: 'Business Name', description: 'Displayed in browser title and emails' },
      { key: 'support_phone', label: 'Support Phone', description: 'Displayed on Contact page' },
      { key: 'support_email', label: 'Support Email', description: 'Displayed on Contact page' },
      { key: 'whatsapp_number', label: 'WhatsApp Number', description: 'E.164 format, e.g. +919999999999' },
    ],
  },
  {
    title: 'Booking Configuration',
    fields: [
      { key: 'advance_amount', label: 'Advance Amount (₹)', description: 'Total advance collected at booking', type: 'number' },
      { key: 'refund_amount', label: 'Refundable Amount (₹)', description: 'Amount refunded on cancellation', type: 'number' },
      { key: 'cancellation_hours', label: 'Free Cancellation Window (hours)', description: 'Bookings cancelled before this window get a refund', type: 'number' },
    ],
  },
  {
    title: 'Homepage & Branding',
    fields: [
      { key: 'marquee_text', label: 'Marquee Ticker Text', description: 'Scrolling announcement bar on homepage', type: 'textarea' },
      { key: 'homepage_tagline', label: 'Homepage Tagline', description: 'Subtitle under the hero heading' },
    ],
  },
  {
    title: 'Social Links',
    fields: [
      { key: 'instagram_url', label: 'Instagram URL', description: 'Full URL to Instagram profile', type: 'url' },
      { key: 'youtube_url', label: 'YouTube URL', description: 'Full URL to YouTube channel', type: 'url' },
      { key: 'facebook_url', label: 'Facebook URL', description: 'Full URL to Facebook page', type: 'url' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  /** Fetch all settings as key-value map */
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/settings');
      return (res.data as { data: Record<string, string> }).data;
    },
  });

  /** Populate form when data loads */
  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  /** Save all settings */
  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      const payload = Object.entries(updates).map(([key, value]) => ({ key, value }));
      await apiClient.put('/admin/settings', payload);
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#D4A017]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Settings
          </h1>
          <p className="text-[#888] text-sm mt-1">Manage site-wide configuration</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-[#D4A017] text-black hover:bg-[#D4A017]/90'
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

      {/* Sections */}
      {SETTING_SECTIONS.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-sm font-semibold text-[#D4A017] uppercase tracking-wider flex items-center gap-2">
            <Settings size={14} />
            {section.title}
          </h2>
          <div className="space-y-4 pl-5 border-l border-[#D4A017]/20">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-white mb-1">{field.label}</label>
                <p className="text-xs text-[#555] mb-2">{field.description}</p>
                {field.type === 'textarea' ? (
                  <textarea
                    value={settings[field.key] ?? ''}
                    onChange={(e) => setSettings((p) => ({ ...p, [field.key]: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 resize-none"
                  />
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={settings[field.key] ?? ''}
                    onChange={(e) => setSettings((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Save error */}
      {saveMutation.isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to save settings. Please try again.
        </div>
      )}
    </div>
  );
}
