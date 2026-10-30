import { createDocumentUploadIntentForUser } from '@/entities/document/model/document-service';
import { documentUploadIntentBodySchema } from '@/shared/api/contracts/schemas/document';
import { apiErrorResponse } from '@/shared/api/helpers/api-error-response';
import { getSession } from '@/shared/auth/session';
import { AvatarStorageError } from '@/shared/storage';

/**
 * POST /api/documents/upload-intent — implements `documentContract.uploadIntent`.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return apiErrorResponse(401, 'Unauthorized');
    }

    const json: unknown = await request.json();
    const parsed = documentUploadIntentBodySchema.safeParse(json);

    if (!parsed.success) {
      return apiErrorResponse(400, 'Invalid upload intent');
    }

    const intent = await createDocumentUploadIntentForUser(session.user.id, {
      contentType: parsed.data.contentType,
      contentLength: parsed.data.contentLength,
    });

    return Response.json(intent, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AvatarStorageError) {
      return apiErrorResponse(error.status, error.message);
    }

    console.error('[api/documents/upload-intent] failed', error);

    return apiErrorResponse(500, 'Internal Server Error');
  }
}
