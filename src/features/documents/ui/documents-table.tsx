'use client';

import { flexRender } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { useDocumentsTable } from '@/features/documents/hooks/use-documents-table';
import { DocumentsTableCards } from '@/features/documents/ui/documents-table-cards';
import { DocumentsUploadButton } from '@/features/documents/ui/documents-upload-button';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

const SKELETON_ROW_COUNT = 5;
const SKELETON_COLUMN_COUNT = 4;
const SKELETON_CARD_COUNT = 3;

function DocumentsTableSkeleton({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2" aria-hidden="true">
      <Skeleton className="h-10 w-full rounded-md" />
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: SKELETON_COLUMN_COUNT }, (_, columnIndex) => (
            <Skeleton key={columnIndex} className="h-12 flex-1 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DocumentsTable() {
  const t = useTranslations('documents');
  const isMobile = useIsMobile();
  const { table, query } = useDocumentsTable();
  const rows = table.getRowModel().rows;

  if (query.isPending && query.data === undefined) {
    return (
      <div className="space-y-4">
        <DocumentsTableSkeleton isMobile={isMobile} />
      </div>
    );
  }

  if (query.isError && query.data === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <DocumentsUploadButton />
        </div>
        <div className="space-y-3" role="alert">
          <p className="text-destructive text-sm">{t('loadError')}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void query.refetch();
            }}
          >
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {rows.length > 0 ? <DocumentsUploadButton /> : null}
      </div>
      <div
        aria-busy={query.isFetching || undefined}
        className={
          query.isFetching ? 'opacity-60 transition-opacity' : undefined
        }
      >
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-10 text-center">
            <p className="text-muted-foreground text-sm">{t('empty')}</p>
            <DocumentsUploadButton />
          </div>
        ) : isMobile ? (
          <DocumentsTableCards table={table} />
        ) : (
          <Table className="min-w-160">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
