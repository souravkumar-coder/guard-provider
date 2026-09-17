import { useState } from 'react';
import type { BookingDto } from '@guard-provider/shared';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { Textarea } from '@/components/ui/Textarea';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  booking: BookingDto;
  onReviewed?: () => void;
}

export function ReviewModal({ open, onClose, booking, onReviewed }: ReviewModalProps) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      setError('Choose a star rating first.');
      return;
    }
    if (comment.trim().length < 4) {
      setError('Tell us a little more about the service.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.post(`/bookings/${booking.id}/review`, { rating, comment: comment.trim() });
      toast.success('Thanks! Your review is live.');
      setRating(0);
      setComment('');
      onReviewed?.();
      onClose();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : 'Could not submit the review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Review ${booking.guard.name}`}
      description={`${booking.service.name} · completed service`}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">How was the service?</p>
          <RatingStars value={rating} onChange={setRating} size="lg" />
        </div>
        <Textarea
          label="Your experience"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Punctuality, professionalism, communication…"
          maxLength={600}
        />
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <div className="flex justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} loading={submitting}>
            Submit review
          </Button>
        </div>
      </div>
    </Modal>
  );
}
