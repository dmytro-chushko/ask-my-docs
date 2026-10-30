export {
  AVATAR_ALLOWED_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
  AVATAR_SIGNED_URL_TTL_SECONDS,
  CONTENT_TYPE_TO_EXTENSION,
  DOCUMENT_ALLOWED_CONTENT_TYPES,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_SIGNED_URL_TTL_SECONDS,
  type AvatarContentType,
  type AvatarUploadIntentResult,
  type DocumentContentType,
  type DocumentUploadIntentResult,
} from './storage.constants';
export {
  detectAvatarContentType,
  extractStoragePathFromPublicUrl,
  isAvatarPathOwnedByUser,
  isManagedAvatarPublicUrl,
  isPdfBuffer,
  isUserScopedStoragePath,
} from './storage.utils';
export {
  getSupabaseStorageConfig,
  requireSupabaseStorageConfig,
} from './supabase-config';
export {
  assertUploadedAvatar,
  assertUploadedDocument,
  AvatarStorageError,
  createAvatarUploadIntent,
  createDocumentUploadIntent,
  deleteDocumentObject,
  deleteManagedAvatarIfPresent,
  getAvatarPublicUrl,
  isManagedUserAvatar,
  isStorageConfigured,
} from './supabase-storage';
export {
  createAvatarConfirmToken,
  verifyAvatarConfirmToken,
} from './avatar-confirm-token';
