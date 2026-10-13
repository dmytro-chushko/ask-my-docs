import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AuditLogsTable } from '@/features/admin/ui/audit-logs/audit-logs-table';
import { routing } from '@/i18n/routing';
import { Skeleton } from '@/shared/ui/skeleton';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AdminAuditLogsPage({ params }: PageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('admin.auditLogs');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      {/* `AuditLogsTable` reads list filters from the URL via `useSearchParams`. */}
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <AuditLogsTable />
      </Suspense>
    </div>
  );
}
