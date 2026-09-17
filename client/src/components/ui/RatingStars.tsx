import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const SIZE_CLASS = { sm: 'size-3.5', md: 'size-4.5', lg: 'size-7' } as const;

export function RatingStars({ value, onChange, size = 'sm', showValue = false, className }: RatingStarsProps) {
  const interactive = typeof onChange === 'function';
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('inline-flex', onChange && 'gap-0.5')} role={interactive ? 'radiogroup' : undefined} aria-label={interactive ? 'Choose a rating' : `Rated ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(value);
          const Icon = (
            <Star
              className={cn(SIZE_CLASS[size], filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')}
              aria-hidden
            />
          );
          if (!interactive) return <span key={star}>{Icon}</span>;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => onChange(star)}
              className="rounded transition hover:scale-110"
            >
              {Icon}
            </button>
          );
        })}
      </span>
      {showValue && <span className="text-sm font-semibold text-slate-700">{value > 0 ? value.toFixed(1) : 'New'}</span>}
    </span>
  );
}
