import type { AuthResponse, ChangePasswordInput, LoginInput, RegisterInput } from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import type { StoredUser } from '../data/DataSource.js';
import { ApiError } from '../utils/errors.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { buildAuthUser } from './dto.js';
import { pushNotification } from './notifications.service.js';

async function buildAuthResponse(user: StoredUser): Promise<AuthResponse> {
  const [authUser] = await Promise.all([buildAuthUser(user)]);
  const token = signToken({ sub: user.id, role: user.role, name: user.name });
  return { token, user: authUser };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const existing = await dataSource.users.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists — try signing in');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await dataSource.users.create({
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      role: input.role,
      avatarUrl: null,
      passwordHash,
    });

    if (input.role === 'guard') {
      await dataSource.guards.create({
        userId: user.id,
        title: 'Security Professional',
        about: '',
        city: '',
        serviceArea: '',
        experienceYears: 0,
        skills: [],
        languages: ['Hindi', 'English'],
        serviceIds: [],
        hourlyRate: 450,
        availability: 'available',
        verificationStatus: 'unverified',
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
      });
      await pushNotification({
        userId: user.id,
        type: 'account_update',
        title: 'Welcome to Guard Provider',
        message: 'Complete your professional profile so customers can find and request you.',
        link: '/guard/profile',
      });
    } else {
      await dataSource.customerProfiles.create({ userId: user.id, address: '', city: '' });
      await pushNotification({
        userId: user.id,
        type: 'account_update',
        title: 'Welcome to Guard Provider',
        message: 'Browse verified security professionals and request a service in minutes.',
        link: '/dashboard/search',
      });
    }

    return buildAuthResponse(user);
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await dataSource.users.findByEmail(input.email);
    if (!user) throw ApiError.unauthorized('Incorrect email or password');
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Incorrect email or password');
    return buildAuthResponse(user);
  },

  async me(userId: string): Promise<AuthResponse['user']> {
    const user = await dataSource.users.findById(userId);
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    return buildAuthUser(user);
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await dataSource.users.findById(userId);
    if (!user) throw ApiError.unauthorized();
    const ok = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!ok) throw ApiError.badRequest('Your current password is incorrect');
    if (input.currentPassword === input.newPassword) {
      throw ApiError.badRequest('Choose a password different from the current one');
    }
    await dataSource.users.updatePassword(userId, await hashPassword(input.newPassword));
    await pushNotification({
      userId,
      type: 'account_update',
      title: 'Password updated',
      message: 'Your account password was changed successfully.',
    });
  },
};
