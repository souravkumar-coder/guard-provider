import { z } from 'zod';

/* ── Auth ─────────────────────────────────────────────────── */

export const registerSchema = z.object({
  role: z.enum(['customer', 'guard']),
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long'),
  password: z.string().min(8, 'Use at least 8 characters').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Use at least 8 characters').max(72),
});

/* ── Profiles ─────────────────────────────────────────────── */

export const updateOwnUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(80).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/, 'Enter a valid date');

export const updateGuardProfileSchema = z
  .object({
    title: z.string().trim().min(3).max(100).optional(),
    about: z.string().trim().max(1200).optional(),
    city: z.string().trim().min(2).max(80).optional(),
    serviceArea: z.string().trim().max(160).optional(),
    experienceYears: z.number().int().min(0).max(60).optional(),
    skills: z.array(z.string().trim().min(1).max(40)).max(15).optional(),
    languages: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    serviceIds: z.array(z.string().min(1)).max(10).optional(),
    hourlyRate: z.number().min(50).max(100000).optional(),
    availability: z.enum(['available', 'on_duty', 'unavailable']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

/* ── Requests & bookings ──────────────────────────────────── */

export const createRequestSchema = z.object({
  guardId: z.string().min(1),
  serviceId: z.string().min(1),
  requestedDate: dateString,
  durationHours: z.number().int().min(1, 'Select a duration').max(24),
  location: z.string().trim().min(4, 'Enter the service location').max(160),
  requirements: z.string().trim().max(1000).optional(),
});

export const respondRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  rejectReason: z.string().trim().max(300).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['completed', 'cancelled']),
  cancelReason: z.string().trim().max(300).optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Choose a rating').max(5),
  comment: z.string().trim().min(4, 'Tell us a little more').max(600),
});

/* ── Guards listing ───────────────────────────────────────── */

export const guardQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  location: z.string().trim().max(80).optional(),
  serviceId: z.string().trim().max(40).optional(),
  availability: z.enum(['available', 'on_duty', 'unavailable']).optional(),
  minExperience: z.coerce.number().int().min(0).max(60).optional(),
  verified: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
  sort: z.enum(['rating', 'experience', 'rate_asc', 'rate_desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

/* ── Admin ────────────────────────────────────────────────── */

export const adminVerificationSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  notes: z.string().trim().max(500).optional(),
});
