import type { CreateReviewInput, Review } from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import { ApiError } from '../utils/errors.js';
import { pushNotification } from './notifications.service.js';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export const reviewsService = {
  /** Customer reviews a completed booking (one review per booking). */
  async create(
    customerId: string,
    bookingId: string,
    input: CreateReviewInput,
  ): Promise<Review> {
    const booking = await dataSource.bookings.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.customerId !== customerId) {
      throw ApiError.forbidden('You can only review your own bookings');
    }
    if (booking.status !== 'completed') {
      throw ApiError.conflict('Bookings can be reviewed once they are completed');
    }
    const existing = await dataSource.reviews.findByBooking(bookingId);
    if (existing) throw ApiError.conflict('You have already reviewed this booking');

    const review = await dataSource.reviews.create({
      bookingId,
      customerId,
      guardId: booking.guardId,
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    });

    // Recompute guard aggregates from source-of-truth reviews.
    const reviews = await dataSource.reviews.listByGuard(booking.guardId);
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);
    await dataSource.guards.update(booking.guardId, {
      rating: round1(avg),
      reviewCount: reviews.length,
    });

    const guard = await dataSource.guards.findById(booking.guardId);
    if (guard) {
      await pushNotification({
        userId: guard.userId,
        type: 'review_new',
        title: `New ${input.rating}★ review`,
        message: `A customer reviewed your recent booking: "${input.comment.slice(0, 80)}${input.comment.length > 80 ? '…' : ''}"`,
        link: '/guard/bookings',
      });
    }
    return review;
  },
};
