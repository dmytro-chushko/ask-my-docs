import { initContract } from '@ts-rest/core';

import { adminContract } from './admin.contract';
import { documentContract } from './document.contract';
import { registrationContract } from './registration.contract';
import { userContract } from './user.contract';

const c = initContract();

/** Domain API contract root. */
export const contract = c.router({
  users: userContract,
  registration: registrationContract,
  admin: adminContract,
  documents: documentContract,
});

export type AppContract = typeof contract;

export { userContract } from './user.contract';
export type { UserContract } from './user.contract';
export { registrationContract } from './registration.contract';
export type { RegistrationContract } from './registration.contract';
export { adminContract } from './admin.contract';
export type { AdminContract } from './admin.contract';
export { documentContract } from './document.contract';
export type { DocumentContract } from './document.contract';
export { userMeSchema, roleSchema, AVATAR_MAX_BYTES } from './schemas/user';
export type {
  UserMe,
  Role,
  ConnectedProvider,
  AvatarUploadIntent,
} from './schemas/user';
export {
  documentStatusSchema,
  documentListItemSchema,
  documentDetailSchema,
  documentListResultSchema,
  documentUploadIntentBodySchema,
  documentUploadIntentSchema,
  documentConfirmBodySchema,
} from './schemas/document';
export type {
  DocumentStatus,
  DocumentListItem,
  DocumentDetail,
  DocumentListResult,
  DocumentUploadIntentBody,
  DocumentUploadIntent,
  DocumentConfirmBody,
} from './schemas/document';
export {
  ADMIN_USERS_ERROR_MESSAGES,
  ADMIN_USERS_PAGE_SIZE_DEFAULT,
  ADMIN_USERS_PAGE_SIZE_MAX,
  ADMIN_USERS_SEARCH_MAX_LENGTH,
  AUDIT_LOGS_PAGE_SIZE_DEFAULT,
  AUDIT_LOGS_PAGE_SIZE_MAX,
  adminStatsSchema,
  adminUpdateUserRoleBodySchema,
  adminUserDetailSchema,
  adminUserListItemSchema,
  adminUsersListQuerySchema,
  auditActionSchema,
  auditLogItemSchema,
  auditLogListResultSchema,
  auditLogsListQuerySchema,
  toAdminUsersListQueryParams,
  toAuditLogsListQueryParams,
} from './schemas/admin';
export type {
  AdminRevokeSessionsResult,
  AdminStatsOverview,
  AdminUpdateUserRoleBody,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserListResult,
  AdminUserSessionSummary,
  AdminUsersListQuery,
  AdminUsersListQueryParams,
  AuditAction,
  AuditLogItem,
  AuditLogListResult,
  AuditLogUserSummary,
  AuditLogsListQuery,
  AuditLogsListQueryParams,
} from './schemas/admin';
export {
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  internalServerErrorResponse,
} from './schemas/error';
