import { Router } from 'express';
import type { GuardQuery, UpdateGuardProfileInput } from '@guard-provider/shared';
import { auth, requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { asStringFromQuery, parseOrThrow, pathParam } from '../utils/validate.js';
import { guardQuerySchema, updateGuardProfileSchema } from '../validation/schemas.js';
import { guardsService } from '../services/guards.service.js';

export const guardsRouter = Router();

/* Public directory */
guardsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = parseOrThrow(guardQuerySchema, {
      search: asStringFromQuery(req, 'search'),
      location: asStringFromQuery(req, 'location'),
      serviceId: asStringFromQuery(req, 'serviceId'),
      availability: asStringFromQuery(req, 'availability'),
      minExperience: asStringFromQuery(req, 'minExperience'),
      verified: asStringFromQuery(req, 'verified'),
      sort: asStringFromQuery(req, 'sort'),
      page: asStringFromQuery(req, 'page'),
      limit: asStringFromQuery(req, 'limit'),
    });
    const query: GuardQuery = {
      search: parsed.search,
      location: parsed.location,
      serviceId: parsed.serviceId,
      availability: parsed.availability,
      minExperience: parsed.minExperience,
      verified: parsed.verified,
      sort: parsed.sort,
      page: parsed.page,
      limit: parsed.limit,
    };
    res.json(await guardsService.list(query));
  }),
);

/* Guard's own profile */
guardsRouter.get(
  '/me/profile',
  requireAuth,
  requireRole('guard'),
  asyncHandler(async (req, res) => {
    res.json(await guardsService.getOwnProfile(auth(req).id));
  }),
);

guardsRouter.patch(
  '/me/profile',
  requireAuth,
  requireRole('guard'),
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(updateGuardProfileSchema, req.body as UpdateGuardProfileInput);
    res.json(await guardsService.updateOwnProfile(auth(req).id, input));
  }),
);

guardsRouter.post(
  '/me/submit-verification',
  requireAuth,
  requireRole('guard'),
  asyncHandler(async (req, res) => {
    res.json(await guardsService.submitVerification(auth(req).id));
  }),
);

/* Public single profile + reviews (declared after /me routes) */
guardsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await guardsService.getById(pathParam(req, 'id')));
  }),
);

guardsRouter.get(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    res.json({ items: await guardsService.getReviews(pathParam(req, 'id')) });
  }),
);
