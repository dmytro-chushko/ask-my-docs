import { listDocumentsForUser } from '@/entities/document/model/document-service';
import { apiErrorResponse } from '@/shared/api/helpers/api-error-response';
import { getSession } from '@/shared/auth/session';

/**
 * GET /api/documents — implements `documentContract.list`.
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return apiErrorResponse(401, 'Unauthorized');
    }

    const result = await listDocumentsForUser(session.user.id);

    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('[api/documents] list failed', error);

    return apiErrorResponse(500, 'Internal Server Error');
  }
}
