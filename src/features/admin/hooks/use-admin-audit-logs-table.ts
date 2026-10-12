'use client';

import {
  useTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  DEFAULT_ADMIN_AUDIT_LOGS_LIST_QUERY,
  useAdminAuditLogsQuery,
} from '@/entities/audit-log';
import { useAdminAuditLogsListParams } from '@/features/admin/hooks/use-admin-audit-logs-list-params';
import { adminAuditLogsTableFeatures } from '@/features/admin/model/admin-audit-logs-table-features';
import { createAuditLogsTableColumns } from '@/features/admin/ui/audit-logs/audit-logs-table-columns';
import type { AuditLogsListQuery } from '@/shared/api';
import { resolveTableUpdater } from '@/shared/lib/resolve-table-updater';

function resolveSortBy(
  columnId: string,
): AuditLogsListQuery['sortBy'] | undefined {
  if (columnId === 'createdAt' || columnId === 'action') {
    return columnId;
  }

  return undefined;
}

export function useAdminAuditLogsTable() {
  const t = useTranslations('admin.auditLogs');
  const format = useFormatter();
  const { params, setParams, clearFilters } = useAdminAuditLogsListParams();
  const query = useAdminAuditLogsQuery({ params });

  const columns = useMemo(
    () =>
      createAuditLogsTableColumns({
        t,
        formatCreatedAt: (value) =>
          format.dateTime(value, { dateStyle: 'medium', timeStyle: 'short' }),
      }),
    [format, t],
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: params.page - 1,
      pageSize: params.pageSize,
    }),
    [params.page, params.pageSize],
  );

  const sorting = useMemo<SortingState>(
    () => [
      {
        id: params.sortBy,
        desc: params.sortOrder === 'desc',
      },
    ],
    [params.sortBy, params.sortOrder],
  );

  const pageCount = useMemo(() => {
    if (query.data === undefined) {
      return -1;
    }

    return Math.max(1, Math.ceil(query.data.total / params.pageSize));
  }, [params.pageSize, query.data]);

  const table = useTable({
    features: adminAuditLogsTableFeatures,
    data: query.data?.items ?? [],
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    onPaginationChange: (updater) => {
      const next = resolveTableUpdater(updater, pagination);

      setParams({
        page: next.pageIndex + 1,
        pageSize: next.pageSize,
      });
    },
    onSortingChange: (updater) => {
      const next = resolveTableUpdater(updater, sorting);
      const primarySort = next[0];

      if (primarySort === undefined) {
        setParams({
          sortBy: DEFAULT_ADMIN_AUDIT_LOGS_LIST_QUERY.sortBy,
          sortOrder: DEFAULT_ADMIN_AUDIT_LOGS_LIST_QUERY.sortOrder,
        });

        return;
      }

      const sortBy = resolveSortBy(primarySort.id);

      if (sortBy === undefined) {
        return;
      }

      setParams({
        sortBy,
        sortOrder: primarySort.desc ? 'desc' : 'asc',
      });
    },
  });

  return {
    table,
    query,
    params,
    setParams,
    clearFilters,
    total: query.data?.total ?? 0,
  };
}
