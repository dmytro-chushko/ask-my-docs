import { createHash } from 'node:crypto';

import 'dotenv/config';

import { prisma } from '../src/shared/db/prisma';
import { replaceDocumentChunks } from '../src/shared/rag/persist-chunks';

function createSmokeEmbedding(dimensions: number, seed: string): number[] {
  const digest = createHash('sha256').update(seed).digest();
  const embedding = new Array<number>(dimensions);

  for (let i = 0; i < dimensions; i += 1) {
    const byte = digest[i % digest.length] ?? 0;
    embedding[i] = (byte / 255) * 2 - 1;
  }

  return embedding;
}

async function main() {
  const documentIdArg = process.argv[2]?.trim();
  const dimensions = Number(
    process.env.OPENROUTER_EMBEDDING_DIMENSIONS?.trim() ?? '',
  );

  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new Error(
      'OPENROUTER_EMBEDDING_DIMENSIONS must be a positive integer.',
    );
  }

  const document = documentIdArg
    ? await prisma.document.findUnique({
        where: { id: documentIdArg },
        select: { id: true, title: true },
      })
    : await prisma.document.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true },
      });

  if (!document) {
    throw new Error(
      documentIdArg
        ? `Document not found: ${documentIdArg}`
        : 'No documents in DB. Upload one first, or pass a documentId.',
    );
  }

  const result = await replaceDocumentChunks(document.id, [
    {
      chunkIndex: 0,
      content: 'Smoke persist chunk zero.',
      embedding: createSmokeEmbedding(dimensions, `${document.id}:0`),
    },
    {
      chunkIndex: 1,
      content: 'Smoke persist chunk one.',
      embedding: createSmokeEmbedding(dimensions, `${document.id}:1`),
    },
  ]);

  const rows = await prisma.$queryRaw<
    Array<{
      chunkIndex: number;
      content: string;
      dims: number;
    }>
  >`
    SELECT
      "chunkIndex",
      content,
      vector_dims(embedding) AS dims
    FROM "document_chunk"
    WHERE "documentId" = ${document.id}
    ORDER BY "chunkIndex" ASC
  `;

  const ok =
    result.chunkCount === 2 &&
    rows.length === 2 &&
    rows.every((row) => row.dims === dimensions);

  // console.log('documentId:', document.id);
  // console.log('title:', document.title);
  // console.log('inserted:', result.chunkCount);
  // console.log('rows:', rows);
  // console.log('expectedDims:', dimensions);
  // console.log('ok:', ok);

  if (!ok) {
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
