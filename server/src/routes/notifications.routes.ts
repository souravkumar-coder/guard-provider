import { Router } from 'express';
import { auth, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { pathParam } from '../utils/validate.js';
import { notificationsService } from '../services/notifications.service.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await notificationsService.list(auth(req).id));
  }),
);

notificationsRouter.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    res.json({ count: await notificationsService.unreadCount(auth(req).id) });
  }),
);

notificationsRouter.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await notificationsService.markAllRead(auth(req).id);
    res.json({ message: 'All notifications marked as read' });
  }),
);

notificationsRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    res.json(await notificationsService.markRead(auth(req).id, pathParam(req, 'id')));
  }),
);
