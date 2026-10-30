import type { Document as PrismaDocument } from '@/generated/prisma/client';
import type { DocumentDetail, DocumentListItem } from '@/shared/api';

export function mapDocumentToListItem(
  document: PrismaDocument,
): DocumentListItem {
  return {
    id: document.id,
    title: document.title,
    originalFilename: document.originalFilename,
    status: document.status,
    byteSize: document.byteSize,
    errorMessage: document.errorMessage,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapDocumentToDetail(document: PrismaDocument): DocumentDetail {
  return {
    ...mapDocumentToListItem(document),
    storagePath: document.storagePath,
    contentType: document.contentType,
  };
}

export function titleFromFilename(originalFilename: string): string {
  const trimmed = originalFilename.trim();
  const withoutExtension = trimmed.replace(/\.pdf$/i, '');

  return withoutExtension.length > 0 ? withoutExtension : trimmed;
}
