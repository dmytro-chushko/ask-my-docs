import type { AuditLogsListQuery } from '@/shared/api';

export function hasAdminAuditLogsActiveFilters(
  params: AuditLogsListQuery,
): boolean {
  return (
    params.action !== undefined ||
    params.from !== undefined ||
    params.to !== undefined
  );
}
