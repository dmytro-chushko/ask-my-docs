import {
  AUDIT_LOGS_PAGE_SIZE_DEFAULT,
  type AuditLogsListQuery,
} from '@/shared/api';

export const DEFAULT_ADMIN_AUDIT_LOGS_LIST_QUERY: AuditLogsListQuery = {
  page: 1,
  pageSize: AUDIT_LOGS_PAGE_SIZE_DEFAULT,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};
