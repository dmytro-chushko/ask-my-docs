'use client';

import { useQuery } from '@tanstack/react-query';

import {
  apiClient,
  ApiRequestError,
  getApiErrorMessage,
  type DocumentDetail,
} from '@/shared/api';

import { documentQueryKey } from '../keys/documents-query-key';

type UseDocumentQueryOptions = {
  id: string;
  enabled?: boolean;
};

export function useDocumentQuery({
  id,
  enabled = true,
}: UseDocumentQueryOptions) {
  return useQuery<DocumentDetail>({
    queryKey: documentQueryKey(id),
    enabled: enabled && id.length > 0,
    queryFn: async () => {
      const result = await apiClient.documents.getById({
        params: { id },
      });

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
