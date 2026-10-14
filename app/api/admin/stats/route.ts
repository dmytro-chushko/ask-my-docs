import { getAdminStatsOverview } from '@/entities/admin/model/admin-stats-service';
import { apiErrorResponse } from '@/shared/api/helpers/api-error-response';
import { requireAdminApiSession } from '@/shared/auth/api-session';

/**
 * GET /api/admin/stats — implements `adminContract.getStats`.
 */
export async function GET(request: Request) {
  try {
    const sessionOrResponse = await requireAdminApiSession(request);

    if (sessionOrResponse instanceof Response) {
      return sessionOrResponse;
    }

    const result = await getAdminStatsOverview();

    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('[api/admin/stats] failed', error);

    return apiErrorResponse(500, 'Internal Server Error');
  }
}
