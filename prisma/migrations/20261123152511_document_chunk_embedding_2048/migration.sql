-- Change document_chunk.embedding from vector(1536) to vector(2048)
-- to match OPENROUTER_EMBEDDING_DIMENSIONS for nvidia/nemotron-3.5-embed-1b:free.
-- Existing 1536 vectors cannot be cast to vector(2048); clear rows first (re-ingest later).
TRUNCATE TABLE "document_chunk";
ALTER TABLE "document_chunk"
  ALTER COLUMN "embedding" TYPE vector(2048);