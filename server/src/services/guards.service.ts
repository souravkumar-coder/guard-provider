import type {
  GuardListing,
  GuardProfile,
  GuardQuery,
  Paginated,
  ReviewWithCustomer,
  UpdateGuardProfileInput,
} from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import type { StoredUser } from '../data/DataSource.js';
import { ApiError } from '../utils/errors.js';
import { toGuardListing, toReviewDto } from './dto.js';
import { pushNotification } from './notifications.service.js';

const DEFAULT_PAGE_SIZE = 9;

function matchesSearch(profile: GuardProfile, owner: StoredUser | undefined, needle: string): boolean {
  const haystack = [
    owner?.name ?? '',
    profile.title,
    profile.city,
    profile.serviceArea,
    profile.skills.join(' '),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export const guardsService = {
  async list(query: GuardQuery): Promise<Paginated<GuardListing>> {
    const [profiles, users] = await Promise.all([
      dataSource.guards.list(),
      dataSource.users.list({}),
    ]);
    const usersById = new Map(users.map((u) => [u.id, u]));

    let rows = profiles;
    const search = query.search?.toLowerCase();
    if (search) {
      rows = rows.filter((p) => matchesSearch(p, usersById.get(p.userId), search));
    }
    if (query.location) {
      const location = query.location.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.city.toLowerCase().includes(location) ||
          p.serviceArea.toLowerCase().includes(location),
      );
    }
    if (query.serviceId) {
      rows = rows.filter((p) => p.serviceIds.includes(query.serviceId!));
    }
    if (query.availability) {
      rows = rows.filter((p) => p.availability === query.availability);
    }
    if (query.minExperience !== undefined) {
      rows = rows.filter((p) => p.experienceYears >= query.minExperience!);
    }
    if (query.verified) {
      rows = rows.filter((p) => p.verificationStatus === 'verified');
    }

    const sort = query.sort ?? 'rating';
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case 'experience':
          return b.experienceYears - a.experienceYears;
        case 'rate_asc':
          return a.hourlyRate - b.hourlyRate;
        case 'rate_desc':
          return b.hourlyRate - a.hourlyRate;
        default:
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
      }
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;
    const total = rows.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const items = rows.slice((page - 1) * limit, page * limit);

    const listings = await Promise.all(
      items.map((p) => toGuardListing(p, usersById.get(p.userId))),
    );
    return { items: listings, page, limit, total, totalPages };
  },

  async getById(id: string): Promise<GuardListing> {
    const profile = await dataSource.guards.findById(id);
    if (!profile) throw ApiError.notFound('Guard profile not found');
    return toGuardListing(profile);
  },

  async getOwnProfile(userId: string): Promise<GuardProfile> {
    const profile = await dataSource.guards.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Guard profile not found');
    return profile;
  },

  async updateOwnProfile(userId: string, input: UpdateGuardProfileInput): Promise<GuardProfile> {
    const profile = await dataSource.guards.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Guard profile not found');

    if (input.serviceIds) {
      const services = await dataSource.services.list();
      const known = new Set(services.map((s) => s.id));
      const unknown = input.serviceIds.filter((id) => !known.has(id));
      if (unknown.length > 0) {
        throw ApiError.badRequest('One or more selected services are not recognised');
      }
    }

    const updated = await dataSource.guards.update(profile.id, input);
    if (!updated) throw ApiError.notFound('Guard profile not found');
    return updated;
  },

  /** Guard-initiated verification request (admin then reviews it). */
  async submitVerification(userId: string): Promise<GuardProfile> {
    const profile = await dataSource.guards.findByUserId(userId);
    if (!profile) throw ApiError.notFound('Guard profile not found');
    if (profile.verificationStatus === 'verified') {
      throw ApiError.conflict('Your profile is already verified');
    }
    if (profile.verificationStatus === 'pending') {
      throw ApiError.conflict('Your verification is already awaiting review');
    }
    if (!profile.about || !profile.city || profile.serviceIds.length === 0) {
      throw ApiError.badRequest(
        'Complete your about section, city and service types before requesting verification',
      );
    }
    const updated = await dataSource.guards.update(profile.id, {
      verificationStatus: 'pending',
    });
    if (!updated) throw ApiError.notFound('Guard profile not found');

    await dataSource.verifications.create({
      guardId: profile.id,
      status: 'pending',
      notes: 'Submitted by guard from dashboard.',
      documents: ['id_proof.pdf'],
      reviewedBy: null,
      reviewedAt: null,
    });

    const admins = await dataSource.users.list({ role: 'admin' });
    const owner = await dataSource.users.findById(profile.userId);
    const ownerName = owner?.name ?? 'A guard';
    await Promise.all(
      admins.map((admin) =>
        pushNotification({
          userId: admin.id,
          type: 'verification_update',
          title: 'Verification requested',
          message: `${ownerName} submitted their profile for verification.`,
          link: '/admin/users',
        }),
      ),
    );
    return updated;
  },

  async getReviews(guardProfileId: string): Promise<ReviewWithCustomer[]> {
    const profile = await dataSource.guards.findById(guardProfileId);
    if (!profile) throw ApiError.notFound('Guard profile not found');
    const reviews = await dataSource.reviews.listByGuard(guardProfileId);
    return Promise.all(reviews.map(toReviewDto));
  },
};
