import { confirmDocumentUploadForUser } from '@/entities/document/model/document-service';
import { documentConfirmBodySchema } from '@/shared/api/contracts/schemas/document';
import { apiErrorResponse } from '@/shared/api/helpers/api-error-response';
import { getSession } from '@/shared/auth/session';
import { AvatarStorageError } from '@/shared/storage';

/**
 * POST /api/documents/confirm — implements `documentContract.confirm`.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return apiErrorResponse(401, 'Unauthorized');
    }

    const json: unknown = await request.json();
    const parsed = documentConfirmBodySchema.safeParse(json);

    if (!parsed.success) {
      return apiErrorResponse(400, 'Invalid confirm payload');
    }

    const document = await confirmDocumentUploadForUser(
      session.user.id,
      parsed.data,
    );

    return Response.json(document, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AvatarStorageError) {
      return apiErrorResponse(error.status, error.message);
    }

    console.error('[api/documents/confirm] failed', error);

    return apiErrorResponse(500, 'Internal Server Error');
  }
}
