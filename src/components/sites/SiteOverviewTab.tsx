'use client';

import Link from 'next/link';
import type { AdminSiteDetail, SiteDashboard } from '@/types/admin';
import { SiteKpiCard, StatusPill, formatRelativeTime } from './SiteUi';
import { SiteTrendChart } from './SiteTrendChart';
import { SiteFunnelChart } from './SiteFunnelChart';

const PERIODS = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
] as const;

type SiteOverviewTabProps = {
  site: AdminSiteDetail;
  dashboard: SiteDashboard | undefined;
  days: number;
  onDaysChange: (days: number) => void;
  isLoadingDashboard: boolean;
};

export function SiteOverviewTab({
  site,
  dashboard,
  days,
  onDaysChange,
  isLoadingDashboard,
}: SiteOverviewTabProps) {
  const pageCount =
    site.latestCrawl?.pagesEmbedded ??
    site.latestCrawl?.pagesFound ??
    site.pageCount;
  const lastCrawl =
    site.latestCrawl?.completedAt ?? site.lastCrawled;

  const trend = dashboard?.trend;
  const trendSlice = trend
    ? {
        labels: trend.labels.slice(-14),
        chats: trend.chats.slice(-14),
        leads: trend.leads.slice(-14),
      }
    : { labels: [], chats: [], leads: [] };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <SiteKpiCard label="Pages crawled" value={pageCount} />
        <SiteKpiCard
          label="Widget status"
          value={site.widgetLive ? 'Live' : 'Offline'}
        />
        <SiteKpiCard
          label="Verification"
          value={site.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
        />
        <SiteKpiCard
          label="AI model"
          value={site.aiSettings?.model === 'auto' || !site.aiSettings?.model ? 'Auto' : site.aiSettings.model}
          sub="Vera"
        />
        <SiteKpiCard label="Last crawl" value={formatRelativeTime(lastCrawl)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Engagement analytics</h3>
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onDaysChange(p.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                days === p.value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoadingDashboard ? (
        <p className="text-sm text-gray-500">Loading analytics...</p>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SiteKpiCard label="Total chats" value={dashboard.overview.totalChats} sub={dashboard.period.label} />
            <SiteKpiCard label="Leads captured" value={dashboard.overview.leadsCaptured} sub={dashboard.period.label} />
            <SiteKpiCard
              label="Conversion rate"
              value={`${dashboard.overview.conversionRate}%`}
              sub={dashboard.period.label}
            />
            <SiteKpiCard label="Active today" value={dashboard.overview.activeToday} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Trend — {site.domain}</h4>
              <div className="mt-4">
                <SiteTrendChart
                  labels={trendSlice.labels}
                  chats={trendSlice.chats}
                  leads={trendSlice.leads}
                />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">AI health</h4>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Answer rate</span>
                    <span className="font-medium">{dashboard.aiPerformance.answerRate}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(dashboard.aiPerformance.answerRate, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg confidence</span>
                    <span className="font-medium">
                      {Math.round(dashboard.aiPerformance.avgConfidenceScore * 100)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg response</span>
                    <span className="font-medium">{dashboard.overview.avgResponseTimeMs}ms</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {dashboard.aiPerformance.questionsAnswered} answered ·{' '}
                  {dashboard.aiPerformance.questionsUnanswered} unanswered
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Conversion funnel</h4>
              <p className="text-xs text-gray-500">Widget event pipeline</p>
              <div className="mt-4">
                <SiteFunnelChart stages={dashboard.funnel.stages} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900">Widget config</h4>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Greeting</dt>
                  <dd className="text-right text-gray-900">{site.widgetConfig?.greeting ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Brand color</dt>
                  <dd className="flex items-center gap-2">
                    {site.widgetConfig?.brandColor && (
                      <span
                        className="inline-block h-4 w-4 rounded border border-gray-200"
                        style={{ backgroundColor: site.widgetConfig.brandColor }}
                      />
                    )}
                    <span className="font-mono text-xs">{site.widgetConfig?.brandColor ?? '—'}</span>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Position</dt>
                  <dd>{site.widgetConfig?.position ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Owner</dt>
                  <dd>
                    <Link href="#" className="text-blue-600 hover:underline">
                      {site.user.email}
                    </Link>
                    <span className="ml-1 text-gray-400">({site.user.plan})</span>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">This month</dt>
                  <dd>
                    {site.stats.leadsThisMonth} leads · {site.stats.chatsThisMonth} chats
                  </dd>
                </div>
              </dl>
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Embed snippet</p>
                <code className="mt-1 block break-all text-xs text-gray-700">{`<script src="..." data-site-id="${site.id}"></script>`}</code>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">No analytics data for this period.</p>
      )}
    </div>
  );
}

export function SiteHeader({ site }: { site: AdminSiteDetail }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <nav className="text-sm text-gray-500">
          <Link href="/sites" className="hover:text-gray-700">
            Sites
          </Link>
          <span className="mx-2">/</span>
          <span className="font-mono text-gray-900">{site.domain}</span>
        </nav>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">{site.name}</h2>
        <p className="font-mono text-sm text-gray-500">{site.domain}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusPill
          label={site.widgetLive ? 'Live' : 'Offline'}
          variant={site.widgetLive ? 'live' : 'offline'}
        />
        <StatusPill
          label={site.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
          variant={site.verificationStatus === 'VERIFIED' ? 'verified' : 'pending'}
        />
        <StatusPill label={site.crawlStatus} />
      </div>
    </div>
  );
}
