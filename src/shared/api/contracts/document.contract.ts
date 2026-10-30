import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import {
  documentConfirmBodySchema,
  documentDetailSchema,
  documentListResultSchema,
  documentUploadIntentBodySchema,
  documentUploadIntentSchema,
} from './schemas/document';
import {
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from './schemas/error';

const c = initContract();

export const documentContract = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      responses: {
        200: documentListResultSchema,
        401: unauthorizedResponse,
        500: internalServerErrorResponse,
      },
      summary: 'List current user documents',
    },

    getById: {
      method: 'GET',
      path: '/:id',
      pathParams: z.object({ id: z.string().min(1) }),
      responses: {
        200: documentDetailSchema,
        401: unauthorizedResponse,
        404: notFoundResponse,
        500: internalServerErrorResponse,
      },
      summary: 'Get one document owned by current user',
    },

    uploadIntent: {
      method: 'POST',
      path: '/upload-intent',
      body: documentUploadIntentBodySchema,
      responses: {
        200: documentUploadIntentSchema,
        400: badRequestResponse,
        401: unauthorizedResponse,
        500: internalServerErrorResponse,
      },
      summary: 'Create signed upload URL for a PDF in Supabase assets/',
    },

    confirm: {
      method: 'POST',
      path: '/confirm',
      body: documentConfirmBodySchema,
      responses: {
        201: documentDetailSchema,
        400: badRequestResponse,
        401: unauthorizedResponse,
        500: internalServerErrorResponse,
      },
      summary: 'Confirm PDF upload and create document row',
    },

    remove: {
      method: 'DELETE',
      path: '/:id',
      pathParams: z.object({ id: z.string().min(1) }),
      body: z.object({}).strict(),
      responses: {
        200: z.object({ id: z.string() }),
        401: unauthorizedResponse,
        404: notFoundResponse,
        500: internalServerErrorResponse,
      },
      summary: 'Delete document metadata and storage object',
    },
  },
  {
    pathPrefix: '/documents',
  },
);

export type DocumentContract = typeof documentContract;
