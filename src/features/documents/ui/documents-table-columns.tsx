'use client';

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';

import type { DocumentsTableFeatures } from '@/features/documents/model/documents-table-features';
import { Link } from '@/i18n/navigation';
import type { DocumentListItem, DocumentStatus } from '@/shared/api';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

export type DocumentsTableTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type CreateDocumentsTableColumnsOptions = {
  t: DocumentsTableTranslator;
  formatCreatedAt: (value: Date) => string;
  onDelete: (document: DocumentListItem) => void;
  isDeletingId: string | null;
};

const columnHelper = createColumnHelper<
  DocumentsTableFeatures,
  DocumentListItem
>();

function statusVariant(
  status: DocumentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ready':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'processing':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function createDocumentsTableColumns({
  t,
  formatCreatedAt,
  onDelete,
  isDeletingId,
}: CreateDocumentsTableColumnsOptions): ColumnDef<
  DocumentsTableFeatures,
  DocumentListItem,
  any
>[] {
  return [
    columnHelper.accessor('title', {
      id: 'title',
      header: () => t('columns.title'),
      cell: ({ row }) => (
        <div className="min-w-0 space-y-0.5">
          <Link
            href={`/documents/${row.original.id}`}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {row.original.title}
          </Link>
          <p className="text-muted-foreground truncate text-xs">
            {row.original.originalFilename}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: () => t('columns.status'),
      cell: ({ getValue }) => {
        const status = getValue();

        return (
          <Badge variant={statusVariant(status)}>{t(`status.${status}`)}</Badge>
        );
      },
    }),
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: () => t('columns.createdAt'),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatCreatedAt(getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => t('columns.actions'),
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/documents/${row.original.id}`}>{t('open')}</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isDeletingId === row.original.id}
            onClick={() => {
              onDelete(row.original);
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="sr-only">{t('delete')}</span>
          </Button>
        </div>
      ),
    }),
  ];
}
