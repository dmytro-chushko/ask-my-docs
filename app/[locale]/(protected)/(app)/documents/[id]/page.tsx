import { setRequestLocale } from 'next-intl/server';

import { DocumentDetailPage } from '@/views/document-detail';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function LocaleDocumentDetailPage({ params }: PageProps) {
  const { locale, id } = await params;

  setRequestLocale(locale);

  return <DocumentDetailPage documentId={id} />;
}
