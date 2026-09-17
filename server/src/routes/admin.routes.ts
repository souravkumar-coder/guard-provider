import { Router } from 'express';
import type { RequestStatus, BookingStatus } from '@guard-provider/shared';
import { auth, requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { asStringFromQuery, parseOrThrow, pathParam } from '../utils/validate.js';
import { adminVerificationSchema } from '../validation/schemas.js';
import { adminService } from '../services/admin.service.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    res.json(await adminService.stats());
  }),
);

adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const role = asStringFromQuery(req, 'role');
    res.json({
      items: await adminService.listUsers({
        role: role === 'guard' || role === 'customer' || role === 'admin' ? role : undefined,
        search: asStringFromQuery(req, 'search'),
      }),
    });
  }),
);

adminRouter.get(
  '/requests',
  asyncHandler(async (req, res) => {
    const status = asStringFromQuery(req, 'status');
    res.json({
      items: await adminService.listRequests(
        status ? (status as RequestStatus) : undefined,
      ),
    });
  }),
);

adminRouter.get(
  '/bookings',
  asyncHandler(async (req, res) => {
    const status = asStringFromQuery(req, 'status');
    res.json({
      items: await adminService.listBookings(
        status ? (status as BookingStatus) : undefined,
      ),
    });
  }),
);

adminRouter.get(
  '/reports',
  asyncHandler(async (_req, res) => {
    res.json(await adminService.report());
  }),
);

adminRouter.get(
  '/verifications',
  asyncHandler(async (_req, res) => {
    res.json({ items: await adminService.listVerifications() });
  }),
);

adminRouter.patch(
  '/guards/:guardId/verification',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(adminVerificationSchema, req.body);
    res.json(
      await adminService.setVerification(auth(req), pathParam(req, 'guardId'), input),
    );
  }),
);
