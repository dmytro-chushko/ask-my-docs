import { adminNavItems } from '@/features/admin/config/admin-nav-items';
import { appNavItems } from '@/features/app-nav/config/app-nav-items';

import type { SidebarNavConfig, SidebarScope } from '../model/nav-types';

export const sidebarNavConfig = {
  admin: {
    labelNamespace: 'admin.nav',
    items: adminNavItems,
  },
  app: {
    labelNamespace: 'app.nav',
    items: appNavItems,
  },
} as const satisfies Record<SidebarScope, SidebarNavConfig>;
