'use client';

import { flexRender, type ReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import type { AdminAuditLogsTableFeatures } from '@/features/admin/model/admin-audit-logs-table-features';
import type { AuditLogItem } from '@/shared/api';

const HERO_COLUMN_ID = 'createdAt';

type AuditLogsTableCardsProps = {
  table: ReactTable<AdminAuditLogsTableFeatures, AuditLogItem>;
};

/**
 * Mobile card view over the same TanStack Table row model.
 * Cells are rendered via flexRender — no parallel data mapping.
 */
export function AuditLogsTableCards({ table }: AuditLogsTableCardsProps) {
  const t = useTranslations('admin.auditLogs');

  return (
    <ul className="space-y-3" role="list">
      {table.getRowModel().rows.map((row) => {
        const cells = row.getAllCells();
        const heroCell = cells.find(
          (cell) => cell.column.id === HERO_COLUMN_ID,
        );
        const fieldCells = cells.filter(
          (cell) => cell.column.id !== HERO_COLUMN_ID,
        );

        return (
          <li key={row.id}>
            <div className="bg-card space-y-4 rounded-xl border p-4 shadow-sm">
              {heroCell ? (
                <div className="font-medium">
                  {flexRender(
                    heroCell.column.columnDef.cell,
                    heroCell.getContext(),
                  )}
                </div>
              ) : null}
              <dl className="space-y-3">
                {fieldCells.map((cell) => (
                  <div
                    key={cell.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="text-muted-foreground shrink-0 text-sm">
                      {t(`columns.${cell.column.id}`)}
                    </dt>
                    <dd className="min-w-0 text-right">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
