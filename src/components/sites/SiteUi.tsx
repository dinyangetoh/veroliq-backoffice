import { cn } from '@/components/ui/utils';

export function StatusPill({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: 'live' | 'offline' | 'verified' | 'pending' | 'default';
}) {
  const styles = {
    live: 'bg-green-100 text-green-800',
    offline: 'bg-gray-100 text-gray-600',
    verified: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    default: 'bg-gray-100 text-gray-700',
  }[variant];

  const dot = {
    live: 'bg-green-500',
    offline: 'bg-gray-400',
    verified: 'bg-green-500',
    pending: 'bg-amber-500',
    default: 'bg-gray-400',
  }[variant];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', styles)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}

export function SiteKpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function formatRelativeTime(iso: string | null | undefined) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export { formatRelativeTime };
