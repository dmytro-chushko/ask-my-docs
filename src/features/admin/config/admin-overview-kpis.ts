import type { AdminStatsOverview } from '@/shared/api';

export type AdminOverviewKpiId =
  | 'totalUsers'
  | 'newUsersLast7Days'
  | 'unverifiedUsers'
  | 'adminCount'
  | 'oauthOnlyUsers';

export type AdminOverviewKpi = {
  id: AdminOverviewKpiId;
  value: number;
  href: string;
};

export function buildAdminOverviewKpis(
  stats: AdminStatsOverview,
): AdminOverviewKpi[] {
  return [
    {
      id: 'totalUsers',
      value: stats.totalUsers,
      href: '/admin/users',
    },
    {
      id: 'newUsersLast7Days',
      value: stats.newUsersLast7Days,
      href: `/admin/users?createdAfter=${encodeURIComponent(stats.newUsersSince)}`,
    },
    {
      id: 'unverifiedUsers',
      value: stats.unverifiedUsers,
      href: '/admin/users?verified=false',
    },
    {
      id: 'adminCount',
      value: stats.adminCount,
      href: '/admin/users?role=admin',
    },
    {
      id: 'oauthOnlyUsers',
      value: stats.oauthOnlyUsers,
      href: '/admin/users',
    },
  ];
}
