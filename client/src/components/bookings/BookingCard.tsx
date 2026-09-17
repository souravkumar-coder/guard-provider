import { useState } from 'react';
import { CalendarDays, Check, Clock, MapPin, Star, X } from 'lucide-react';
import type { BookingDto } from '@guard-provider/shared';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BookingStatusBadge } from '@/components/ui/StatusBadge';
import { RatingStars } from '@/components/ui/RatingStars';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { formatDate, formatDuration } from '@/lib/utils';

interface BookingCardProps {
  booking: BookingDto;
  perspective: 'customer' | 'guard';
  onChanged?: () => void;
}

export function BookingCard({ booking, perspective, onChanged }: BookingCardProps) {
  const toast = useToast();
  const [busy, setBusy] = useState<'complete' | 'cancel' | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const otherParty = perspective === 'guard' ? booking.customer : booking.guard;
  const isGuard = perspective === 'guard';

  const updateStatus = async (action: 'complete' | 'cancel') => {
    setBusy(action);
    try {
      await api.patch(`/bookings/${booking.id}/status`, {
        status: action === 'complete' ? 'completed' : 'cancelled',
      });
      toast.success(action === 'complete' ? 'Booking marked as completed.' : 'Booking cancelled.');
      onChanged?.();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Action failed. Please try again.');
    } finally {
      setBusy(null);
      setCancelOpen(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={otherParty.name} size="md" src={otherParty.avatarUrl} />
          <div>
            <p className="text-sm font-bold text-slate-900">{otherParty.name}</p>
            <p className="text-xs text-slate-400">
              {isGuard ? 'Customer' : 'Security professional'}
            </p>
          </div>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-bold text-brand-900">{booking.service.name}</p>
        <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-slate-600 sm:grid-cols-3">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <dt className="sr-only">Scheduled for</dt>
            <dd>{formatDate(booking.scheduledDate)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <dt className="sr-only">Duration</dt>
            <dd>{formatDuration(booking.durationHours)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <dt className="sr-only">Location</dt>
            <dd className="truncate">{booking.location}</dd>
          </div>
        </dl>
      </div>

      {booking.status === 'cancelled' && booking.cancelReason && (
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          <span className="font-semibold">Cancelled:</span> {booking.cancelReason}
        </p>
      )}

      {booking.review && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
          <div className="flex items-center gap-2">
            <RatingStars value={booking.review.rating} />
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
              <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden />
              Customer review
            </span>
          </div>
          <p className="mt-1.5 text-sm italic leading-relaxed text-slate-600">“{booking.review.comment}”</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2.5">
        {booking.status === 'confirmed' && (
          <>
            <Button
              size="sm"
              variant="outline"
              icon={<X className="size-3.5" />}
              loading={busy === 'cancel'}
              disabled={busy !== null}
              onClick={() => setCancelOpen(true)}
            >
              Cancel booking
            </Button>
            {isGuard && (
              <Button
                size="sm"
                icon={<Check className="size-3.5" />}
                loading={busy === 'complete'}
                disabled={busy !== null}
                onClick={() => void updateStatus('complete')}
              >
                Mark completed
              </Button>
            )}
          </>
        )}
        {booking.status === 'completed' && !isGuard && !booking.review && (
          <Button size="sm" variant="secondary" icon={<Star className="size-3.5" />} onClick={() => setReviewOpen(true)}>
            Leave a review
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => void updateStatus('cancel')}
        title="Cancel this booking?"
        message={`The ${booking.service.name.toLowerCase()} booking on ${formatDate(booking.scheduledDate)} will be cancelled and the other party will be notified. This cannot be undone.`}
        confirmLabel="Cancel booking"
        danger
        loading={busy === 'cancel'}
      />

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        booking={booking}
        onReviewed={onChanged}
      />
    </div>
  );
}
