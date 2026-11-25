import 'dotenv/config';

import { embedText } from '../src/shared/rag/embed';

async function main() {
  const text = process.argv[2]?.trim() || 'ask my docs embedding smoke test';
  const expectedDims = Number(
    process.env.OPENROUTER_EMBEDDING_DIMENSIONS?.trim() ?? '',
  );

  const embedding = await embedText(text);
  const ok =
    Number.isInteger(expectedDims) &&
    expectedDims > 0 &&
    embedding.length === expectedDims;

  // console.log('model:', process.env.OPENROUTER_EMBEDDING_MODEL);
  // console.log('embedding:', embedding);
  // console.log('dims:', embedding.length);
  // console.log('expectedDims:', expectedDims);
  // console.log('ok:', ok);

  if (!ok) {
    process.exit(1);
  }

  return embedding;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
