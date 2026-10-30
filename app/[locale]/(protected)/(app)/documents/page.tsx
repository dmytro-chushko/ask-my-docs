import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { DocumentsPage } from '@/views/documents';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleDocumentsPage({ params }: PageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <DocumentsPage />;
}
