import Link from 'next/link';
import type { PlatformMetrics } from '@/types/admin';

export function LiveSitesPanel({ totals }: { totals: PlatformMetrics['totals'] }) {
  const pct = totals.sites > 0 ? Math.round((totals.sitesLive / totals.sites) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Live widgets</h3>
        <Link href="/sites?live=1" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View live →
        </Link>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
        {totals.sitesLive}
        <span className="text-lg font-normal text-gray-400"> / {totals.sites}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-500">{pct}% of sites have a live widget</p>
      <p className="mt-3 text-xs text-gray-500">{totals.usersVerified.toLocaleString()} verified users</p>
    </div>
  );
}

export function RecentSignupsPanel({
  signups,
}: {
  signups: PlatformMetrics['recentSignups'];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Recent signups</h3>
      <ul className="mt-3 space-y-3">
        {signups.length === 0 && <li className="text-sm text-gray-500">No recent signups</li>}
        {signups.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{u.email}</p>
              <p className="text-xs text-gray-500">{u.plan}</p>
            </div>
            <time className="shrink-0 text-xs text-gray-400">
              {new Date(u.createdAt).toLocaleDateString()}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopSitesPanel({ sites }: { sites: PlatformMetrics['topSitesThisMonth'] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Top sites this month</h3>
      <p className="text-xs text-gray-500">By leads captured</p>
      <ul className="mt-3 space-y-2">
        {sites.length === 0 && <li className="text-sm text-gray-500">No data yet</li>}
        {sites.map((s) => (
          <li key={s.siteId}>
            <Link
              href={`/sites/${s.siteId}`}
              className="flex items-center justify-between rounded-lg px-2 py-2 -mx-2 hover:bg-gray-50 text-sm"
            >
              <span className="truncate font-medium text-blue-600">{s.domain}</span>
              <span className="shrink-0 tabular-nums text-gray-600">
                {s.leads} leads · {s.chats} chats
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
