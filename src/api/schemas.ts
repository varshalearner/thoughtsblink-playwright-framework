import { z } from 'zod';

export const sessionSchema = z.object({
  access_token: z.string().min(1),
  user: z.object({ id: z.uuid() }),
});

export const listingStatusSchema = z.enum([
  'draft',
  'pending',
  'approved',
  'changes_requested',
  'rejected',
  'sold',
  'paused',
  'removed',
]);

export const listingSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  seller_id: z.uuid(),
  title: z.string().min(1),
  description: z.string(),
  category: z.string(),
  medium: z.string(),
  width_cm: z.number().nonnegative(),
  height_cm: z.number().nonnegative(),
  price_inr: z.number().nonnegative(),
  kind: z.enum(['physical', 'digital']),
  images: z.array(z.string()),
  status: listingStatusSchema,
  stock: z.number().int(),
  featured: z.boolean(),
  rating_avg: z.number(),
  rating_count: z.number().int(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

/** PostgREST's error body; `code` is the Postgres SQLSTATE, e.g. 42501 for an RLS refusal. */
export const postgrestErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.string().nullable(),
  hint: z.string().nullable(),
});

export type Listing = z.infer<typeof listingSchema>;
export type ListingStatus = z.infer<typeof listingStatusSchema>;
