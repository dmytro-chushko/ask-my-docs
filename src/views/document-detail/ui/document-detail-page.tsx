'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { useDocumentQuery } from '@/entities/document';
import { documentStatusBadgeVariant } from '@/features/documents/lib/document-status-badge-variant';
import { Link } from '@/i18n/navigation';
import { useModal } from '@/shared/modal/use-modal';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

/** Flip when `/chat` page ships (L6). */
const IS_CHAT_ROUTE_AVAILABLE = false;

type DocumentDetailPageProps = {
  documentId: string;
};

export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const t = useTranslations('documents');
  const format = useFormatter();
  const query = useDocumentQuery({ id: documentId });
  const { open } = useModal();

  if (query.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full max-w-xl" />
        <Skeleton className="h-10 w-48" />
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
  const isReady = document.status === 'ready';
  const canAsk = isReady && IS_CHAT_ROUTE_AVAILABLE;
  const askHint = !isReady
    ? t('detail.askNotReady')
    : t('detail.askComingSoon');

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
            <Badge variant={documentStatusBadgeVariant(document.status)}>
              {t(`status.${document.status}`)}
            </Badge>
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
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground text-sm">
            {t('detail.createdAt')}
          </dt>
          <dd className="text-sm">
            {format.dateTime(document.createdAt, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground text-sm">
            {t('detail.updatedAt')}
          </dt>
          <dd className="text-sm">
            {format.dateTime(document.updatedAt, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {canAsk ? (
          <Button asChild>
            <Link href={`/chat?documentId=${document.id}`}>
              {t('detail.ask')}
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Button type="button" disabled aria-describedby="ask-hint">
              {t('detail.ask')}
            </Button>
            <p className="text-muted-foreground text-xs" id="ask-hint">
              {askHint}
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            open('document-deletion', {
              documentId: document.id,
              title: document.title,
              redirectTo: '/documents',
            });
          }}
        >
          {t('delete')}
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">{t('detail.ingestHint')}</p>
    </div>
  );
}
