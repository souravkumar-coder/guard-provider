import { Router } from 'express';
import type { CreateRequestInput, RespondRequestInput } from '@guard-provider/shared';
import { auth, requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { parseOrThrow, pathParam } from '../utils/validate.js';
import { createRequestSchema, respondRequestSchema } from '../validation/schemas.js';
import { requestsService } from '../services/requests.service.js';

export const requestsRouter = Router();

requestsRouter.post(
  '/',
  requireAuth,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(createRequestSchema, req.body as CreateRequestInput);
    res.status(201).json(await requestsService.create(auth(req).id, input));
  }),
);

requestsRouter.get(
  '/mine',
  requireAuth,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    res.json({ items: await requestsService.listMine(auth(req).id) });
  }),
);

requestsRouter.get(
  '/incoming',
  requireAuth,
  requireRole('guard'),
  asyncHandler(async (req, res) => {
    res.json({ items: await requestsService.listIncoming(auth(req).id) });
  }),
);

requestsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await requestsService.getById(auth(req), pathParam(req, 'id')));
  }),
);

/* Guard accepts or rejects */
requestsRouter.patch(
  '/:id/accept',
  requireAuth,
  requireRole('guard'),
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(respondRequestSchema, { status: 'accepted' });
    res.json(await requestsService.respond(auth(req), pathParam(req, 'id'), input));
  }),
);

requestsRouter.patch(
  '/:id/reject',
  requireAuth,
  requireRole('guard'),
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(respondRequestSchema, {
      ...(req.body ?? {}),
      status: 'rejected',
    } as RespondRequestInput);
    res.json(await requestsService.respond(auth(req), pathParam(req, 'id'), input));
  }),
);

/* Customer cancels a pending request */
requestsRouter.patch(
  '/:id/cancel',
  requireAuth,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    res.json(await requestsService.cancel(auth(req), pathParam(req, 'id')));
  }),
);
