import type { ReactNode } from 'react';

import { requireUser } from '@/shared/auth/session';
import { AppSidebar } from '@/shared/shell/ui/app-sidebar';
import { SidebarInset } from '@/shared/ui/sidebar';

type AppShellLayoutProps = {
  children: ReactNode;
};

/**
 * Product shell (dashboard, documents, …).
 * Reuses locale-level SidebarProvider — same mobile sheet rules as admin.
 */
export default async function AppShellLayout({
  children,
}: AppShellLayoutProps) {
  await requireUser();

  return (
    <div className="flex min-h-0 w-full flex-1">
      <AppSidebar scope="app" />
      <SidebarInset className="mx-auto w-full max-w-7xl px-6 py-8">
        {children}
      </SidebarInset>
    </div>
  );
}
