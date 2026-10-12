'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';

type AuditLogsTablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function AuditLogsTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: AuditLogsTablePaginationProps) {
  const t = useTranslations('admin.auditLogs');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        {t('pagination.page', { page, totalPages })}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={page <= 1}
          aria-label={t('pagination.previousAriaLabel')}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          {t('pagination.previous')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={page >= totalPages}
          aria-label={t('pagination.nextAriaLabel')}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          {t('pagination.next')}
        </Button>
      </div>
    </div>
  );
}
