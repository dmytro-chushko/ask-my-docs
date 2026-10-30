import { z } from 'zod';

import { DOCUMENT_MAX_BYTES } from '@/shared/storage/storage.constants';

export const documentStatusSchema = z.enum([
  'uploaded',
  'processing',
  'ready',
  'failed',
]);

export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const documentListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  originalFilename: z.string(),
  status: documentStatusSchema,
  byteSize: z.number().int().nonnegative(),
  errorMessage: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DocumentListItem = z.infer<typeof documentListItemSchema>;

export const documentDetailSchema = documentListItemSchema.extend({
  storagePath: z.string(),
  contentType: z.string(),
});

export type DocumentDetail = z.infer<typeof documentDetailSchema>;

export const documentListResultSchema = z.object({
  items: z.array(documentListItemSchema),
});

export type DocumentListResult = z.infer<typeof documentListResultSchema>;

export const documentUploadIntentBodySchema = z.object({
  contentType: z.literal('application/pdf'),
  contentLength: z.number().int().positive().max(DOCUMENT_MAX_BYTES),
  originalFilename: z.string().trim().min(1).max(255),
});

export type DocumentUploadIntentBody = z.infer<
  typeof documentUploadIntentBodySchema
>;

export const documentUploadIntentSchema = z.object({
  uploadUrl: z.string(),
  path: z.string(),
  expiresAt: z.coerce.date(),
  confirmToken: z.string().min(1),
});

export type DocumentUploadIntent = z.infer<typeof documentUploadIntentSchema>;

export const documentConfirmBodySchema = z.object({
  path: z.string().min(1),
  confirmToken: z.string().min(1),
  originalFilename: z.string().trim().min(1).max(255),
  title: z.string().trim().min(1).max(255).optional(),
});

export type DocumentConfirmBody = z.infer<typeof documentConfirmBodySchema>;
