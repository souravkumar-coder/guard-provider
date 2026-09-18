/**
 * Data-access contracts for Guard Provider.
 *
 * The whole API depends only on the `DataSource` interface below — never on a
 * concrete database driver. The shipped implementation is an in-memory store
 * seeded with demo data (`DATA_SOURCE=memory`). To go live with a real
 * database, implement this interface with Prisma/Drizzle/Mongoose and register
 * it in `data/index.ts` — no route or service code changes required.
 */
import type {
  AppNotification,
  AvailabilityStatus,
  Booking,
  BookingStatus,
  CustomerProfile,
  GuardProfile,
  Review,
  RequestStatus,
  Service,
  ServiceRequest,
  UserRole,
  VerificationRecord,
  VerificationStatus,
  User,
} from '@guard-provider/shared';

export interface StoredUser extends User {
  /** Never leave the data layer — services map users via `toPublicUser`. */
  passwordHash: string;
}

/** Entity input that lets the caller (or seeder) pre-set id/createdAt. */
export type NewEntity<T> = Omit<T, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export type NewUserInput = NewEntity<StoredUser>;

export interface UserRepository {
  create(input: NewUserInput): Promise<StoredUser>;
  findById(id: string): Promise<StoredUser | null>;
  findByEmail(email: string): Promise<StoredUser | null>;
  update(
    id: string,
    patch: Partial<Pick<StoredUser, 'name' | 'phone' | 'avatarUrl'>>,
  ): Promise<StoredUser | null>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  list(filter: { role?: UserRole; search?: string }): Promise<StoredUser[]>;
  counts(): Promise<{ total: number; byRole: Record<UserRole, number> }>;
}

export interface CustomerProfileRepository {
  create(input: CustomerProfile): Promise<CustomerProfile>;
  findByUserId(userId: string): Promise<CustomerProfile | null>;
  update(userId: string, patch: Partial<Omit<CustomerProfile, 'userId'>>): Promise<CustomerProfile | null>;
}

export interface GuardProfileRepository {
  create(input: NewEntity<GuardProfile>): Promise<GuardProfile>;
  findById(id: string): Promise<GuardProfile | null>;
  findByUserId(userId: string): Promise<GuardProfile | null>;
  update(id: string, patch: Partial<Omit<GuardProfile, 'id' | 'userId'>>): Promise<GuardProfile | null>;
  list(): Promise<GuardProfile[]>;
  countsByVerification(): Promise<Record<VerificationStatus, number>>;
}

export interface ServiceRepository {
  list(): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  saveAll(services: Service[]): Promise<void>;
}

export interface RequestRepository {
  create(input: NewEntity<ServiceRequest>): Promise<ServiceRequest>;
  findById(id: string): Promise<ServiceRequest | null>;
  update(id: string, patch: Partial<Omit<ServiceRequest, 'id'>>): Promise<ServiceRequest | null>;
  listByCustomer(customerId: string): Promise<ServiceRequest[]>;
  listByGuard(guardId: string): Promise<ServiceRequest[]>;
  listAll(): Promise<ServiceRequest[]>;
  countsByStatus(): Promise<Record<RequestStatus, number>>;
}

export interface BookingRepository {
  create(input: NewEntity<Booking>): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findByRequestId(requestId: string): Promise<Booking | null>;
  update(id: string, patch: Partial<Omit<Booking, 'id'>>): Promise<Booking | null>;
  listByCustomer(customerId: string): Promise<Booking[]>;
  listByGuard(guardId: string): Promise<Booking[]>;
  listAll(): Promise<Booking[]>;
  countsByStatus(): Promise<Record<BookingStatus, number>>;
}

export interface ReviewRepository {
  create(input: NewEntity<Review>): Promise<Review>;
  findByBooking(bookingId: string): Promise<Review | null>;
  listByGuard(guardId: string): Promise<Review[]>;
  listAll(): Promise<Review[]>;
}

export interface NotificationRepository {
  create(input: NewEntity<AppNotification>): Promise<AppNotification>;
  listByUser(userId: string, limit?: number): Promise<AppNotification[]>;
  countUnread(userId: string): Promise<number>;
  markRead(userId: string, notificationId: string): Promise<AppNotification | null>;
  markAllRead(userId: string): Promise<void>;
}

export interface VerificationRepository {
  create(input: NewEntity<VerificationRecord>): Promise<VerificationRecord>;
  listByGuard(guardId: string): Promise<VerificationRecord[]>;
  listAll(): Promise<VerificationRecord[]>;
}

/**
 * Availability is currently derived from `GuardProfile.availability`; the
 * filter helper keeps that logic in one place for future data sources.
 */
export type AvailabilityFilter = AvailabilityStatus | 'any';

export interface DataSource {
  readonly kind: string;
  users: UserRepository;
  customerProfiles: CustomerProfileRepository;
  guards: GuardProfileRepository;
  services: ServiceRepository;
  requests: RequestRepository;
  bookings: BookingRepository;
  reviews: ReviewRepository;
  notifications: NotificationRepository;
  verifications: VerificationRepository;
  /** True when the store has no users yet (used to trigger seeding). */
  isEmpty(): Promise<boolean>;
}
