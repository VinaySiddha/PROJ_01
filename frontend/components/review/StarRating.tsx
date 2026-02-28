/**
 * @file StarRating — interactive or display star rating component
 * @module components/review/StarRating
 */
'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

/** Props for StarRating component */
interface StarRatingProps {
  /** Current rating value (1-5) */
  value: number;
  /** Called when user selects a rating (only in interactive mode) */
  onChange?: (rating: number) => void;
  /** Size of the stars in pixels */
  size?: number;
  /** Read-only display mode */
  readOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StarRating — renders 5 stars, interactive or display-only.
 * In interactive mode, hovering highlights stars and clicking sets value.
 * In display mode, shows fill based on the rounded value.
 *
 * @param props - StarRatingProps
 * @returns A row of 5 star buttons (interactive) or decorative stars (read-only)
 */
export default function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
  className = '',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);

  const displayValue = hovered || value;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role={readOnly ? 'img' : 'group'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-transform ${
            !readOnly ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          aria-label={readOnly ? undefined : `Rate ${star} stars`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= displayValue
                ? 'fill-accent text-accent'
                : 'fill-transparent text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
