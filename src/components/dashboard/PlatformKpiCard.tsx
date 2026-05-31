'use client';

import { cn } from '@/components/ui/utils';

type DeltaBadgeProps = {
  value: number | null | undefined;
  label: string;
};

export function DeltaBadge({ value, label }: DeltaBadgeProps) {
  if (value == null) {
    return (
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500">
        {label} —
      </span>
    );
  }
  const positive = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium font-mono',
        positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
      )}
    >
      {positive ? '↑' : '↓'}
      {Math.abs(value)}% {label}
    </span>
  );
}

type PlatformKpiCardProps = {
  title: string;
  value: number;
  wow?: number | null;
  mom?: number | null;
  hero?: boolean;
  icon?: React.ReactNode;
};

export function PlatformKpiCard({ title, value, wow, mom, hero, icon }: PlatformKpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md',
        hero ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-medium uppercase tracking-wider', hero ? 'text-gray-400' : 'text-gray-500')}>
            {title}
          </p>
          <p className={cn('mt-1 text-3xl font-semibold tabular-nums', hero ? 'text-white' : 'text-gray-900')}>
            {value.toLocaleString()}
          </p>
          <p className={cn('mt-0.5 text-xs', hero ? 'text-gray-500' : 'text-gray-400')}>All time</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <DeltaBadge value={wow} label="WoW" />
            <DeltaBadge value={mom} label="MoM" />
          </div>
        </div>
        {icon && (
          <div className={cn('rounded-lg p-2.5 shrink-0', hero ? 'bg-white/10' : 'bg-gray-50')}>{icon}</div>
        )}
      </div>
    </div>
  );
}
