import type { BookingStatus, RequestStatus, VerificationStatus } from '@guard-provider/shared';
import { Badge } from './Badge';
import {
  BOOKING_STATUS_META,
  REQUEST_STATUS_META,
  VERIFICATION_STATUS_META,
} from '@/lib/constants';

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const meta = REQUEST_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const meta = BOOKING_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const meta = VERIFICATION_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
