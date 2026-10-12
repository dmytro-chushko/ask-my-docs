'use client';

import { useQuery } from '@tanstack/react-query';

import {
  apiClient,
  ApiRequestError,
  getApiErrorMessage,
  toAuditLogsListQueryParams,
  type AuditLogListResult,
  type AuditLogsListQuery,
} from '@/shared/api';

import { adminAuditLogsQueryKey } from '../keys/admin-audit-logs-query-key';

type UseAdminAuditLogsQueryOptions = {
  params: AuditLogsListQuery;
  enabled?: boolean;
};

export function useAdminAuditLogsQuery({
  params,
  enabled = true,
}: UseAdminAuditLogsQueryOptions) {
  return useQuery<AuditLogListResult>({
    queryKey: adminAuditLogsQueryKey(params),
    enabled,
    queryFn: async () => {
      const result = await apiClient.admin.listAuditLogs({
        query: toAuditLogsListQueryParams(params),
      });

      if (result.status !== 200) {
        throw new ApiRequestError(
          result.status,
          getApiErrorMessage(result.status, result.body),
        );
      }

      return result.body;
    },
    placeholderData: (previousData) => previousData,
  });
}
