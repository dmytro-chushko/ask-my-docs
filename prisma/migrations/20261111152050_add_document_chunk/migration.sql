-- pgvector must already exist in this database (and in template1 for Prisma shadow DB).
-- Enable once as a superuser, e.g.:
--   psql -d template1 -c 'CREATE EXTENSION IF NOT EXISTS vector;'
--   psql -d ask_my_docs -c 'CREATE EXTENSION IF NOT EXISTS vector;'
-- App role `dev_admin` cannot CREATE EXTENSION (needs superuser).

-- CreateTable
CREATE TABLE "document_chunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_chunk_documentId_idx" ON "document_chunk"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "document_chunk_documentId_chunkIndex_key" ON "document_chunk"("documentId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "document_chunk" ADD CONSTRAINT "document_chunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
