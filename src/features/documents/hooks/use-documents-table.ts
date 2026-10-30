'use client';

import { useTable } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  useDeleteDocumentMutation,
  useDocumentsQuery,
} from '@/entities/document';
import { documentsTableFeatures } from '@/features/documents/model/documents-table-features';
import { createDocumentsTableColumns } from '@/features/documents/ui/documents-table-columns';
import type { DocumentListItem } from '@/shared/api';

export function useDocumentsTable() {
  const t = useTranslations('documents');
  const format = useFormatter();
  const query = useDocumentsQuery();
  const deleteMutation = useDeleteDocumentMutation();
  const [pendingDelete, setPendingDelete] = useState<DocumentListItem | null>(
    null,
  );

  const columns = useMemo(
    () =>
      createDocumentsTableColumns({
        t,
        formatCreatedAt: (value) =>
          format.dateTime(value, { dateStyle: 'medium', timeStyle: 'short' }),
        onDelete: setPendingDelete,
        isDeletingId: deleteMutation.isPending
          ? (deleteMutation.variables ?? null)
          : null,
      }),
    [deleteMutation.isPending, deleteMutation.variables, format, t],
  );

  const table = useTable({
    features: documentsTableFeatures,
    data: query.data?.items ?? [],
    columns,
    getRowId: (row) => row.id,
  });

  return {
    table,
    query,
    pendingDelete,
    setPendingDelete,
    deleteMutation,
  };
}
