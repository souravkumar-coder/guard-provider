import type {
  ActorRef,
  AuthUser,
  Booking,
  BookingDto,
  GuardListing,
  GuardProfile,
  PublicUser,
  Review,
  ReviewWithCustomer,
  ServiceRequest,
  ServiceRequestDto,
} from '@guard-provider/shared';
import { dataSource } from '../data/index.js';
import type { StoredUser } from '../data/DataSource.js';

/** Strips credentials — the only safe way to expose a user. */
export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, avatarUrl: user.avatarUrl };
}

export async function buildAuthUser(user: StoredUser): Promise<AuthUser> {
  const [customerProfile, guardProfile] = await Promise.all([
    dataSource.customerProfiles.findByUserId(user.id),
    user.role === 'guard' ? dataSource.guards.findByUserId(user.id) : Promise.resolve(null),
  ]);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    customerProfile,
    guardProfile,
  };
}

function guardActor(profile: GuardProfile, user: StoredUser): ActorRef {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    guardProfileId: profile.id,
  };
}

export async function toGuardListing(profile: GuardProfile, user?: StoredUser | null): Promise<GuardListing> {
  const owner = user ?? (await dataSource.users.findById(profile.userId));
  if (!owner) throw new Error(`Guard profile ${profile.id} references a missing user`);
  return { ...profile, user: toPublicUser(owner) };
}

export async function toRequestDto(request: ServiceRequest): Promise<ServiceRequestDto> {
  const [service, customer, guardProfile] = await Promise.all([
    dataSource.services.findById(request.serviceId),
    dataSource.users.findById(request.customerId),
    dataSource.guards.findById(request.guardId),
  ]);
  if (!service || !customer || !guardProfile) {
    throw new Error(`Request ${request.id} references missing records`);
  }
  const guardUser = await dataSource.users.findById(guardProfile.userId);
  if (!guardUser) throw new Error(`Guard profile ${guardProfile.id} references a missing user`);
  return {
    ...request,
    service,
    customer: toPublicUser(customer),
    guard: guardActor(guardProfile, guardUser),
  };
}

export async function toBookingDto(booking: Booking): Promise<BookingDto> {
  const [service, customer, guardProfile, review] = await Promise.all([
    dataSource.services.findById(booking.serviceId),
    dataSource.users.findById(booking.customerId),
    dataSource.guards.findById(booking.guardId),
    dataSource.reviews.findByBooking(booking.id),
  ]);
  if (!service || !customer || !guardProfile) {
    throw new Error(`Booking ${booking.id} references missing records`);
  }
  const guardUser = await dataSource.users.findById(guardProfile.userId);
  if (!guardUser) throw new Error(`Guard profile ${guardProfile.id} references a missing user`);
  return {
    ...booking,
    service,
    customer: toPublicUser(customer),
    guard: guardActor(guardProfile, guardUser),
    review,
  };
}

export async function toReviewDto(review: Review): Promise<ReviewWithCustomer> {
  const customer = await dataSource.users.findById(review.customerId);
  return { ...review, customer: customer ? toPublicUser(customer) : { id: review.customerId, name: 'Customer', avatarUrl: null } };
}
