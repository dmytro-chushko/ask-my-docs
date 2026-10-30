export type SupabaseStorageConfig = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
  avatarsPrefix: string;
  /** PDF / document objects (same bucket as avatars). */
  assetsPrefix: string;
};

/** `undefined` = not resolved yet; `null` = missing env. */
let cachedConfig: SupabaseStorageConfig | null | undefined;

function readSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = process.env.SUPABASE_URL?.trim() ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'avatars';
  const avatarsPrefix =
    process.env.SUPABASE_AVATARS_PREFIX?.trim() || 'avatars';
  const assetsPrefix = process.env.SUPABASE_ASSETS_PREFIX?.trim() || 'assets';

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url,
    serviceRoleKey,
    bucket,
    avatarsPrefix,
    assetsPrefix,
  };
}

export function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  if (cachedConfig === undefined) {
    cachedConfig = readSupabaseStorageConfig();
  }

  return cachedConfig;
}

export function requireSupabaseStorageConfig(): SupabaseStorageConfig {
  const config = getSupabaseStorageConfig();

  if (!config) {
    throw new Error('Supabase storage is not configured.');
  }

  return config;
}
