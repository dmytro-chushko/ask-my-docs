'use client';

import { Link } from '@/i18n/navigation';

type AdminStatCardProps = {
  label: string;
  value: number;
  actionLabel: string;
  href: string;
};

export function AdminStatCard({
  label,
  value,
  actionLabel,
  href,
}: AdminStatCardProps) {
  return (
    <div className="bg-card flex h-full flex-col rounded-xl border p-4 shadow-sm">
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <div className="mt-auto space-y-3 pt-3">
        <p className="text-3xl font-semibold tabular-nums">
          {value.toLocaleString()}
        </p>
        <Link
          href={href}
          className="text-primary inline-block text-sm font-medium hover:underline"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
