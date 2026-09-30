/**
 * PostgreSQL `DataSource` implementation backed by Prisma (driver-adapter mode).
 *
 * Mirrors `MemoryDataSource` semantics exactly (id prefixes, `createdAt`
 * defaults, list ordering, count shapes) so every route/service behaves
 * identically regardless of `DATA_SOURCE`. The mapping layer converts between
 * Prisma rows and the shared domain types — most notably `DateTime <-> ISO
 * string` and `GuardProfile.serviceIds <-> guard_services` join rows.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { config } from '../../config.js';
import { createId } from '../../utils/ids.js';
import type {
  AppNotification,
  AvailabilityStatus,
  Booking,
  BookingStatus,
  CustomerProfile,
  GuardProfile,
  NotificationType,
  RequestStatus,
  Review,
  Service,
  ServiceRequest,
  UserRole,
  VerificationRecord,
  VerificationStatus,
} from '@guard-provider/shared';
import type {
  BookingRepository,
  CustomerProfileRepository,
  DataSource,
  GuardProfileRepository,
  NewEntity,
  NewUserInput,
  NotificationRepository,
  RequestRepository,
  ReviewRepository,
  ServiceRepository,
  StoredUser,
  UserRepository,
  VerificationRepository,
} from '../DataSource.js';

/* ── Shared Prisma client (lazy connection) ───────────────── */

function createClient(): PrismaClient {
  const connectionString = config.databaseUrl;
  if (!connectionString) {
    throw new Error(
      '[guard-provider] DATA_SOURCE=postgres requires DATABASE_URL to be set. See .env.example.',
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/* ── Row → domain mappers ─────────────────────────────────── */

const iso = (d: Date): string => d.toISOString();
const isoOrNull = (d: Date | null): string | null => (d ? d.toISOString() : null);
/** Accept ISO strings (domain) and turn them into Date for Prisma. */
const toDate = (v: string | null | undefined): Date | null | undefined =>
  v === undefined ? undefined : v === null ? null : new Date(v);

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string | null;
  passwordHash: string;
  createdAt: Date;
}
function mapUser(r: UserRow): StoredUser {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.role as UserRole,
    avatarUrl: r.avatarUrl,
    passwordHash: r.passwordHash,
    createdAt: iso(r.createdAt),
  };
}

interface GuardRow {
  id: string;
  userId: string;
  title: string;
  about: string;
  city: string;
  serviceArea: string;
  experienceYears: number;
  skills: string[];
  languages: string[];
  hourlyRate: number;
  availability: string;
  verificationStatus: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  createdAt: Date;
  services?: { serviceId: string }[];
}
function mapGuard(r: GuardRow): GuardProfile {
  return {
    id: r.id,
    userId: r.userId,
    title: r.title,
    about: r.about,
    city: r.city,
    serviceArea: r.serviceArea,
    experienceYears: r.experienceYears,
    skills: r.skills,
    languages: r.languages,
    serviceIds: (r.services ?? []).map((s) => s.serviceId),
    hourlyRate: r.hourlyRate,
    availability: r.availability as AvailabilityStatus,
    verificationStatus: r.verificationStatus as VerificationStatus,
    rating: r.rating,
    reviewCount: r.reviewCount,
    completedJobs: r.completedJobs,
    createdAt: iso(r.createdAt),
  };
}

interface RequestRow {
  id: string;
  customerId: string;
  guardId: string;
  serviceId: string;
  requestedDate: Date;
  durationHours: number;
  location: string;
  requirements: string;
  status: string;
  rejectReason: string | null;
  createdAt: Date;
  respondedAt: Date | null;
}
function mapRequest(r: RequestRow): ServiceRequest {
  return {
    id: r.id,
    customerId: r.customerId,
    guardId: r.guardId,
    serviceId: r.serviceId,
    requestedDate: iso(r.requestedDate),
    durationHours: r.durationHours,
    location: r.location,
    requirements: r.requirements,
    status: r.status as RequestStatus,
    rejectReason: r.rejectReason,
    createdAt: iso(r.createdAt),
    respondedAt: isoOrNull(r.respondedAt),
  };
}

interface BookingRow {
  id: string;
  requestId: string;
  customerId: string;
  guardId: string;
  serviceId: string;
  scheduledDate: Date;
  durationHours: number;
  location: string;
  requirements: string;
  status: string;
  cancelReason: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
function mapBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    requestId: r.requestId,
    customerId: r.customerId,
    guardId: r.guardId,
    serviceId: r.serviceId,
    scheduledDate: iso(r.scheduledDate),
    durationHours: r.durationHours,
    location: r.location,
    requirements: r.requirements,
    status: r.status as BookingStatus,
    cancelReason: r.cancelReason,
    createdAt: iso(r.createdAt),
    completedAt: isoOrNull(r.completedAt),
  };
}

interface ReviewRow {
  id: string;
  bookingId: string;
  customerId: string;
  guardId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
function mapReview(r: ReviewRow): Review {
  return {
    id: r.id,
    bookingId: r.bookingId,
    customerId: r.customerId,
    guardId: r.guardId,
    rating: r.rating,
    comment: r.comment,
    createdAt: iso(r.createdAt),
  };
}

interface VerificationRow {
  id: string;
  guardId: string;
  status: string;
  notes: string;
  documents: string[];
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}
function mapVerification(r: VerificationRow): VerificationRecord {
  return {
    id: r.id,
    guardId: r.guardId,
    status: r.status as VerificationStatus,
    notes: r.notes,
    documents: r.documents,
    reviewedBy: r.reviewedBy,
    reviewedAt: isoOrNull(r.reviewedAt),
    createdAt: iso(r.createdAt),
  };
}

interface NotificationRow {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
}
function mapNotification(r: NotificationRow): AppNotification {
  return {
    id: r.id,
    userId: r.userId,
    type: r.type as NotificationType,
    title: r.title,
    message: r.message,
    read: r.read,
    link: r.link,
    createdAt: iso(r.createdAt),
  };
}

/* ── Repositories ─────────────────────────────────────────── */

class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: NewUserInput): Promise<StoredUser> {
    const row = await this.prisma.user.create({
      data: {
        id: input.id ?? createId('usr'),
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: input.role,
        avatarUrl: input.avatarUrl,
        passwordHash: input.passwordHash,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
      },
    });
    return mapUser(row);
  }
  async findById(id: string): Promise<StoredUser | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? mapUser(row) : null;
  }
  async findByEmail(email: string): Promise<StoredUser | null> {
    const row = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
    });
    return row ? mapUser(row) : null;
  }
  async update(
    id: string,
    patch: Partial<Pick<StoredUser, 'name' | 'phone' | 'avatarUrl'>>,
  ): Promise<StoredUser | null> {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) return null;
    const row = await this.prisma.user.update({ where: { id }, data: patch });
    return mapUser(row);
  }
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.updateMany({ where: { id }, data: { passwordHash } });
  }
  async list(filter: { role?: UserRole; search?: string }): Promise<StoredUser[]> {
    const rows = await this.prisma.user.findMany({
      where: {
        role: filter.role,
        ...(filter.search
          ? {
              OR: [
                { name: { contains: filter.search, mode: 'insensitive' } },
                { email: { contains: filter.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapUser);
  }
  async counts(): Promise<{ total: number; byRole: Record<UserRole, number> }> {
    const [total, grouped] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    ]);
    const byRole: Record<UserRole, number> = { customer: 0, guard: 0, admin: 0 };
    for (const g of grouped) byRole[g.role as UserRole] = g._count._all;
    return { total, byRole };
  }
}

class PrismaCustomerProfileRepository implements CustomerProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CustomerProfile): Promise<CustomerProfile> {
    const row = await this.prisma.customerProfile.create({ data: input });
    return { userId: row.userId, address: row.address, city: row.city };
  }
  async findByUserId(userId: string): Promise<CustomerProfile | null> {
    const row = await this.prisma.customerProfile.findUnique({ where: { userId } });
    return row ? { userId: row.userId, address: row.address, city: row.city } : null;
  }
  async update(
    userId: string,
    patch: Partial<Omit<CustomerProfile, 'userId'>>,
  ): Promise<CustomerProfile | null> {
    const exists = await this.prisma.customerProfile.findUnique({ where: { userId } });
    if (!exists) return null;
    const row = await this.prisma.customerProfile.update({ where: { userId }, data: patch });
    return { userId: row.userId, address: row.address, city: row.city };
  }
}

class PrismaGuardProfileRepository implements GuardProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: NewEntity<GuardProfile>): Promise<GuardProfile> {
    const { serviceIds, ...rest } = input;
    const row = await this.prisma.guardProfile.create({
      data: {
        id: input.id ?? createId('grd'),
        userId: rest.userId,
        title: rest.title,
        about: rest.about,
        city: rest.city,
        serviceArea: rest.serviceArea,
        experienceYears: rest.experienceYears,
        skills: rest.skills,
        languages: rest.languages,
        hourlyRate: rest.hourlyRate,
        availability: rest.availability,
        verificationStatus: rest.verificationStatus,
        rating: rest.rating,
        reviewCount: rest.reviewCount,
        completedJobs: rest.completedJobs,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
        services: { create: (serviceIds ?? []).map((serviceId) => ({ serviceId })) },
      },
      include: { services: { select: { serviceId: true } } },
    });
    return mapGuard(row);
  }
  async findById(id: string): Promise<GuardProfile | null> {
    const row = await this.prisma.guardProfile.findUnique({
      where: { id },
      include: { services: { select: { serviceId: true } } },
    });
    return row ? mapGuard(row) : null;
  }
  async findByUserId(userId: string): Promise<GuardProfile | null> {
    const row = await this.prisma.guardProfile.findUnique({
      where: { userId },
      include: { services: { select: { serviceId: true } } },
    });
    return row ? mapGuard(row) : null;
  }
  async update(
    id: string,
    patch: Partial<Omit<GuardProfile, 'id' | 'userId'>>,
  ): Promise<GuardProfile | null> {
    const exists = await this.prisma.guardProfile.findUnique({ where: { id } });
    if (!exists) return null;

    const { serviceIds, createdAt, ...scalar } = patch;
    const data: Record<string, unknown> = { ...scalar };
    if (createdAt !== undefined) data.createdAt = new Date(createdAt);

    if (serviceIds !== undefined) {
      await this.prisma.$transaction([
        this.prisma.guardService.deleteMany({ where: { guardId: id } }),
        this.prisma.guardService.createMany({
          data: serviceIds.map((serviceId) => ({ guardId: id, serviceId })),
        }),
        this.prisma.guardProfile.update({ where: { id }, data }),
      ]);
    } else {
      await this.prisma.guardProfile.update({ where: { id }, data });
    }

    const row = await this.prisma.guardProfile.findUnique({
      where: { id },
      include: { services: { select: { serviceId: true } } },
    });
    return row ? mapGuard(row) : null;
  }
  async list(): Promise<GuardProfile[]> {
    const rows = await this.prisma.guardProfile.findMany({
      include: { services: { select: { serviceId: true } } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map(mapGuard);
  }
  async countsByVerification(): Promise<Record<VerificationStatus, number>> {
    const grouped = await this.prisma.guardProfile.groupBy({
      by: ['verificationStatus'],
      _count: { _all: true },
    });
    const counts: Record<VerificationStatus, number> = {
      unverified: 0,
      pending: 0,
      verified: 0,
      rejected: 0,
    };
    for (const g of grouped) counts[g.verificationStatus as VerificationStatus] = g._count._all;
    return counts;
  }
}

class PrismaServiceRepository implements ServiceRepository {
  constructor(private prisma: PrismaClient) {}

  async list(): Promise<Service[]> {
    const rows = await this.prisma.service.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      icon: r.icon,
    }));
  }
  async findById(id: string): Promise<Service | null> {
    const r = await this.prisma.service.findUnique({ where: { id } });
    return r ? { id: r.id, name: r.name, slug: r.slug, description: r.description, icon: r.icon } : null;
  }
  async saveAll(services: Service[]): Promise<void> {
    await this.prisma.$transaction(
      services.map((s) =>
        this.prisma.service.upsert({
          where: { id: s.id },
          update: { name: s.name, slug: s.slug, description: s.description, icon: s.icon },
          create: { id: s.id, name: s.name, slug: s.slug, description: s.description, icon: s.icon },
        }),
      ),
    );
  }
}

class PrismaRequestRepository implements RequestRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: NewEntity<ServiceRequest>): Promise<ServiceRequest> {
    const row = await this.prisma.serviceRequest.create({
      data: {
        id: input.id ?? createId('req'),
        customerId: input.customerId,
        guardId: input.guardId,
        serviceId: input.serviceId,
        requestedDate: new Date(input.requestedDate),
        durationHours: input.durationHours,
        location: input.location,
        requirements: input.requirements,
        status: input.status,
        rejectReason: input.rejectReason,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
        respondedAt: toDate(input.respondedAt) ?? null,
      },
    });
    return mapRequest(row);
  }
  async findById(id: string): Promise<ServiceRequest | null> {
    const row = await this.prisma.serviceRequest.findUnique({ where: { id } });
    return row ? mapRequest(row) : null;
  }
  async update(
    id: string,
    patch: Partial<Omit<ServiceRequest, 'id'>>,
  ): Promise<ServiceRequest | null> {
    const exists = await this.prisma.serviceRequest.findUnique({ where: { id } });
    if (!exists) return null;
    const { requestedDate, createdAt, respondedAt, ...scalar } = patch;
    const data: Record<string, unknown> = { ...scalar };
    if (requestedDate !== undefined) data.requestedDate = new Date(requestedDate);
    if (createdAt !== undefined) data.createdAt = new Date(createdAt);
    if (respondedAt !== undefined) data.respondedAt = respondedAt === null ? null : new Date(respondedAt);
    const row = await this.prisma.serviceRequest.update({ where: { id }, data });
    return mapRequest(row);
  }
  async listByCustomer(customerId: string): Promise<ServiceRequest[]> {
    const rows = await this.prisma.serviceRequest.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapRequest);
  }
  async listByGuard(guardId: string): Promise<ServiceRequest[]> {
    const rows = await this.prisma.serviceRequest.findMany({
      where: { guardId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapRequest);
  }
  async listAll(): Promise<ServiceRequest[]> {
    const rows = await this.prisma.serviceRequest.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(mapRequest);
  }
  async countsByStatus(): Promise<Record<RequestStatus, number>> {
    const grouped = await this.prisma.serviceRequest.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const counts: Record<RequestStatus, number> = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
    };
    for (const g of grouped) counts[g.status as RequestStatus] = g._count._all;
    return counts;
  }
}

class PrismaBookingRepository implements BookingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: NewEntity<Booking>): Promise<Booking> {
    const row = await this.prisma.booking.create({
      data: {
        id: input.id ?? createId('bkg'),
        requestId: input.requestId,
        customerId: input.customerId,
        guardId: input.guardId,
        serviceId: input.serviceId,
        scheduledDate: new Date(input.scheduledDate),
        durationHours: input.durationHours,
        location: input.location,
        requirements: input.requirements,
        status: input.status,
        cancelReason: input.cancelReason,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
        completedAt: toDate(input.completedAt) ?? null,
      },
    });
    return mapBooking(row);
  }
  async findById(id: string): Promise<Booking | null> {
    const row = await this.prisma.booking.findUnique({ where: { id } });
    return row ? mapBooking(row) : null;
  }
  async findByRequestId(requestId: string): Promise<Booking | null> {
    const row = await this.prisma.booking.findUnique({ where: { requestId } });
    return row ? mapBooking(row) : null;
  }
  async update(id: string, patch: Partial<Omit<Booking, 'id'>>): Promise<Booking | null> {
    const exists = await this.prisma.booking.findUnique({ where: { id } });
    if (!exists) return null;
    const { scheduledDate, createdAt, completedAt, ...scalar } = patch;
    const data: Record<string, unknown> = { ...scalar };
    if (scheduledDate !== undefined) data.scheduledDate = new Date(scheduledDate);
    if (createdAt !== undefined) data.createdAt = new Date(createdAt);
    if (completedAt !== undefined) data.completedAt = completedAt === null ? null : new Date(completedAt);
    const row = await this.prisma.booking.update({ where: { id }, data });
    return mapBooking(row);
  }
  async listByCustomer(customerId: string): Promise<Booking[]> {
    const rows = await this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapBooking);
  }
  async listByGuard(guardId: string): Promise<Booking[]> {
    const rows = await this.prisma.booking.findMany({
      where: { guardId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapBooking);
  }
  async listAll(): Promise<Booking[]> {
    const rows = await this.prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(mapBooking);
  }
  async countsByStatus(): Promise<Record<BookingStatus, number>> {
    const grouped = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const counts: Record<BookingStatus, number> = { confirmed: 0, completed: 0, cancelled: 0 };
    for (const g of grouped) counts[g.status as BookingStatus] = g._count._all;
    return counts;
  }
}

class PrismaReviewRepository implements ReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: NewEntity<Review>): Promise<Review> {
    const row = await this.prisma.review.create({
      data: {
        id: input.id ?? createId('rev'),
        bookingId: input.bookingId,
        customerId: input.customerId,
        guardId: input.guardId,
        rating: input.rating,
        comment: input.comment,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
      },
    });
    return mapReview(row);
  }
  async findByBooking(bookingId: string): Promise<Review | null> {
    const row = await this.prisma.review.findFirst({ where: { bookingId } });
    return row ? mapReview(row) : null;
  }
  async listByGuard(guardId: string): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: { guardId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapReview);
  }
  async listAll(): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(mapReview);
  }
}

class PrismaNotificationRepository implements NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: NewEntity<AppNotification>): Promise<AppNotification> {
    const row = await this.prisma.appNotification.create({
      data: {
        id: input.id ?? createId('ntf'),
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        read: input.read,
        link: input.link,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
      },
    });
    return mapNotification(row);
  }
  async listByUser(userId: string, limit = 50): Promise<AppNotification[]> {
    const rows = await this.prisma.appNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(mapNotification);
  }
  async countUnread(userId: string): Promise<number> {
    return this.prisma.appNotification.count({ where: { userId, read: false } });
  }
  async markRead(userId: string, notificationId: string): Promise<AppNotification | null> {
    const row = await this.prisma.appNotification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!row) return null;
    const updated = await this.prisma.appNotification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return mapNotification(updated);
  }
  async markAllRead(userId: string): Promise<void> {
    await this.prisma.appNotification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

class PrismaVerificationRepository implements VerificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: NewEntity<VerificationRecord>): Promise<VerificationRecord> {
    const row = await this.prisma.verificationRecord.create({
      data: {
        id: input.id ?? createId('ver'),
        guardId: input.guardId,
        status: input.status,
        notes: input.notes,
        documents: input.documents,
        reviewedBy: input.reviewedBy,
        reviewedAt: toDate(input.reviewedAt) ?? null,
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
      },
    });
    return mapVerification(row);
  }
  async listByGuard(guardId: string): Promise<VerificationRecord[]> {
    const rows = await this.prisma.verificationRecord.findMany({
      where: { guardId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapVerification);
  }
  async listAll(): Promise<VerificationRecord[]> {
    const rows = await this.prisma.verificationRecord.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(mapVerification);
  }
}

/* ── DataSource ───────────────────────────────────────────── */

export class PrismaDataSource implements DataSource {
  readonly kind = 'postgres';
  private readonly prisma: PrismaClient;

  readonly users: UserRepository;
  readonly customerProfiles: CustomerProfileRepository;
  readonly guards: GuardProfileRepository;
  readonly services: ServiceRepository;
  readonly requests: RequestRepository;
  readonly bookings: BookingRepository;
  readonly reviews: ReviewRepository;
  readonly notifications: NotificationRepository;
  readonly verifications: VerificationRepository;

  constructor(client?: PrismaClient) {
    this.prisma = client ?? createClient();
    this.users = new PrismaUserRepository(this.prisma);
    this.customerProfiles = new PrismaCustomerProfileRepository(this.prisma);
    this.guards = new PrismaGuardProfileRepository(this.prisma);
    this.services = new PrismaServiceRepository(this.prisma);
    this.requests = new PrismaRequestRepository(this.prisma);
    this.bookings = new PrismaBookingRepository(this.prisma);
    this.reviews = new PrismaReviewRepository(this.prisma);
    this.notifications = new PrismaNotificationRepository(this.prisma);
    this.verifications = new PrismaVerificationRepository(this.prisma);
  }

  async isEmpty(): Promise<boolean> {
    const count = await this.prisma.user.count();
    return count === 0;
  }
}
