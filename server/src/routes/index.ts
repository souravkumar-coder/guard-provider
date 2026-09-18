import { Router } from 'express';
import { authRouter, usersRouter } from './auth.routes.js';
import { servicesRouter } from './services.routes.js';
import { guardsRouter } from './guards.routes.js';
import { requestsRouter } from './requests.routes.js';
import { bookingsRouter } from './bookings.routes.js';
import { notificationsRouter } from './notifications.routes.js';
import { adminRouter } from './admin.routes.js';

export function buildRoutes(): Router {
  const api = Router();
  api.use('/auth', authRouter);
  api.use('/users', usersRouter);
  api.use('/services', servicesRouter);
  api.use('/guards', guardsRouter);
  api.use('/requests', requestsRouter);
  api.use('/bookings', bookingsRouter);
  api.use('/notifications', notificationsRouter);
  api.use('/admin', adminRouter);
  return api;
}
