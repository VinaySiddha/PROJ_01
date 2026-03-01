/**
 * @file Reviews page — all approved customer reviews with rating summary
 * @module app/(public)/reviews/page
 */
import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import type { Review } from '@/types/review';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Read genuine customer reviews of The Magic Screen private theater experiences in Hyderabad.',
};

async function fetchReviews(page = 1): Promise<{ reviews: Review[]; pagination: unknown }> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';
  try {
    const res = await fetch(`${apiUrl}/reviews?page=${page}&limit=12`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { reviews: [], pagination: null };
    const data = (await res.json()) as { data?: Review[]; pagination?: unknown };
    return { reviews: data.data ?? [], pagination: data.pagination ?? null };
  } catch {
    return { reviews: [], pagination: null };
  }
}

export default async function ReviewsPage() {
  const { reviews } = await fetchReviews();

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : '4.9';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with aggregate */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Customer <span className="text-[#D4A017]">Reviews</span>
          </h1>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={24} className="text-[#D4A017] fill-[#D4A017]" />
            ))}
            <span className="text-3xl font-bold text-white ml-2">{avgRating}</span>
          </div>
          <p className="text-[#888]">
            {reviews.length > 0
              ? `Based on ${reviews.length}+ verified reviews`
              : 'Be the first to leave a review!'}
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <span className="text-5xl">⭐</span>
              <p className="text-[#888] text-lg">No reviews yet.</p>
              <p className="text-[#888] text-sm max-w-sm">
                Book your private theater experience and be the first to share your story!
              </p>
              <Link
                href="/theaters"
                className="mt-2 px-6 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all text-sm"
              >
                Browse Theaters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review) => {
              const initials = review.customer_name
                .split(' ')
                .map((n) => n[0] ?? '')
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={review.id}
                  className="p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] flex flex-col gap-3"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 flex items-center justify-center text-sm font-bold text-[#D4A017] flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{review.customer_name}</p>
                      <p className="text-xs text-[#888]">Verified Guest</p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? 'text-[#D4A017] fill-[#D4A017]'
                            : 'text-[#333] fill-[#333]'
                        }
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-[#888] leading-relaxed flex-1">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}

                  {/* Admin reply */}
                  {review.admin_reply && (
                    <div className="border-t border-white/5 pt-3">
                      <p className="text-xs font-semibold text-[#D4A017] mb-1">
                        The Magic Screen Response
                      </p>
                      <p className="text-xs text-[#888] italic">{review.admin_reply}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
