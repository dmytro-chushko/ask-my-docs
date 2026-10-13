import type { Prisma } from '@/generated/prisma/client';
import type {
  AuditLogItem,
  AuditLogListResult,
  AuditLogsListQuery,
} from '@/shared/api/contracts';
import { prisma } from '@/shared/db/prisma';

const AUDIT_USER_SELECT = {
  select: {
    id: true,
    email: true,
    name: true,
  },
} as const;

function buildWhere(query: AuditLogsListQuery): Prisma.AuditLogWhereInput {
  const createdAt =
    query.from !== undefined || query.to !== undefined
      ? {
          ...(query.from !== undefined ? { gte: query.from } : {}),
          ...(query.to !== undefined ? { lte: query.to } : {}),
        }
      : undefined;

  return {
    ...(query.action !== undefined ? { action: query.action } : {}),
    ...(query.actorId !== undefined ? { actorId: query.actorId } : {}),
    ...(query.targetUserId !== undefined
      ? { targetUserId: query.targetUserId }
      : {}),
    ...(createdAt !== undefined ? { createdAt } : {}),
  };
}

function toMetadataRecord(
  metadata: Prisma.JsonValue | null,
): AuditLogItem['metadata'] {
  if (
    metadata === null ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return null;
  }

  return metadata as Record<string, unknown>;
}

export async function listAuditLogs(
  query: AuditLogsListQuery,
): Promise<AuditLogListResult> {
  const where = buildWhere(query);

  const [total, rows] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        actor: AUDIT_USER_SELECT,
        targetUser: AUDIT_USER_SELECT,
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      action: row.action,
      actorId: row.actorId,
      targetUserId: row.targetUserId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      success: row.success,
      metadata: toMetadataRecord(row.metadata),
      createdAt: row.createdAt,
      actor: row.actor
        ? {
            id: row.actor.id,
            email: row.actor.email,
            name: row.actor.name,
          }
        : null,
      targetUser: row.targetUser
        ? {
            id: row.targetUser.id,
            email: row.targetUser.email,
            name: row.targetUser.name,
          }
        : null,
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}
