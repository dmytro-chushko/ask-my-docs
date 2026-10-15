'use client';

import { useTranslations } from 'next-intl';

import { useAdminStatsQuery } from '@/entities/admin';
import { buildAdminOverviewKpis } from '@/features/admin/config/admin-overview-kpis';
import { AdminStatCard } from '@/features/admin/ui/admin-stat-card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

const KPI_SKELETON_COUNT = 5;

function AdminOverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: KPI_SKELETON_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

export function AdminOverview() {
  const t = useTranslations('admin.overview');
  const { data, isPending, isError, refetch } = useAdminStatsQuery();

  if (isPending) {
    return <AdminOverviewSkeleton />;
  }

  if (isError || data === undefined) {
    return (
      <div className="space-y-3" role="alert">
        <p className="text-destructive text-sm">{t('loadError')}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void refetch();
          }}
        >
          {t('retry')}
        </Button>
      </div>
    );
  }

  const kpis = buildAdminOverviewKpis(data);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <AdminStatCard
          key={kpi.id}
          label={t(`stats.${kpi.id}.label`)}
          value={kpi.value}
          actionLabel={t(`stats.${kpi.id}.action`)}
          href={kpi.href}
        />
      ))}
    </div>
  );
}
