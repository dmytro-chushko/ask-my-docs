'use client';

import { flexRender } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useDocumentsTable } from '@/features/documents/hooks/use-documents-table';
import { DocumentsTableCards } from '@/features/documents/ui/documents-table-cards';
import { DocumentsUploadButton } from '@/features/documents/ui/documents-upload-button';
import { getApiErrorMessage } from '@/shared/api';
import { ApiRequestError } from '@/shared/api/errors/api-request-error';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
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
  const { table, query, pendingDelete, setPendingDelete, deleteMutation } =
    useDocumentsTable();
  const rows = table.getRowModel().rows;

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success(t('deleteSuccess'));
      setPendingDelete(null);
    } catch (error: unknown) {
      const message =
        error instanceof ApiRequestError
          ? getApiErrorMessage(error.status, { error: error.message })
          : t('deleteFailed');
      toast.error(message);
    }
  }

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
        {rows.length > 0 && <DocumentsUploadButton />}
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

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription', {
                title: pendingDelete?.title ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t('deleteCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleteMutation.isPending
                ? t('deleteDeleting')
                : t('deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
