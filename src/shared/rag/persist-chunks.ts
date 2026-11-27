import { randomUUID } from 'node:crypto';

import { prisma } from '@/shared/db';

export class PersistChunksError extends Error {
  readonly code = 'PERSIST_CHUNKS_FAILED' as const;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PersistChunksError';
  }
}

export type DocumentChunkToPersist = {
  chunkIndex: number;
  content: string;
  embedding: number[];
};

export type ReplaceDocumentChunksResult = {
  documentId: string;
  chunkCount: number;
};

function requireEmbeddingDimensions(): number {
  const dimensionsRaw =
    process.env.OPENROUTER_EMBEDDING_DIMENSIONS?.trim() ?? '';
  const dimensions = Number(dimensionsRaw);

  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new PersistChunksError(
      'OPENROUTER_EMBEDDING_DIMENSIONS must be a positive integer.',
    );
  }

  return dimensions;
}

/** pgvector text form accepted by `$n::vector`. */
export function formatPgvectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

function assertChunk(
  chunk: DocumentChunkToPersist,
  expectedDimensions: number,
  seenIndexes: Set<number>,
): void {
  if (!Number.isInteger(chunk.chunkIndex) || chunk.chunkIndex < 0) {
    throw new PersistChunksError(
      `chunkIndex must be a non-negative integer (got ${chunk.chunkIndex}).`,
    );
  }

  if (seenIndexes.has(chunk.chunkIndex)) {
    throw new PersistChunksError(
      `Duplicate chunkIndex ${chunk.chunkIndex} in persist batch.`,
    );
  }

  seenIndexes.add(chunk.chunkIndex);

  if (!chunk.content.trim()) {
    throw new PersistChunksError(
      `Cannot persist empty content at chunkIndex ${chunk.chunkIndex}.`,
    );
  }

  if (
    !Array.isArray(chunk.embedding) ||
    !chunk.embedding.every(
      (value) => typeof value === 'number' && Number.isFinite(value),
    )
  ) {
    throw new PersistChunksError(
      `embedding at chunkIndex ${chunk.chunkIndex} must be a finite number[].`,
    );
  }

  if (chunk.embedding.length !== expectedDimensions) {
    throw new PersistChunksError(
      `embedding at chunkIndex ${chunk.chunkIndex} has ${chunk.embedding.length} dims; expected ${expectedDimensions}.`,
    );
  }
}

/**
 * Replace all `document_chunk` rows for one document (delete + insert).
 * Uses raw SQL because Prisma cannot write `Unsupported("vector")`.
 */
export async function replaceDocumentChunks(
  documentId: string,
  chunks: DocumentChunkToPersist[],
): Promise<ReplaceDocumentChunksResult> {
  const id = documentId.trim();

  if (!id) {
    throw new PersistChunksError('documentId is required.');
  }

  const expectedDimensions = requireEmbeddingDimensions();
  const seenIndexes = new Set<number>();

  for (const chunk of chunks) {
    assertChunk(chunk, expectedDimensions, seenIndexes);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM "document_chunk"
        WHERE "documentId" = ${id}
      `;

      for (const chunk of chunks) {
        const vectorLiteral = formatPgvectorLiteral(chunk.embedding);

        await tx.$executeRaw`
          INSERT INTO "document_chunk" (
            id,
            "documentId",
            "chunkIndex",
            content,
            embedding,
            "createdAt"
          )
          VALUES (
            ${randomUUID()},
            ${id},
            ${chunk.chunkIndex},
            ${chunk.content},
            ${vectorLiteral}::vector,
            NOW()
          )
        `;
      }
    });
  } catch (error) {
    if (error instanceof PersistChunksError) {
      throw error;
    }

    throw new PersistChunksError(
      `Failed to replace chunks for document ${id}.`,
      { cause: error },
    );
  }

  return { documentId: id, chunkCount: chunks.length };
}
