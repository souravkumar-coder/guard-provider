import type {
  Booking,
  BookingDto,
  UpdateBookingStatusInput,
} from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import { ApiError } from '../utils/errors.js';
import { toBookingDto } from './dto.js';
import { pushNotification } from './notifications.service.js';
import type { AuthedUserLike } from './service-types.js';

async function resolveParty(
  user: AuthedUserLike,
): Promise<{ customerId: string } | { guardId: string }> {
  if (user.role === 'guard') {
    const guard = await dataSource.guards.findByUserId(user.id);
    if (!guard) throw ApiError.notFound('Guard profile not found');
    return { guardId: guard.id };
  }
  return { customerId: user.id };
}

function assertParticipant(
  user: AuthedUserLike,
  booking: Booking,
  party: { customerId: string } | { guardId: string },
): void {
  const isCustomer = 'customerId' in party && booking.customerId === party.customerId;
  const isGuard = 'guardId' in party && booking.guardId === party.guardId;
  if (!isCustomer && !isGuard && user.role !== 'admin') {
    throw ApiError.forbidden('You are not part of this booking');
  }
}

export const bookingsService = {
  async listMine(user: AuthedUserLike): Promise<BookingDto[]> {
    const party = await resolveParty(user);
    const rows =
      'guardId' in party
        ? await dataSource.bookings.listByGuard(party.guardId)
        : await dataSource.bookings.listByCustomer(party.customerId);
    return Promise.all(rows.map(toBookingDto));
  },

  async getById(user: AuthedUserLike, bookingId: string): Promise<BookingDto> {
    const booking = await dataSource.bookings.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    assertParticipant(user, booking, await resolveParty(user));
    return toBookingDto(booking);
  },

  /** Guard marks a confirmed booking completed; either party can cancel it. */
  async updateStatus(
    user: AuthedUserLike,
    bookingId: string,
    input: UpdateBookingStatusInput,
  ): Promise<BookingDto> {
    const booking = await dataSource.bookings.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    const party = await resolveParty(user);
    assertParticipant(user, booking, party);

    const isGuard = 'guardId' in party && booking.guardId === party.guardId;
    if (booking.status !== 'confirmed') {
      throw ApiError.conflict(`Only confirmed bookings can be updated (this one is ${booking.status})`);
    }

    const now = new Date().toISOString();
    const service = await dataSource.services.findById(booking.serviceId);
    const serviceLabel = service?.name ?? 'service';

    if (input.status === 'completed') {
      if (!isGuard) {
        throw ApiError.forbidden('Only the assigned guard can mark a booking as completed');
      }
      const updated = await dataSource.bookings.update(bookingId, {
        status: 'completed',
        completedAt: now,
      });
      if (!updated) throw ApiError.notFound('Booking not found');
      await pushNotification({
        userId: booking.customerId,
        type: 'booking_update',
        title: 'Service completed',
        message: `${user.name} marked your ${serviceLabel} booking as completed. Share a review to help others.`,
        link: '/dashboard/bookings',
      });
      return toBookingDto(updated);
    }

    // Cancellation — allowed for both parties.
    const cancelReason = input.cancelReason?.trim() || 'Cancelled by ' + (isGuard ? 'guard' : 'customer');
    const updated = await dataSource.bookings.update(bookingId, {
      status: 'cancelled',
      cancelReason,
    });
    if (!updated) throw ApiError.notFound('Booking not found');

    const notifyUserId = isGuard ? booking.customerId : (await dataSource.guards.findById(booking.guardId))?.userId;
    if (notifyUserId) {
      await pushNotification({
        userId: notifyUserId,
        type: 'booking_update',
        title: 'Booking cancelled',
        message: `The ${serviceLabel} booking on ${new Date(booking.scheduledDate).toLocaleDateString('en-IN')} was cancelled. ${cancelReason}`,
        link: isGuard ? '/dashboard/bookings' : '/guard/bookings',
      });
    }
    return toBookingDto(updated);
  },
};
