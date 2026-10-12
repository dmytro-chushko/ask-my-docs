import { listAuditLogs } from '@/entities/audit-log/model/list-audit-logs';
import { auditLogsListQuerySchema } from '@/shared/api/contracts/schemas/admin';
import { apiErrorResponse } from '@/shared/api/helpers/api-error-response';
import { requireAdminApiSession } from '@/shared/auth/api-session';

/**
 * GET /api/admin/audit-logs — implements `adminContract.listAuditLogs`.
 */
export async function GET(request: Request) {
  try {
    const sessionOrResponse = await requireAdminApiSession(request);

    if (sessionOrResponse instanceof Response) {
      return sessionOrResponse;
    }

    const searchParams = new URL(request.url).searchParams;
    const parsed = auditLogsListQuerySchema.safeParse(
      Object.fromEntries(searchParams),
    );

    if (!parsed.success) {
      return apiErrorResponse(400, 'Invalid audit logs list query');
    }

    const result = await listAuditLogs(parsed.data);

    return Response.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('[api/admin/audit-logs] failed', error);

    return apiErrorResponse(500, 'Internal Server Error');
  }
}
