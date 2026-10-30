import { getTranslations } from 'next-intl/server';

import { DocumentsTable } from '@/features/documents';

export async function DocumentsPage() {
  const t = await getTranslations('documents');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <DocumentsTable />
    </div>
  );
}
