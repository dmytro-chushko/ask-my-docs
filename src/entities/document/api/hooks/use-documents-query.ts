'use client';

import { useQuery } from '@tanstack/react-query';

import {
  apiClient,
  ApiRequestError,
  getApiErrorMessage,
  type DocumentListResult,
} from '@/shared/api';

import { documentsQueryKey } from '../keys/documents-query-key';

type UseDocumentsQueryOptions = {
  enabled?: boolean;
};

export function useDocumentsQuery({
  enabled = true,
}: UseDocumentsQueryOptions = {}) {
  return useQuery<DocumentListResult>({
    queryKey: documentsQueryKey,
    enabled,
    queryFn: async () => {
      const result = await apiClient.documents.list({});

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
