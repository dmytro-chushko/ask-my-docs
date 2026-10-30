import { FileText, LayoutDashboard } from 'lucide-react';

import type { NavItem } from '@/shared/shell/model/nav-types';

export type AppNavItemId = 'dashboard' | 'documents';

export type AppNavItem = NavItem<AppNavItemId>;

export const appNavItems: AppNavItem[] = [
  {
    id: 'dashboard',
    href: '/dashboard',
    match: 'exact',
    icon: LayoutDashboard,
  },
  {
    id: 'documents',
    href: '/documents',
    match: 'prefix',
    icon: FileText,
  },
];
