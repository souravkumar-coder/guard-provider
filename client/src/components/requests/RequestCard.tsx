import { useState } from 'react';
import { CalendarDays, Check, Clock, MapPin, X } from 'lucide-react';
import type { ServiceRequestDto } from '@guard-provider/shared';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { RequestStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatDuration, timeAgo } from '@/lib/utils';

interface RequestCardProps {
  request: ServiceRequestDto;
  perspective: 'customer' | 'guard';
  onChanged?: () => void;
}

export function RequestCard({ request, perspective, onChanged }: RequestCardProps) {
  const toast = useToast();
  const [busy, setBusy] = useState<'accept' | 'reject' | 'cancel' | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const otherParty = perspective === 'guard' ? request.customer : request.guard;

  const act = async (action: 'accept' | 'reject' | 'cancel', reason?: string) => {
    setBusy(action);
    try {
      if (action === 'accept') {
        await api.patch(`/requests/${request.id}/accept`);
        toast.success('Request accepted — booking created.');
      } else if (action === 'reject') {
        await api.patch(`/requests/${request.id}/reject`, { status: 'rejected', rejectReason: reason ?? '' });
        toast.success('Request declined.');
        setRejectOpen(false);
        setRejectReason('');
      } else {
        await api.patch(`/requests/${request.id}/cancel`);
        toast.success('Request cancelled.');
      }
      onChanged?.();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Action failed. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={otherParty.name} size="md" src={otherParty.avatarUrl} />
          <div>
            <p className="text-sm font-bold text-slate-900">{otherParty.name}</p>
            <p className="text-xs text-slate-400">Requested {timeAgo(request.createdAt)}</p>
          </div>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-bold text-brand-900">{request.service.name}</p>
        <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-slate-600 sm:grid-cols-3">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <dt className="sr-only">Date</dt>
            <dd>{formatDate(request.requestedDate)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <dt className="sr-only">Duration</dt>
            <dd>{formatDuration(request.durationHours)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <dt className="sr-only">Location</dt>
            <dd className="truncate">{request.location}</dd>
          </div>
        </dl>
        {request.requirements && (
          <p className="mt-2.5 border-t border-slate-200 pt-2.5 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-700">Requirements: </span>
            {request.requirements}
          </p>
        )}
      </div>

      {request.status === 'rejected' && request.rejectReason && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span className="font-semibold">Declined:</span> {request.rejectReason}
        </p>
      )}

      {request.status === 'pending' && (
        <div className="mt-4 flex flex-wrap justify-end gap-2.5">
          {perspective === 'guard' ? (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={<X className="size-3.5" />}
                loading={busy === 'reject'}
                disabled={busy !== null}
                onClick={() => setRejectOpen(true)}
              >
                Decline
              </Button>
              <Button
                size="sm"
                icon={<Check className="size-3.5" />}
                loading={busy === 'accept'}
                disabled={busy !== null}
                onClick={() => void act('accept')}
              >
                Accept &amp; create booking
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="danger-outline"
              icon={<X className="size-3.5" />}
              loading={busy === 'cancel'}
              disabled={busy !== null}
              onClick={() => {
                if (window.confirm('Cancel this pending request? The guard will be notified.')) {
                  void act('cancel');
                }
              }}
            >
              Cancel request
            </Button>
          )}
        </div>
      )}

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Decline request"
        description="Let the customer know why (optional)"
      >
        <Textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Already committed on that date."
          maxLength={300}
        />
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={busy !== null}>
            Back
          </Button>
          <Button variant="danger" loading={busy === 'reject'} onClick={() => void act('reject', rejectReason)}>
            Decline request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
