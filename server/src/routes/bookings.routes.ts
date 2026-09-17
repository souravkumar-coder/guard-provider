import { Router } from 'express';
import type { CreateReviewInput, UpdateBookingStatusInput } from '@guard-provider/shared';
import { auth, requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { parseOrThrow, pathParam } from '../utils/validate.js';
import { createReviewSchema, updateBookingStatusSchema } from '../validation/schemas.js';
import { bookingsService } from '../services/bookings.service.js';
import { reviewsService } from '../services/reviews.service.js';

export const bookingsRouter = Router();

bookingsRouter.get(
  '/mine',
  requireAuth,
  requireRole('customer', 'guard'),
  asyncHandler(async (req, res) => {
    res.json({ items: await bookingsService.listMine(auth(req)) });
  }),
);

bookingsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await bookingsService.getById(auth(req), pathParam(req, 'id')));
  }),
);

bookingsRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('customer', 'guard'),
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(updateBookingStatusSchema, req.body as UpdateBookingStatusInput);
    res.json(await bookingsService.updateStatus(auth(req), pathParam(req, 'id'), input));
  }),
);

bookingsRouter.post(
  '/:id/review',
  requireAuth,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(createReviewSchema, req.body as CreateReviewInput);
    res.status(201).json(await reviewsService.create(auth(req).id, pathParam(req, 'id'), input));
  }),
);
