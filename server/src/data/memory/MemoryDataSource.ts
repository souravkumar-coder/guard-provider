import { createId } from '../../utils/ids.js';
import type {
  AppNotification,
  Booking,
  BookingStatus,
  CustomerProfile,
  GuardProfile,
  RequestStatus,
  Review,
  Service,
  ServiceRequest,
  VerificationRecord,
  VerificationStatus,
} from '@guard-provider/shared';
import type {
  BookingRepository,
  CustomerProfileRepository,
  DataSource,
  GuardProfileRepository,
  NotificationRepository,
  NewEntity,
  NewUserInput,
  RequestRepository,
  ReviewRepository,
  ServiceRepository,
  StoredUser,
  UserRepository,
  VerificationRepository,
} from '../DataSource.js';

/**
 * In-memory `DataSource` — zero-config persistence for development and demos.
 * Data resets on restart; `SEED_DEMO_DATA=true` repopulates it at boot.
 */
class MemoryUserRepository implements UserRepository {
  constructor(private store: MemoryStore) {}

  async create(input: NewUserInput): Promise<StoredUser> {
    const user: StoredUser = { ...input, id: input.id ?? createId('usr'), createdAt: input.createdAt ?? new Date().toISOString() };
    this.store.users.push(user);
    return user;
  }
  async findById(id: string): Promise<StoredUser | null> {
    return this.store.users.find((u) => u.id === id) ?? null;
  }
  async findByEmail(email: string): Promise<StoredUser | null> {
    const needle = email.trim().toLowerCase();
    return this.store.users.find((u) => u.email.toLowerCase() === needle) ?? null;
  }
  async update(
    id: string,
    patch: Partial<Pick<StoredUser, 'name' | 'phone' | 'avatarUrl'>>,
  ): Promise<StoredUser | null> {
    const user = this.store.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, patch);
    return user;
  }
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const user = this.store.users.find((u) => u.id === id);
    if (user) user.passwordHash = passwordHash;
  }
  async list(filter: { role?: StoredUser['role']; search?: string }): Promise<StoredUser[]> {
    let rows = [...this.store.users];
    if (filter.role) rows = rows.filter((u) => u.role === filter.role);
    if (filter.search) {
      const needle = filter.search.toLowerCase();
      rows = rows.filter(
        (u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle),
      );
    }
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async counts() {
    const byRole = { customer: 0, guard: 0, admin: 0 } as Record<StoredUser['role'], number>;
    for (const u of this.store.users) byRole[u.role] += 1;
    return { total: this.store.users.length, byRole };
  }
}

class MemoryCustomerProfileRepository implements CustomerProfileRepository {
  constructor(private store: MemoryStore) {}

  async create(input: CustomerProfile) {
    this.store.customerProfiles.push(input);
    return input;
  }
  async findByUserId(userId: string) {
    return this.store.customerProfiles.find((p) => p.userId === userId) ?? null;
  }
  async update(userId: string, patch: Partial<Omit<CustomerProfile, 'userId'>>) {
    const profile = this.store.customerProfiles.find((p) => p.userId === userId);
    if (!profile) return null;
    Object.assign(profile, patch);
    return profile;
  }
}

class MemoryGuardProfileRepository implements GuardProfileRepository {
  constructor(private store: MemoryStore) {}

  async create(input: NewEntity<GuardProfile>) {
    const profile: GuardProfile = { ...input, id: input.id ?? createId('grd'), createdAt: input.createdAt ?? new Date().toISOString() };
    this.store.guardProfiles.push(profile);
    return profile;
  }
  async findById(id: string) {
    return this.store.guardProfiles.find((g) => g.id === id) ?? null;
  }
  async findByUserId(userId: string) {
    return this.store.guardProfiles.find((g) => g.userId === userId) ?? null;
  }
  async update(id: string, patch: Partial<Omit<GuardProfile, 'id' | 'userId'>>) {
    const profile = this.store.guardProfiles.find((g) => g.id === id);
    if (!profile) return null;
    Object.assign(profile, patch);
    return profile;
  }
  async list() {
    return [...this.store.guardProfiles];
  }
  async countsByVerification() {
    const counts = { unverified: 0, pending: 0, verified: 0, rejected: 0 } as Record<
      VerificationStatus,
      number
    >;
    for (const g of this.store.guardProfiles) counts[g.verificationStatus] += 1;
    return counts;
  }
}

class MemoryServiceRepository implements ServiceRepository {
  constructor(private store: MemoryStore) {}

  async list() {
    return [...this.store.services];
  }
  async findById(id: string) {
    return this.store.services.find((s) => s.id === id) ?? null;
  }
  async saveAll(services: Service[]) {
    this.store.services = [...services];
  }
}

class MemoryRequestRepository implements RequestRepository {
  constructor(private store: MemoryStore) {}

  async create(input: NewEntity<ServiceRequest>) {
    const request: ServiceRequest = { ...input, id: input.id ?? createId('req'), createdAt: input.createdAt ?? new Date().toISOString() };
    this.store.requests.push(request);
    return request;
  }
  async findById(id: string) {
    return this.store.requests.find((r) => r.id === id) ?? null;
  }
  async update(id: string, patch: Partial<Omit<ServiceRequest, 'id'>>) {
    const request = this.store.requests.find((r) => r.id === id);
    if (!request) return null;
    Object.assign(request, patch);
    return request;
  }
  async listByCustomer(customerId: string) {
    return this.store.requests
      .filter((r) => r.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listByGuard(guardId: string) {
    return this.store.requests
      .filter((r) => r.guardId === guardId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listAll() {
    return [...this.store.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async countsByStatus() {
    const counts = { pending: 0, accepted: 0, rejected: 0, cancelled: 0 } as Record<
      RequestStatus,
      number
    >;
    for (const r of this.store.requests) counts[r.status] += 1;
    return counts;
  }
}

class MemoryBookingRepository implements BookingRepository {
  constructor(private store: MemoryStore) {}

  async create(input: NewEntity<Booking>) {
    const booking: Booking = { ...input, id: input.id ?? createId('bkg'), createdAt: input.createdAt ?? new Date().toISOString() };
    this.store.bookings.push(booking);
    return booking;
  }
  async findById(id: string) {
    return this.store.bookings.find((b) => b.id === id) ?? null;
  }
  async findByRequestId(requestId: string) {
    return this.store.bookings.find((b) => b.requestId === requestId) ?? null;
  }
  async update(id: string, patch: Partial<Omit<Booking, 'id'>>) {
    const booking = this.store.bookings.find((b) => b.id === id);
    if (!booking) return null;
    Object.assign(booking, patch);
    return booking;
  }
  async listByCustomer(customerId: string) {
    return this.store.bookings
      .filter((b) => b.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listByGuard(guardId: string) {
    return this.store.bookings
      .filter((b) => b.guardId === guardId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listAll() {
    return [...this.store.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async countsByStatus() {
    const counts = { confirmed: 0, completed: 0, cancelled: 0 } as Record<BookingStatus, number>;
    for (const b of this.store.bookings) counts[b.status] += 1;
    return counts;
  }
}

class MemoryReviewRepository implements ReviewRepository {
  constructor(private store: MemoryStore) {}

  async create(input: NewEntity<Review>) {
    const review: Review = { ...input, id: input.id ?? createId('rev'), createdAt: input.createdAt ?? new Date().toISOString() };
    this.store.reviews.push(review);
    return review;
  }
  async findByBooking(bookingId: string) {
    return this.store.reviews.find((r) => r.bookingId === bookingId) ?? null;
  }
  async listByGuard(guardId: string) {
    return this.store.reviews
      .filter((r) => r.guardId === guardId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listAll() {
    return [...this.store.reviews];
  }
}

class MemoryNotificationRepository implements NotificationRepository {
  constructor(private store: MemoryStore) {}

  async create(input: NewEntity<AppNotification>) {
    const notification: AppNotification = { ...input, id: input.id ?? createId('ntf'), createdAt: input.createdAt ?? new Date().toISOString() };
    this.store.notifications.push(notification);
    return notification;
  }
  async listByUser(userId: string, limit = 50) {
    return this.store.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  async countUnread(userId: string) {
    return this.store.notifications.filter((n) => n.userId === userId && !n.read).length;
  }
  async markRead(userId: string, notificationId: string) {
    const notification = this.store.notifications.find(
      (n) => n.id === notificationId && n.userId === userId,
    );
    if (!notification) return null;
    notification.read = true;
    return notification;
  }
  async markAllRead(userId: string) {
    for (const n of this.store.notifications) {
      if (n.userId === userId) n.read = true;
    }
  }
}

class MemoryVerificationRepository implements VerificationRepository {
  constructor(private store: MemoryStore) {}

  async create(input: NewEntity<VerificationRecord>) {
    const record: VerificationRecord = { ...input, id: input.id ?? createId('ver'), createdAt: input.createdAt ?? new Date().toISOString() };
    this.store.verifications.push(record);
    return record;
  }
  async listByGuard(guardId: string) {
    return this.store.verifications
      .filter((v) => v.guardId === guardId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async listAll() {
    return [...this.store.verifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

class MemoryStore {
  users: StoredUser[] = [];
  customerProfiles: CustomerProfile[] = [];
  guardProfiles: GuardProfile[] = [];
  services: Service[] = [];
  requests: ServiceRequest[] = [];
  bookings: Booking[] = [];
  reviews: Review[] = [];
  notifications: AppNotification[] = [];
  verifications: VerificationRecord[] = [];
}

export class MemoryDataSource implements DataSource {
  readonly kind = 'memory';
  readonly store = new MemoryStore();

  readonly users = new MemoryUserRepository(this.store);
  readonly customerProfiles = new MemoryCustomerProfileRepository(this.store);
  readonly guards = new MemoryGuardProfileRepository(this.store);
  readonly services = new MemoryServiceRepository(this.store);
  readonly requests = new MemoryRequestRepository(this.store);
  readonly bookings = new MemoryBookingRepository(this.store);
  readonly reviews = new MemoryReviewRepository(this.store);
  readonly notifications = new MemoryNotificationRepository(this.store);
  readonly verifications = new MemoryVerificationRepository(this.store);


  async isEmpty(): Promise<boolean> {
    return this.store.users.length === 0;
  }
}
