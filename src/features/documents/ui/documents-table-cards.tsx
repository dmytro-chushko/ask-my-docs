'use client';

import { flexRender, type ReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import type { DocumentsTableFeatures } from '@/features/documents/model/documents-table-features';
import type { DocumentListItem } from '@/shared/api';

const HERO_COLUMN_ID = 'title';
const ACTIONS_COLUMN_ID = 'actions';

type DocumentsTableCardsProps = {
  table: ReactTable<DocumentsTableFeatures, DocumentListItem>;
};

/**
 * Mobile card view over the same TanStack Table row model (admin tables pattern).
 */
export function DocumentsTableCards({ table }: DocumentsTableCardsProps) {
  const t = useTranslations('documents');

  return (
    <ul className="space-y-3" role="list">
      {table.getRowModel().rows.map((row) => {
        const cells = row.getAllCells();
        const heroCell = cells.find(
          (cell) => cell.column.id === HERO_COLUMN_ID,
        );
        const actionsCell = cells.find(
          (cell) => cell.column.id === ACTIONS_COLUMN_ID,
        );
        const fieldCells = cells.filter(
          (cell) =>
            cell.column.id !== HERO_COLUMN_ID &&
            cell.column.id !== ACTIONS_COLUMN_ID,
        );

        return (
          <li key={row.id}>
            <div className="bg-card space-y-4 rounded-xl border p-4 shadow-sm">
              {heroCell ? (
                <div>
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
              {actionsCell ? (
                <div className="border-t pt-3">
                  {flexRender(
                    actionsCell.column.columnDef.cell,
                    actionsCell.getContext(),
                  )}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
