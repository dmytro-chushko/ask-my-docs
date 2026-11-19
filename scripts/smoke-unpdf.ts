import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

import { chunkText } from '../src/shared/rag/chunk-text';
import { parsePdf } from '../src/shared/rag/parse-pdf';

async function main() {
  const storagePath = process.argv[2];

  if (!storagePath) {
    console.error('Usage: npx tsx scripts/smoke-unpdf.ts <storagePath>');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'avatars';

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env',
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Download failed: ${error?.message ?? 'no data'}`);
  }

  const bytes = new Uint8Array(await data.arrayBuffer());
  // PDF.js may detach the ArrayBuffer during parse — log size before calling parsePdf.
  const byteLength = bytes.byteLength;
  const parsed = await parsePdf(bytes);
  const chunks = chunkText(parsed.text);
  const chunkSizes = chunks.map((chunk) => chunk.content.length);
  const firstChunk = chunks[0];

  // console.log('path:', storagePath);
  // console.log('bytes:', byteLength);
  // console.log('pages:', parsed.totalPages);
  // console.log('chars:', parsed.text.length);
  // console.log('chunks:', chunks.length);
  // console.log(
  //   'chunkSizes:',
  //   chunkSizes.length > 0
  //     ? {
  //         min: Math.min(...chunkSizes),
  //         max: Math.max(...chunkSizes),
  //         avg: Math.round(
  //           chunkSizes.reduce((sum, size) => sum + size, 0) / chunkSizes.length,
  //         ),
  //       }
  //     : null,
  // );
  // console.log(
  //   'firstChunk:',
  //   firstChunk
  //     ? {
  //         chunkIndex: firstChunk.chunkIndex,
  //         chars: firstChunk.content.length,
  //         preview: firstChunk.content.slice(0, 240).replace(/\s+/g, ' '),
  //       }
  //     : null,
  // );

  return {
    byteLength,
    chunkSizes,
    firstChunk,
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
