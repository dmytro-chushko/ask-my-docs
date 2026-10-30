import {
  mapDocumentToDetail,
  mapDocumentToListItem,
  titleFromFilename,
} from '@/entities/document/model/map-document';
import type {
  DocumentConfirmBody,
  DocumentDetail,
  DocumentListResult,
} from '@/shared/api';
import { prisma } from '@/shared/db';
import {
  assertUploadedDocument,
  AvatarStorageError,
  createDocumentUploadIntent,
  deleteDocumentObject,
  type DocumentContentType,
  verifyAvatarConfirmToken,
} from '@/shared/storage';

export async function listDocumentsForUser(
  userId: string,
): Promise<DocumentListResult> {
  const items = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return { items: items.map(mapDocumentToListItem) };
}

export async function getDocumentForUser(
  userId: string,
  documentId: string,
): Promise<DocumentDetail | null> {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!document) {
    return null;
  }

  return mapDocumentToDetail(document);
}

export async function createDocumentUploadIntentForUser(
  userId: string,
  input: { contentType: DocumentContentType; contentLength: number },
) {
  return createDocumentUploadIntent(userId, input);
}

export async function confirmDocumentUploadForUser(
  userId: string,
  body: DocumentConfirmBody,
): Promise<DocumentDetail> {
  verifyAvatarConfirmToken(body.confirmToken, userId, body.path);

  const { byteSize } = await assertUploadedDocument(body.path, userId);
  const title = body.title?.trim() || titleFromFilename(body.originalFilename);

  try {
    const document = await prisma.document.create({
      data: {
        userId,
        title,
        originalFilename: body.originalFilename.trim(),
        storagePath: body.path,
        contentType: 'application/pdf',
        byteSize,
        status: 'uploaded',
      },
    });

    return mapDocumentToDetail(document);
  } catch (error: unknown) {
    await deleteDocumentObject(body.path).catch(() => undefined);
    throw error;
  }
}

export async function deleteDocumentForUser(
  userId: string,
  documentId: string,
): Promise<{ id: string } | null> {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!document) {
    return null;
  }

  try {
    await deleteDocumentObject(document.storagePath);
  } catch (error: unknown) {
    if (!(error instanceof AvatarStorageError && error.status === 500)) {
      throw error;
    }

    console.error(
      '[documents] storage delete failed; removing DB row anyway',
      document.storagePath,
    );
  }

  await prisma.document.delete({ where: { id: document.id } });

  return { id: document.id };
}
