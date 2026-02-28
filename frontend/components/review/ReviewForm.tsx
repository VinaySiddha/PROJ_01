/**
 * @file ReviewForm — token-based review submission form
 * @module components/review/ReviewForm
 */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReviewSchema } from '@/lib/validators';
import type { ReviewFormValues } from '@/lib/validators';
import StarRating from './StarRating';
import { Send, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

/** Props for ReviewForm */
interface ReviewFormProps {
  /** JWT token from review request link */
  token: string;
  /** Theater name to display */
  theaterName: string;
  /** Called after successful submission */
  onSuccess: () => void;
}

/**
 * ReviewForm — collects star rating and comment, submits via token-based API.
 *
 * @param props - ReviewFormProps
 * @returns A form for submitting a star rating and written review comment
 */
export default function ReviewForm({ token, theaterName, onSuccess }: ReviewFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post('/reviews/submit', { ...data, token });
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Theater name display */}
      <p className="text-muted-foreground text-sm">
        Share your experience at{' '}
        <span className="text-foreground font-semibold">{theaterName}</span>
      </p>

      {/* Star rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Your Rating *</label>
        <StarRating
          value={rating}
          onChange={(v) => setValue('rating', v, { shouldValidate: true })}
          size={32}
        />
        {errors.rating && (
          <p className="text-xs text-destructive">{errors.rating.message}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium text-foreground">
          Your Review
        </label>
        <textarea
          id="comment"
          {...register('comment')}
          rows={4}
          placeholder="Tell others about your experience..."
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
        />
        {errors.comment && (
          <p className="text-xs text-destructive">{errors.comment.message}</p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting}
        className="btn-gold w-full flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send size={16} /> Submit Review
          </>
        )}
      </button>
    </form>
  );
}
