import { Router } from 'express';
import type { ChangePasswordInput, LoginInput, RegisterInput, UpdateOwnUserInput } from '@guard-provider/shared';
import { requireAuth, auth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { parseOrThrow } from '../utils/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateOwnUserSchema,
} from '../validation/schemas.js';
import { authService } from '../services/auth.service.js';
import { usersService } from '../services/users.service.js';

export const authRouter = Router();
export const usersRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(registerSchema, req.body as RegisterInput);
    res.status(201).json(await authService.register(input));
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(loginSchema, req.body as LoginInput);
    res.json(await authService.login(input));
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await authService.me(auth(req).id));
  }),
);

usersRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(updateOwnUserSchema, req.body as UpdateOwnUserInput);
    res.json(await usersService.updateOwn(auth(req).id, input));
  }),
);

usersRouter.patch(
  '/me/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(changePasswordSchema, req.body as ChangePasswordInput);
    await authService.changePassword(auth(req).id, input);
    res.json({ message: 'Password updated successfully' });
  }),
);
