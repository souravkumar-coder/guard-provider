import type {
  AuthedUserLike,
} from './service-types.js';
import type {
  BookingDto,
  CreateRequestInput,
  GuardProfile,
  RespondRequestInput,
  ServiceRequestDto,
} from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import { ApiError } from '../utils/errors.js';
import { toBookingDto, toRequestDto } from './dto.js';
import { pushNotification } from './notifications.service.js';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

async function requireGuardProfile(userId: string): Promise<GuardProfile> {
  const profile = await dataSource.guards.findByUserId(userId);
  if (!profile) throw ApiError.notFound('Guard profile not found');
  return profile;
}

export const requestsService = {
  /** Customer sends a new service request to a guard. */
  async create(customerId: string, input: CreateRequestInput): Promise<ServiceRequestDto> {
    const guard = await dataSource.guards.findById(input.guardId);
    if (!guard) throw ApiError.notFound('Guard profile not found');

    const service = await dataSource.services.findById(input.serviceId);
    if (!service) throw ApiError.badRequest('Please choose a valid service type');

    if (guard.userId === customerId) {
      throw ApiError.badRequest('You cannot send a request to your own profile');
    }

    const requested = new Date(input.requestedDate);
    if (Number.isNaN(requested.getTime()) || requested < startOfToday()) {
      throw ApiError.badRequest('Choose a service date from today onwards');
    }

    const request = await dataSource.requests.create({
      customerId,
      guardId: guard.id,
      serviceId: service.id,
      requestedDate: input.requestedDate,
      durationHours: input.durationHours,
      location: input.location,
      requirements: input.requirements ?? '',
      status: 'pending',
      rejectReason: null,
      createdAt: new Date().toISOString(),
      respondedAt: null,
    });

    const customer = await dataSource.users.findById(customerId);
    await pushNotification({
      userId: guard.userId,
      type: 'request_new',
      title: 'New service request',
      message: `${customer?.name ?? 'A customer'} requested ${service.name} on ${formatDate(request.requestedDate)}.`,
      link: '/guard/requests',
    });

    return toRequestDto(request);
  },

  async listMine(customerId: string): Promise<ServiceRequestDto[]> {
    const rows = await dataSource.requests.listByCustomer(customerId);
    return Promise.all(rows.map(toRequestDto));
  },

  async listIncoming(guardUserId: string): Promise<ServiceRequestDto[]> {
    const profile = await dataSource.guards.findByUserId(guardUserId);
    if (!profile) return [];
    const rows = await dataSource.requests.listByGuard(profile.id);
    return Promise.all(rows.map(toRequestDto));
  },

  /** Guard accepts or rejects a pending request. Accepting creates a booking. */
  async respond(
    user: AuthedUserLike,
    requestId: string,
    input: RespondRequestInput,
  ): Promise<{ request: ServiceRequestDto; booking: BookingDto | null }> {
    const guard = await requireGuardProfile(user.id);
    const request = await dataSource.requests.findById(requestId);
    if (!request) throw ApiError.notFound('Request not found');
    if (request.guardId !== guard.id) {
      throw ApiError.forbidden('This request was sent to another guard');
    }
    if (request.status !== 'pending') {
      throw ApiError.conflict(`This request was already ${request.status}`);
    }

    const now = new Date().toISOString();
    const service = await dataSource.services.findById(request.serviceId);

    if (input.status === 'accepted') {
      await dataSource.requests.update(requestId, { status: 'accepted', respondedAt: now });
      const booking = await dataSource.bookings.create({
        requestId: request.id,
        customerId: request.customerId,
        guardId: request.guardId,
        serviceId: request.serviceId,
        scheduledDate: request.requestedDate,
        durationHours: request.durationHours,
        location: request.location,
        requirements: request.requirements,
        status: 'confirmed',
        cancelReason: null,
        createdAt: now,
        completedAt: null,
      });
      await pushNotification({
        userId: request.customerId,
        type: 'request_accepted',
        title: 'Request accepted',
        message: `${user.name} accepted your ${service?.name ?? 'service'} request — a booking has been created.`,
        link: '/dashboard/bookings',
      });
      const [requestDto, bookingDto] = await Promise.all([
        toRequestDto({ ...request, status: 'accepted', respondedAt: now }),
        toBookingDto(booking),
      ]);
      return { request: requestDto, booking: bookingDto };
    }

    await dataSource.requests.update(requestId, {
      status: 'rejected',
      respondedAt: now,
      rejectReason: input.rejectReason?.trim() || 'No reason provided',
    });
    await pushNotification({
      userId: request.customerId,
      type: 'request_rejected',
      title: 'Request declined',
      message: `${user.name} declined your ${service?.name ?? 'service'} request.${input.rejectReason ? ` Reason: ${input.rejectReason.trim()}` : ''}`,
      link: '/dashboard/requests',
    });
    const requestDto = await toRequestDto({
      ...request,
      status: 'rejected',
      respondedAt: now,
      rejectReason: input.rejectReason?.trim() || 'No reason provided',
    });
    return { request: requestDto, booking: null };
  },

  /** Customer cancels their own pending request. */
  async cancel(user: AuthedUserLike, requestId: string): Promise<ServiceRequestDto> {
    const request = await dataSource.requests.findById(requestId);
    if (!request) throw ApiError.notFound('Request not found');
    if (request.customerId !== user.id) {
      throw ApiError.forbidden('You can only cancel your own requests');
    }
    if (request.status !== 'pending') {
      throw ApiError.conflict(`Only pending requests can be cancelled (this one is ${request.status})`);
    }
    const now = new Date().toISOString();
    await dataSource.requests.update(requestId, { status: 'cancelled', respondedAt: now });

    const guard = await dataSource.guards.findById(request.guardId);
    const service = await dataSource.services.findById(request.serviceId);
    if (guard) {
      await pushNotification({
        userId: guard.userId,
        type: 'booking_update',
        title: 'Request cancelled',
        message: `${user.name} cancelled their ${service?.name ?? 'service'} request.`,
        link: '/guard/requests',
      });
    }
    return toRequestDto({ ...request, status: 'cancelled', respondedAt: now });
  },

  async getById(user: AuthedUserLike, requestId: string): Promise<ServiceRequestDto> {
    const request = await dataSource.requests.findById(requestId);
    if (!request) throw ApiError.notFound('Request not found');

    let allowed = request.customerId === user.id || user.role === 'admin';
    if (!allowed && user.role === 'guard') {
      const guard = await dataSource.guards.findByUserId(user.id);
      allowed = !!guard && guard.id === request.guardId;
    }
    if (!allowed) throw ApiError.forbidden('You do not have access to this request');
    return toRequestDto(request);
  },
};
