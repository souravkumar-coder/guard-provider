/**
 * Guard Provider — shared domain contracts.
 *
 * This package is intentionally TYPE-ONLY: it is consumed by both the API
 * server and the React client, so it must never contain runtime code.
 * Always import from it with `import type { ... }`.
 */

/* ── Enums (string unions) ────────────────────────────────── */

export type UserRole = 'customer' | 'guard' | 'admin';

export type AvailabilityStatus = 'available' | 'on_duty' | 'unavailable';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export type NotificationType =
  | 'request_new'
  | 'request_accepted'
  | 'request_rejected'
  | 'booking_update'
  | 'review_new'
  | 'account_update'
  | 'verification_update';

/* ── Core entities ────────────────────────────────────────── */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CustomerProfile {
  userId: string;
  address: string;
  city: string;
}

export interface GuardProfile {
  id: string;
  userId: string;
  title: string;
  about: string;
  city: string;
  serviceArea: string;
  experienceYears: number;
  skills: string[];
  languages: string[];
  serviceIds: string[];
  hourlyRate: number;
  availability: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Icon key resolved to a component by the client (e.g. "shield"). */
  icon: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  /** GuardProfile.id (not the user id). */
  guardId: string;
  serviceId: string;
  /** Date the service is requested for (ISO date or datetime). */
  requestedDate: string;
  durationHours: number;
  location: string;
  requirements: string;
  status: RequestStatus;
  rejectReason: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface Booking {
  id: string;
  requestId: string;
  customerId: string;
  /** GuardProfile.id (not the user id). */
  guardId: string;
  serviceId: string;
  scheduledDate: string;
  durationHours: number;
  location: string;
  requirements: string;
  status: BookingStatus;
  cancelReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  guardId: string;
  /** 1–5 */
  rating: number;
  comment: string;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  guardId: string;
  status: VerificationStatus;
  notes: string;
  documents: string[];
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  /** Optional in-app route, e.g. "/guard/requests". */
  link: string | null;
  createdAt: string;
}

/* ── Composed DTOs returned by the API ────────────────────── */

export type PublicUser = Pick<User, 'id' | 'name' | 'avatarUrl'>;

/** A customer or guard party attached to requests/bookings. */
export interface ActorRef extends PublicUser {
  /** Present when the actor is a guard — used to link to the public profile. */
  guardProfileId?: string;
}

export interface GuardListing extends GuardProfile {
  user: PublicUser;
}

export interface ReviewWithCustomer extends Review {
  customer: PublicUser;
}

export interface ServiceRequestDto extends ServiceRequest {
  service: Service;
  customer: PublicUser;
  guard: ActorRef;
}

export interface BookingDto extends Booking {
  service: Service;
  customer: PublicUser;
  guard: ActorRef;
  review: Review | null;
}

export interface AuthUser extends User {
  customerProfile: CustomerProfile | null;
  guardProfile: GuardProfile | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ── Request payloads ─────────────────────────────────────── */

export type RegisterRole = Extract<UserRole, 'customer' | 'guard'>;

export interface RegisterInput {
  role: RegisterRole;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateOwnUserInput {
  name?: string;
  phone?: string;
  /** Customer-only fields. */
  address?: string;
  city?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateGuardProfileInput {
  title?: string;
  about?: string;
  city?: string;
  serviceArea?: string;
  experienceYears?: number;
  skills?: string[];
  languages?: string[];
  serviceIds?: string[];
  hourlyRate?: number;
  availability?: AvailabilityStatus;
}

export interface CreateRequestInput {
  guardId: string;
  serviceId: string;
  requestedDate: string;
  durationHours: number;
  location: string;
  requirements?: string;
}

export interface RespondRequestInput {
  status: Extract<RequestStatus, 'accepted' | 'rejected'>;
  rejectReason?: string;
}

export interface UpdateBookingStatusInput {
  status: Extract<BookingStatus, 'completed' | 'cancelled'>;
  cancelReason?: string;
}

export interface CreateReviewInput {
  /** 1–5 */
  rating: number;
  comment: string;
}

export interface GuardQuery {
  search?: string;
  location?: string;
  serviceId?: string;
  availability?: AvailabilityStatus;
  minExperience?: number;
  verified?: boolean;
  sort?: 'rating' | 'experience' | 'rate_asc' | 'rate_desc';
  page?: number;
  limit?: number;
}

/* ── Admin payloads ───────────────────────────────────────── */

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  city: string | null;
  /** Guards only — the GuardProfile id used for verification actions. */
  guardProfileId: string | null;
  /** Guards only. */
  verificationStatus: VerificationStatus | null;
  rating: number | null;
}

export interface AdminStats {
  totalUsers: number;
  totalGuards: number;
  totalCustomers: number;
  pendingVerifications: number;
  totalRequests: number;
  requestsByStatus: Record<RequestStatus, number>;
  totalBookings: number;
  bookingsByStatus: Record<BookingStatus, number>;
  completedJobs: number;
}

export interface ServiceBreakdown {
  serviceId: string;
  serviceName: string;
  count: number;
}

export interface TopGuardRow {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
}

export interface PlatformReport {
  requestsByStatus: Record<RequestStatus, number>;
  bookingsByService: ServiceBreakdown[];
  topGuards: TopGuardRow[];
  newUsersLast30Days: number;
}
