import type { Request } from 'express';
import type { ZodTypeAny } from 'zod';
import type { z } from 'zod';
import { ApiError } from './errors.js';

/** Parses `input` with a zod schema and throws a 422 with field details. */
export function parseOrThrow<T extends ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw ApiError.validation('Please check the highlighted fields', result.error.flatten());
  }
  return result.data;
}

/** Express query values can be arrays — normalise to a plain string. */
export function asString(value: unknown): string | undefined {
  if (Array.isArray(value)) return asString(value[0]);
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function asStringFromQuery(req: Request, key: string): string | undefined {
  return asString(req.query[key]);
}

/** Express 5 route params may be `string | string[]` — normalise to string. */
export function pathParam(req: Request, key: string): string {
  const value = req.params[key];
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized ?? '';
}
