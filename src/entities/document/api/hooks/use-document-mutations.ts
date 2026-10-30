'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  apiClient,
  ApiRequestError,
  getApiErrorMessage,
  type DocumentDetail,
} from '@/shared/api';

import {
  documentQueryKey,
  documentsQueryKey,
} from '../keys/documents-query-key';

async function uploadDocumentFile(file: File): Promise<DocumentDetail> {
  const intent = await apiClient.documents.uploadIntent({
    body: {
      contentType: 'application/pdf',
      contentLength: file.size,
      originalFilename: file.name,
    },
  });

  if (intent.status !== 200) {
    throw new ApiRequestError(
      intent.status,
      getApiErrorMessage(intent.status, intent.body),
    );
  }

  const uploadResponse = await fetch(intent.body.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new ApiRequestError(
      uploadResponse.status,
      'Failed to upload document file.',
    );
  }

  const confirmed = await apiClient.documents.confirm({
    body: {
      path: intent.body.path,
      confirmToken: intent.body.confirmToken,
      originalFilename: file.name,
    },
  });

  if (confirmed.status !== 201) {
    throw new ApiRequestError(
      confirmed.status,
      getApiErrorMessage(confirmed.status, confirmed.body),
    );
  }

  return confirmed.body;
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocumentFile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ id: string }> => {
      const result = await apiClient.documents.remove({
        params: { id },
        body: {},
      });

      if (result.status !== 200) {
        throw new ApiRequestError(
          result.status,
          getApiErrorMessage(result.status, result.body),
        );
      }

      return result.body;
    },
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
      queryClient.removeQueries({ queryKey: documentQueryKey(id) });
    },
  });
}
