/**
 * @file Admin offers page — create, list, and disable coupon codes
 * @module app/(admin)/admin/offers/page
 */
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, Ban, Loader2, ChevronDown } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import { formatDate, formatCurrency } from '../../../../lib/formatters';

/** Coupon record shape from API */
interface Coupon {
  id: string;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minBookingAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

/** New coupon form state */
interface NewCouponForm {
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minBookingAmount: number;
  maxUses: number;
  expiresAt: string;
}

/** Fetch all coupons */
function useCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/coupons');
      return (res.data as { data: Coupon[] }).data;
    },
  });
}

export default function AdminOffersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<NewCouponForm>({
    code: '',
    discountType: 'flat',
    discountValue: 200,
    minBookingAmount: 0,
    maxUses: 100,
    expiresAt: '',
  });

  const { data: coupons, isLoading } = useCoupons();

  /** Create new coupon */
  const createMutation = useMutation({
    mutationFn: async (data: NewCouponForm) => {
      await apiClient.post('/admin/coupons', data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setShowForm(false);
      setForm({ code: '', discountType: 'flat', discountValue: 200, minBookingAmount: 0, maxUses: 100, expiresAt: '' });
      setError(null);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to create coupon.');
    },
  });

  /** Disable a coupon */
  const disableMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/coupons/${id}/disable`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { setError('Coupon code is required.'); return; }
    if (form.discountValue <= 0) { setError('Discount value must be positive.'); return; }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Offers & Coupons
          </h1>
          <p className="text-[#888] text-sm mt-1">Manage discount codes for customers</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D4A017] text-black font-semibold rounded-xl text-sm hover:bg-[#D4A017]/90 transition-all"
        >
          {showForm ? <ChevronDown size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-6 rounded-2xl border border-[#D4A017]/30 bg-[#1A1A1A] space-y-4"
        >
          <h3 className="font-semibold text-white text-base">New Coupon Code</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-xs text-[#888] mb-1">Coupon Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                placeholder="SAVE200"
                className="w-full rounded-xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5 text-white text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
              />
            </div>

            {/* Discount type */}
            <div>
              <label className="block text-xs text-[#888] mb-1">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as 'flat' | 'percentage' }))}
                className="w-full rounded-xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
              >
                <option value="flat">Flat Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            {/* Discount value */}
            <div>
              <label className="block text-xs text-[#888] mb-1">
                {form.discountType === 'flat' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((p) => ({ ...p, discountValue: Number(e.target.value) }))}
                min={1}
                max={form.discountType === 'percentage' ? 100 : undefined}
                className="w-full rounded-xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
              />
            </div>

            {/* Min booking amount */}
            <div>
              <label className="block text-xs text-[#888] mb-1">Min Booking Amount (₹)</label>
              <input
                type="number"
                value={form.minBookingAmount}
                onChange={(e) => setForm((p) => ({ ...p, minBookingAmount: Number(e.target.value) }))}
                min={0}
                className="w-full rounded-xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
              />
            </div>

            {/* Max uses */}
            <div>
              <label className="block text-xs text-[#888] mb-1">Max Uses (0 = unlimited)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: Number(e.target.value) }))}
                min={0}
                className="w-full rounded-xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
              />
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-xs text-[#888] mb-1">Expires At (optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 [color-scheme:dark]"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#D4A017] text-black font-bold rounded-xl text-sm hover:bg-[#D4A017]/90 transition-all disabled:opacity-60"
          >
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create Coupon
          </button>
        </form>
      )}

      {/* Coupons list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#D4A017]" />
        </div>
      ) : !coupons || coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-[#1A1A1A] text-[#888]">
          <Tag size={32} className="text-[#D4A017]/30 mb-3" />
          <p>No coupon codes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                  <Tag size={16} className="text-[#D4A017]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white tracking-wider">{coupon.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      coupon.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-[#888] mt-0.5">
                    {coupon.discountType === 'flat'
                      ? `${formatCurrency(coupon.discountValue)} off`
                      : `${coupon.discountValue}% off`}
                    {coupon.minBookingAmount > 0 && ` · Min order ${formatCurrency(coupon.minBookingAmount)}`}
                    {coupon.expiresAt && ` · Expires ${formatDate(coupon.expiresAt)}`}
                    {' · '}{coupon.usedCount}/{coupon.maxUses > 0 ? coupon.maxUses : '∞'} used
                  </p>
                </div>
              </div>

              {coupon.isActive && (
                <button
                  type="button"
                  onClick={() => disableMutation.mutate(coupon.id)}
                  disabled={disableMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  {disableMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                  Disable
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
