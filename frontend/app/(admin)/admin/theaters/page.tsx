/**
 * @file Admin theaters list — manage theater inventory
 * @module app/(admin)/admin/theaters/page
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Edit, Eye, Loader2, Monitor } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/formatters';
import type { Theater } from '../../../../types/theater';

/** TanStack query for the full theater list */
function useAdminTheaters() {
  return useQuery<Theater[]>({
    queryKey: ['admin', 'theaters'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Theater[] }>('/admin/theaters');
      return res.data.data ?? [];
    },
  });
}

export default function AdminTheatersPage() {
  const { data: theaters, isLoading } = useAdminTheaters();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Theaters
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Manage your private theater inventory
          </p>
        </div>
        <Link
          href="/admin/theaters/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-black font-semibold rounded-xl text-sm hover:bg-[#D4A017]/90 transition-all"
        >
          <Plus size={16} /> Add Theater
        </Link>
      </div>

      {/* Theater cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#D4A017]" />
        </div>
      ) : !theaters || theaters.length === 0 ? (
        <div className="text-center py-16 text-[#888] border border-white/10 rounded-xl bg-[#1A1A1A]">
          <Monitor size={32} className="mx-auto mb-2 text-[#888]" />
          <p>No theaters yet.</p>
          <Link
            href="/admin/theaters/new"
            className="mt-4 inline-block text-[#D4A017] hover:underline text-sm"
          >
            Add your first theater
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {theaters.map((theater) => (
            <div
              key={theater.id}
              className="p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/30 transition-all"
            >
              {/* Theater header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {theater.name}
                  </h3>
                  <p className="text-xs text-[#888] mt-0.5">
                    {theater.location?.name ?? '—'}
                  </p>
                </div>
                <span
                  className={`ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    theater.is_active
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {theater.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Specs */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#888] mb-4">
                <span>{theater.screen_size}</span>
                <span>{theater.screen_resolution}</span>
                <span>Up to {theater.max_capacity} guests</span>
                <span className="text-[#D4A017] font-medium">
                  {formatCurrency(theater.base_price)} base
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/theaters/${theater.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#888] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Eye size={12} /> View
                </Link>
                <Link
                  href={`/admin/theaters/${theater.id}/edit`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D4A017]/30 text-xs text-[#D4A017] hover:bg-[#D4A017]/10 transition-colors"
                >
                  <Edit size={12} /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
