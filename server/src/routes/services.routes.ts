import { Router } from 'express';
import { asyncHandler } from '../utils/errors.js';
import { dataSource } from '../data/index.js';

export const servicesRouter = Router();

servicesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({ items: await dataSource.services.list() });
  }),
);
