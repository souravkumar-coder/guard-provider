import type {
  AdminStats,
  AdminUserRow,
  BookingStatus,
  PlatformReport,
  RequestStatus,
  ServiceRequest,
  TopGuardRow,
  VerificationRecord,
} from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import type { AuthedUserLike } from './service-types.js';
import { ApiError } from '../utils/errors.js';
import { toBookingDto, toRequestDto } from './dto.js';
import { pushNotification } from './notifications.service.js';

export const adminService = {
  async stats(): Promise<AdminStats> {
    const [users, guardVerifications, requestsByStatus, bookingsByStatus, requests, bookings] =
      await Promise.all([
        dataSource.users.counts(),
        dataSource.guards.countsByVerification(),
        dataSource.requests.countsByStatus(),
        dataSource.bookings.countsByStatus(),
        dataSource.requests.listAll(),
        dataSource.bookings.listAll(),
      ]);
    return {
      totalUsers: users.total,
      totalGuards: users.byRole.guard,
      totalCustomers: users.byRole.customer,
      pendingVerifications: guardVerifications.pending,
      totalRequests: requests.length,
      requestsByStatus,
      totalBookings: bookings.length,
      bookingsByStatus,
      completedJobs: bookings.filter((b) => b.status === 'completed').length,
    };
  },

  async listUsers(filter: { role?: AdminUserRow['role']; search?: string }): Promise<AdminUserRow[]> {
    const [users, guardProfiles] = await Promise.all([
      dataSource.users.list(filter),
      dataSource.guards.list(),
    ]);
    const guardsByUser = new Map(guardProfiles.map((g) => [g.userId, g]));

    const rows: AdminUserRow[] = [];
    for (const user of users) {
      if (user.role === 'guard') {
        const gp = guardsByUser.get(user.id);
        rows.push({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          city: gp?.city ?? null,
          guardProfileId: gp?.id ?? null,
          verificationStatus: gp?.verificationStatus ?? null,
          rating: gp?.rating ?? null,
        });
      } else {
        const cp = user.role === 'customer' ? await dataSource.customerProfiles.findByUserId(user.id) : null;
        rows.push({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          city: cp?.city ?? null,
          guardProfileId: null,
          verificationStatus: null,
          rating: null,
        });
      }
    }
    return rows;
  },

  async listRequests(status?: RequestStatus) {
    const rows: ServiceRequest[] = await dataSource.requests.listAll();
    const filtered = status ? rows.filter((r) => r.status === status) : rows;
    return Promise.all(filtered.map(toRequestDto));
  },

  async listBookings(status?: BookingStatus) {
    const rows = await dataSource.bookings.listAll();
    const filtered = status ? rows.filter((b) => b.status === status) : rows;
    return Promise.all(filtered.map(toBookingDto));
  },

  async report(): Promise<PlatformReport> {
    const [requests, bookings, services, guardProfiles, users] = await Promise.all([
      dataSource.requests.listAll(),
      dataSource.bookings.listAll(),
      dataSource.services.list(),
      dataSource.guards.list(),
      dataSource.users.list({}),
    ]);

    const requestsByStatus = { pending: 0, accepted: 0, rejected: 0, cancelled: 0 } as Record<
      RequestStatus,
      number
    >;
    for (const r of requests) requestsByStatus[r.status] += 1;

    const serviceNames = new Map(services.map((s) => [s.id, s.name]));
    const byService = new Map<string, number>();
    for (const b of bookings) byService.set(b.serviceId, (byService.get(b.serviceId) ?? 0) + 1);
    const bookingsByService = [...byService.entries()]
      .map(([serviceId, count]) => ({
        serviceId,
        serviceName: serviceNames.get(serviceId) ?? serviceId,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const usersById = new Map(users.map((u) => [u.id, u]));
    const topGuards: TopGuardRow[] = [...guardProfiles]
      .sort((a, b) => b.rating - a.rating || b.completedJobs - a.completedJobs)
      .slice(0, 5)
      .map((g) => ({
        id: g.id,
        name: usersById.get(g.userId)?.name ?? 'Guard',
        city: g.city,
        rating: g.rating,
        reviewCount: g.reviewCount,
        completedJobs: g.completedJobs,
      }));

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newUsersLast30Days = users.filter((u) => new Date(u.createdAt).getTime() >= cutoff).length;

    return { requestsByStatus, bookingsByService, topGuards, newUsersLast30Days };
  },

  /** Admin verification decision on a guard profile. */
  async setVerification(
    admin: AuthedUserLike,
    guardProfileId: string,
    input: { status: 'verified' | 'rejected'; notes?: string },
  ): Promise<{ guardId: string; status: string }> {
    const profile = await dataSource.guards.findById(guardProfileId);
    if (!profile) throw ApiError.notFound('Guard profile not found');

    const now = new Date().toISOString();
    await dataSource.verifications.create({
      guardId: profile.id,
      status: input.status,
      notes: input.notes?.trim() ?? '',
      documents: [],
      reviewedBy: admin.id,
      reviewedAt: now,
    });

    const updated = await dataSource.guards.update(profile.id, {
      verificationStatus: input.status,
    });
    if (!updated) throw ApiError.notFound('Guard profile not found');

    await pushNotification({
      userId: profile.userId,
      type: 'verification_update',
      title: input.status === 'verified' ? 'Profile verified ✓' : 'Verification needs attention',
      message:
        input.status === 'verified'
          ? 'Your professional profile is verified — verified guards get priority in search results.'
          : `Your verification was not approved.${input.notes ? ` Note: ${input.notes.trim()}` : ' You can resubmit after updating your profile.'}`,
      link: '/guard/profile',
    });

    return { guardId: profile.id, status: input.status };
  },

  async listVerifications(): Promise<Array<VerificationRecord & { guardName: string }>> {
    const [records, guardProfiles, users] = await Promise.all([
      dataSource.verifications.listAll(),
      dataSource.guards.list(),
      dataSource.users.list({}),
    ]);
    const guardById = new Map(guardProfiles.map((g) => [g.id, g]));
    const userById = new Map(users.map((u) => [u.id, u]));
    return records.map((record) => ({
      ...record,
      guardName:
        userById.get(guardById.get(record.guardId)?.userId ?? '')?.name ?? 'Unknown guard',
    }));
  },
};
