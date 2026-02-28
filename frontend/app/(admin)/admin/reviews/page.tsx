/**
 * @file Admin reviews moderation — approve or reject pending customer reviews
 * @module app/(admin)/admin/reviews/page
 */
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, Loader2, MessageSquare } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import { formatRelativeTime } from '../../../../lib/formatters';

/** Status filter tabs */
const STATUS_TABS = ['pending', 'approved', 'rejected'] as const;
type StatusTab = typeof STATUS_TABS[number];

/** Fetch reviews for admin */
function useAdminReviews(status: StatusTab, page: number) {
  return useQuery({
    queryKey: ['admin', 'reviews', status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20', status });
      const res = await apiClient.get(`/admin/reviews?${params.toString()}`);
      return res.data as { data: Record<string, unknown>[]; pagination: Record<string, number> };
    },
  });
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusTab>('pending');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminReviews(status, page);

  /** Approve a review */
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/reviews/${id}/approve`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  /** Reject a review */
  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/reviews/${id}/reject`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  const reviews = data?.data ?? [];
  const total = data?.pagination?.['total'] ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Reviews
        </h1>
        <p className="text-[#888] text-sm mt-1">Moderate customer reviews before they appear publicly</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setStatus(tab); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              status === tab
                ? 'bg-[#D4A017] text-black'
                : 'border border-white/10 text-[#888] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#D4A017]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-[#1A1A1A] text-[#888]">
          <MessageSquare size={32} className="text-[#D4A017]/30 mb-3" />
          <p>No {status} reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review['id'] as string}
              className="p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Customer + theater + time */}
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="font-medium text-white">
                      {review['customerName'] as string ?? review['customer_name'] as string}
                    </span>
                    <span className="text-xs text-[#888] px-2 py-0.5 bg-white/5 rounded-full">
                      {review['theaterName'] as string ?? `Theater #${review['theater_id'] as string}`}
                    </span>
                    <span className="text-xs text-[#555]">
                      {formatRelativeTime(review['createdAt'] as string ?? review['created_at'] as string)}
                    </span>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: review['rating'] as number }).map((_, i) => (
                      <Star key={i} size={14} className="text-[#D4A017] fill-[#D4A017]" />
                    ))}
                    {Array.from({ length: 5 - (review['rating'] as number) }).map((_, i) => (
                      <Star key={i} size={14} className="text-[#888]" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-[#888] leading-relaxed">
                    &ldquo;{review['comment'] as string}&rdquo;
                  </p>
                </div>

                {/* Action buttons — only shown for pending reviews */}
                {status === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(review['id'] as string)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50"
                    >
                      {approveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectMutation.mutate(review['id'] as string)}
                      disabled={rejectMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50"
                    >
                      {rejectMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-between items-center text-sm">
          <p className="text-[#888]">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage(page - 1)} disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-white/10 text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors text-xs">
              ← Prev
            </button>
            <button type="button" onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 rounded-xl border border-white/10 text-[#888] hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors text-xs">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
