'use client';

import { useTranslations } from 'next-intl';

import { useDocumentQuery } from '@/entities/document';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

type DocumentDetailPageProps = {
  documentId: string;
};

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const t = useTranslations('documents');
  const query = useDocumentQuery({ id: documentId });

  if (query.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full max-w-xl" />
      </div>
    );
  }

  if (query.isError || query.data === undefined) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm" role="alert">
          {t('detail.loadError')}
        </p>
        <Button asChild variant="outline">
          <Link href="/documents">{t('detail.back')}</Link>
        </Button>
      </div>
    );
  }

  const document = query.data;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link href="/documents">{t('detail.back')}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {document.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {document.originalFilename}
        </p>
      </div>

      <dl className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground text-sm">
            {t('columns.status')}
          </dt>
          <dd>
            <Badge variant="outline">{t(`status.${document.status}`)}</Badge>
          </dd>
        </div>
        {document.errorMessage ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground text-sm">
              {t('detail.error')}
            </dt>
            <dd className="text-destructive max-w-sm text-right text-sm">
              {document.errorMessage}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground text-sm">
            {t('detail.byteSize')}
          </dt>
          <dd className="text-sm">
            {t('detail.bytes', { count: document.byteSize })}
          </dd>
        </div>
      </dl>

      <p className="text-muted-foreground text-sm">{t('detail.ingestHint')}</p>
    </div>
  );
}
