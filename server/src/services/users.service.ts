import type { AuthUser, UpdateOwnUserInput } from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import { ApiError } from '../utils/errors.js';
import { buildAuthUser } from './dto.js';

export const usersService = {
  async updateOwn(userId: string, input: UpdateOwnUserInput): Promise<AuthUser> {
    const user = await dataSource.users.findById(userId);
    if (!user) throw ApiError.unauthorized();

    const updated = await dataSource.users.update(userId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
    });
    if (!updated) throw ApiError.notFound('Account not found');

    // Customer-specific fields live on the customer profile.
    if (user.role === 'customer' && (input.address !== undefined || input.city !== undefined)) {
      const profile = await dataSource.customerProfiles.findByUserId(userId);
      if (profile) {
        await dataSource.customerProfiles.update(userId, {
          ...(input.address !== undefined ? { address: input.address } : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
        });
      }
    }

    return buildAuthUser(updated);
  },
};
