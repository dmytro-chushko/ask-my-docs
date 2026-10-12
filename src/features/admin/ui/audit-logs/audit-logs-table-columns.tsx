'use client';

import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import {
  readAuditLogMetadataEmail,
  readAuditLogTargetMetadataEmail,
} from '@/features/admin/lib/read-audit-log-metadata-email';
import type { AdminAuditLogsTableFeatures } from '@/features/admin/model/admin-audit-logs-table-features';
import { AuditLogsTableColumnHeader } from '@/features/admin/ui/audit-logs/audit-logs-table-column-header';
import { Link } from '@/i18n/navigation';
import type { AuditLogItem } from '@/shared/api';
import { Badge } from '@/shared/ui/badge';

type AuditLogsTableTranslator = {
  (key: string): string;
  (key: string, values: Record<string, string>): string;
};

type CreateAuditLogsTableColumnsOptions = {
  t: AuditLogsTableTranslator;
  formatCreatedAt: (value: Date) => string;
};

const columnHelper = createColumnHelper<
  AdminAuditLogsTableFeatures,
  AuditLogItem
>();

function AuditLogDetailsCell({
  metadata,
  t,
}: {
  metadata: AuditLogItem['metadata'];
  t: AuditLogsTableTranslator;
}) {
  if (metadata === null || Object.keys(metadata).length === 0) {
    return (
      <span className="text-muted-foreground text-sm">{t('detailsEmpty')}</span>
    );
  }

  return (
    <details className="text-sm">
      <summary className="text-primary cursor-pointer hover:underline">
        {t('detailsToggle')}
      </summary>
      <pre className="bg-muted mt-2 max-w-xs overflow-x-auto rounded-md p-2 text-left text-xs whitespace-pre-wrap">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </details>
  );
}

export function createAuditLogsTableColumns({
  t,
  formatCreatedAt,
}: CreateAuditLogsTableColumnsOptions): ColumnDef<
  AdminAuditLogsTableFeatures,
  AuditLogItem,
  any
>[] {
  return [
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: ({ column }) => (
        <AuditLogsTableColumnHeader
          column={column}
          title={t('columns.createdAt')}
        />
      ),
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground tabular-nums">
          {formatCreatedAt(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('action', {
      id: 'action',
      header: ({ column }) => (
        <AuditLogsTableColumnHeader
          column={column}
          title={t('columns.action')}
        />
      ),
      enableSorting: true,
      cell: ({ getValue }) => (
        <Badge variant="secondary">{t(`actions.${getValue()}`)}</Badge>
      ),
    }),
    columnHelper.display({
      id: 'actor',
      header: ({ column }) => (
        <AuditLogsTableColumnHeader
          column={column}
          title={t('columns.actor')}
        />
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const actor = row.original.actor;

        if (actor !== null) {
          return <span className="truncate">{actor.email}</span>;
        }

        const metadataEmail = readAuditLogMetadataEmail(row.original.metadata);

        if (metadataEmail !== null) {
          return <span className="truncate">{metadataEmail}</span>;
        }

        return (
          <span className="text-muted-foreground text-sm">
            {t('anonymous')}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'target',
      header: ({ column }) => (
        <AuditLogsTableColumnHeader
          column={column}
          title={t('columns.target')}
        />
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const targetUser = row.original.targetUser;

        if (targetUser !== null) {
          return (
            <Link
              href={`/admin/users/${targetUser.id}`}
              className="text-primary font-medium hover:underline"
              aria-label={t('viewTargetAriaLabel', { email: targetUser.email })}
            >
              {targetUser.email}
            </Link>
          );
        }

        const metadataEmail = readAuditLogTargetMetadataEmail(row.original);

        if (metadataEmail !== null) {
          return <span className="truncate">{metadataEmail}</span>;
        }

        return (
          <span className="text-muted-foreground text-sm">
            {t('targetNone')}
          </span>
        );
      },
    }),
    columnHelper.accessor('success', {
      id: 'success',
      header: ({ column }) => (
        <AuditLogsTableColumnHeader
          column={column}
          title={t('columns.success')}
        />
      ),
      enableSorting: false,
      cell: ({ getValue }) => {
        const isSuccess = getValue();

        return (
          <Badge
            variant={isSuccess ? 'secondary' : 'outline'}
            className={isSuccess ? undefined : 'text-destructive'}
          >
            {isSuccess ? t('successYes') : t('successNo')}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: 'details',
      header: ({ column }) => (
        <AuditLogsTableColumnHeader
          column={column}
          title={t('columns.details')}
        />
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <AuditLogDetailsCell metadata={row.original.metadata} t={t} />
      ),
    }),
  ];
}
