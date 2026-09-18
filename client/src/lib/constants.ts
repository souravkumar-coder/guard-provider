import type {
  AvailabilityStatus,
  BookingStatus,
  RequestStatus,
  VerificationStatus,
} from '@guard-provider/shared';
import type { BadgeVariant } from '@/components/ui/Badge';

/* ── Status presentation ──────────────────────────────────── */

export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'amber' },
  accepted: { label: 'Accepted', variant: 'green' },
  rejected: { label: 'Rejected', variant: 'red' },
  cancelled: { label: 'Cancelled', variant: 'gray' },
};

export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Confirmed', variant: 'blue' },
  completed: { label: 'Completed', variant: 'green' },
  cancelled: { label: 'Cancelled', variant: 'gray' },
};

export const VERIFICATION_STATUS_META: Record<
  VerificationStatus,
  { label: string; variant: BadgeVariant }
> = {
  unverified: { label: 'Unverified', variant: 'gray' },
  pending: { label: 'Awaiting review', variant: 'amber' },
  verified: { label: 'Verified', variant: 'green' },
  rejected: { label: 'Rejected', variant: 'red' },
};

export const AVAILABILITY_META: Record<
  AvailabilityStatus,
  { label: string; dot: string; variant: BadgeVariant }
> = {
  available: { label: 'Available now', dot: 'bg-emerald-500', variant: 'green' },
  on_duty: { label: 'On duty', dot: 'bg-amber-500', variant: 'amber' },
  unavailable: { label: 'Unavailable', dot: 'bg-slate-400', variant: 'gray' },
};

/* ── Filter options ───────────────────────────────────────── */

export const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Any experience' },
  { value: '2', label: '2+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
];

export const AVAILABILITY_FILTER_OPTIONS = [
  { value: '', label: 'Any availability' },
  { value: 'available', label: 'Available now' },
  { value: 'on_duty', label: 'On duty' },
  { value: 'unavailable', label: 'Unavailable' },
];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'rate_asc', label: 'Rate: low to high' },
  { value: 'rate_desc', label: 'Rate: high to low' },
];

export const DURATION_OPTIONS = [
  { value: '4', label: '4 hours' },
  { value: '6', label: '6 hours' },
  { value: '8', label: '8 hours' },
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
];

/** Demo accounts seeded by the API (see server/src/data/seed.ts). */
export const DEMO_ACCOUNTS = [
  { roleLabel: 'Customer', email: 'anita.desai@demo.in', icon: 'user' },
  { roleLabel: 'Guard', email: 'vikram.rathore@demo.in', icon: 'shield' },
  { roleLabel: 'Admin', email: 'admin@guardprovider.demo', icon: 'settings' },
] as const;

export const DEMO_PASSWORD_HINT = 'Password123!';
