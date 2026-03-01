/**
 * @file ReviewCard — displays a single approved customer review
 * @module components/review/ReviewCard
 */
import { formatRelativeTime } from '@/lib/formatters';
import StarRating from './StarRating';
import type { Review } from '@/types/review';
import Image from 'next/image';

/** Props for ReviewCard */
interface ReviewCardProps {
  /** Review data */
  review: Review;
  /** Whether to show theater name (for global reviews page) */
  showTheater?: boolean;
}

/**
 * ReviewCard — cinema-themed review card with star rating, comment, and optional admin reply.
 *
 * @param props - ReviewCardProps
 * @returns A styled card element displaying the customer review
 */
export default function ReviewCard({ review, showTheater = false }: ReviewCardProps) {
  const initials = review.customer_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="cinema-card p-5 flex flex-col gap-4 h-full">
      {/* Header: avatar + name + date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar circle with initials */}
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-accent">{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{review.customer_name}</p>
            {showTheater && (
              <p className="text-xs text-muted-foreground">Theater #{review.theater_id}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(review.created_at)}
        </span>
      </div>

      {/* Star rating */}
      <StarRating value={review.rating} readOnly size={16} />

      {/* Review comment */}
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}

      {/* Optional photo */}
      {review.photo_url && (
        <div className="relative h-32 w-full rounded-lg overflow-hidden">
          <Image
            src={review.photo_url}
            alt="Review photo"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      )}

      {/* Admin reply */}
      {review.admin_reply && (
        <div className="border-t border-border/50 pt-3">
          <p className="text-xs font-semibold text-accent mb-1">The Magic Screen Response</p>
          <p className="text-xs text-muted-foreground italic">{review.admin_reply}</p>
        </div>
      )}
    </div>
  );
}
