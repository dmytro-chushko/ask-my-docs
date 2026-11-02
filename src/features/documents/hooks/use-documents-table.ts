'use client';

import { useTable } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useDocumentsQuery } from '@/entities/document';
import { documentsTableFeatures } from '@/features/documents/model/documents-table-features';
import { createDocumentsTableColumns } from '@/features/documents/ui/documents-table-columns';
import { useModal } from '@/shared/modal/use-modal';

export function useDocumentsTable() {
  const t = useTranslations('documents');
  const format = useFormatter();
  const query = useDocumentsQuery();
  const { open } = useModal();

  const columns = useMemo(
    () =>
      createDocumentsTableColumns({
        t,
        formatCreatedAt: (value) =>
          format.dateTime(value, { dateStyle: 'medium', timeStyle: 'short' }),
        onDelete: (document) => {
          open('document-deletion', {
            documentId: document.id,
            title: document.title,
          });
        },
      }),
    [format, open, t],
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
  };
}
