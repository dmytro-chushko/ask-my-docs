import {
  deleteDocumentForUser,
  getDocumentForUser,
} from '@/entities/document/model/document-service';
import { apiErrorResponse } from '@/shared/api/helpers/api-error-response';
import { getSession } from '@/shared/auth/session';
import { AvatarStorageError } from '@/shared/storage';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/documents/:id — implements `documentContract.getById`.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return apiErrorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    const document = await getDocumentForUser(session.user.id, id);

    if (!document) {
      return apiErrorResponse(404, 'Document not found');
    }

    return Response.json(document, { status: 200 });
  } catch (error: unknown) {
    console.error('[api/documents/:id] get failed', error);

    return apiErrorResponse(500, 'Internal Server Error');
  }
}

/**
 * DELETE /api/documents/:id — implements `documentContract.remove`.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return apiErrorResponse(401, 'Unauthorized');
    }

    // Consume optional JSON body from ts-rest client (`{}`).
    if (request.headers.get('content-type')?.includes('application/json')) {
      await request.json().catch(() => undefined);
    }

    const { id } = await context.params;
    const result = await deleteDocumentForUser(session.user.id, id);

    if (!result) {
      return apiErrorResponse(404, 'Document not found');
    }

    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AvatarStorageError) {
      return apiErrorResponse(error.status, error.message);
    }

    console.error('[api/documents/:id] delete failed', error);

    return apiErrorResponse(500, 'Internal Server Error');
  }
}
