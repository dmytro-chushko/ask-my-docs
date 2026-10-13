import type { AuditLogsListQuery } from '@/shared/api';

export const adminAuditLogsQueryKeyRoot = ['admin', 'audit-logs'] as const;

export function adminAuditLogsQueryKey(params: AuditLogsListQuery) {
  return [...adminAuditLogsQueryKeyRoot, 'list', params] as const;
}
