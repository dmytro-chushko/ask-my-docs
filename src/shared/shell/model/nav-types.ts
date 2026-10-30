import type { LucideIcon } from 'lucide-react';

export type NavItemMatch = 'exact' | 'prefix';

export type NavItem<TId extends string = string> = {
  id: TId;
  href: string;
  match: NavItemMatch;
  icon: LucideIcon;
};

/** Sidebar scopes used by the app shell (`admin` panel vs product `app`). */
export type SidebarScope = 'admin' | 'app';

export type SidebarNavConfig<TId extends string = string> = {
  labelNamespace: string;
  items: NavItem<TId>[];
};
