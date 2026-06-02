import type { WindowCounts } from '@/types/admin';

const ROWS: Array<{ key: keyof WindowCounts; label: string }> = [
  { key: 'users', label: 'Users' },
  { key: 'sites', label: 'Sites' },
  { key: 'leads', label: 'Leads' },
  { key: 'allSessions', label: 'All Sessions' },
  { key: 'chatSessions', label: 'Chat Sessions' },
  { key: 'messages', label: 'Messages' },
];

type PlatformGrowthSummaryProps = {
  week: WindowCounts;
  prevWeek: WindowCounts;
};

export function PlatformGrowthSummary({ week, prevWeek }: PlatformGrowthSummaryProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">This week vs last week</h3>
      <p className="mt-0.5 text-xs text-gray-500">Rolling 7-day windows</p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
            <th className="pb-2 font-medium">Metric</th>
            <th className="pb-2 font-medium text-right">This week</th>
            <th className="pb-2 font-medium text-right">Last week</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ key, label }) => (
            <tr key={key} className="border-b border-gray-50 last:border-0">
              <td className="py-2.5 text-gray-700">{label}</td>
              <td className="py-2.5 text-right font-medium tabular-nums text-gray-900">
                {(week[key] as number).toLocaleString()}
              </td>
              <td className="py-2.5 text-right tabular-nums text-gray-500">
                {(prevWeek[key] as number).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
