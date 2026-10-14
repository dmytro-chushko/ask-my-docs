'use client';

import { useQuery } from '@tanstack/react-query';

import {
  apiClient,
  ApiRequestError,
  getApiErrorMessage,
  type AdminStatsOverview,
} from '@/shared/api';

import { adminStatsQueryKey } from '../keys/admin-stats-query-key';

export function useAdminStatsQuery() {
  return useQuery<AdminStatsOverview>({
    queryKey: adminStatsQueryKey,
    queryFn: async () => {
      const result = await apiClient.admin.getStats();

      if (result.status !== 200) {
        throw new ApiRequestError(
          result.status,
          getApiErrorMessage(result.status, result.body),
        );
      }

      return result.body;
    },
  });
}
