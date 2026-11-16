import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

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
  const result = await parsePdf(bytes);

  // console.log('path:', storagePath);
  // console.log('bytes:', byteLength);
  // console.log('pages:', result.totalPages);
  // console.log('chars:', result.text.length);
  // console.log('preview:', result.text.slice(0, 300).replace(/\s+/g, ' '));

  return { result, byteLength };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
