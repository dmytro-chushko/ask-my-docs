import type { AdminStatsOverview } from '@/shared/api/contracts';
import {
  CREDENTIAL_PROVIDER_ID,
  OAUTH_PROVIDER_IDS,
} from '@/shared/auth/oauth-providers';
import { prisma } from '@/shared/db/prisma';

const NEW_USERS_WINDOW_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function resolveNewUsersSince(): Date {
  return new Date(Date.now() - NEW_USERS_WINDOW_DAYS * MS_PER_DAY);
}

/**
 * Aggregate workspace KPIs for the admin overview.
 * Counts run in parallel; failures surface to the route handler.
 */
export async function getAdminStatsOverview(): Promise<AdminStatsOverview> {
  const newUsersSince = resolveNewUsersSince();

  const [
    totalUsers,
    newUsersLast7Days,
    unverifiedUsers,
    adminCount,
    oauthOnlyUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: newUsersSince } },
    }),
    prisma.user.count({
      where: { emailVerified: false },
    }),
    prisma.user.count({
      where: { role: 'admin' },
    }),
    prisma.user.count({
      where: {
        AND: [
          {
            accounts: {
              some: {
                providerId: { in: [...OAUTH_PROVIDER_IDS] },
              },
            },
          },
          {
            NOT: {
              accounts: {
                some: {
                  providerId: CREDENTIAL_PROVIDER_ID,
                  password: { not: null },
                },
              },
            },
          },
        ],
      },
    }),
  ]);

  return {
    totalUsers,
    newUsersLast7Days,
    unverifiedUsers,
    adminCount,
    oauthOnlyUsers,
    newUsersSince: newUsersSince.toISOString(),
    generatedAt: new Date().toISOString(),
  };
}
