'use client';

import { Suspense, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  useGetSiteDetailQuery,
  useGetSiteDashboardQuery,
  useGetSiteSessionsQuery,
  useGetSiteSessionDetailQuery,
  useGetSiteLeadsQuery,
  useGetSiteCrawlsQuery,
  useGetSiteEventsQuery,
} from '@/redux/api/adminApi';
import { SiteHeader, SiteOverviewTab } from '@/components/sites/SiteOverviewTab';
import { PaginatedTable } from '@/components/sites/PaginatedTable';
import { SessionDetailDrawer } from '@/components/sites/SessionDetailDrawer';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'leads', label: 'Leads' },
  { id: 'crawls', label: 'Crawls' },
  { id: 'events', label: 'Events' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function SiteDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading site...</div>}>
      <SiteDetailContent />
    </Suspense>
  );
}

function SiteDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = String(params.siteId);
  const tab = (searchParams.get('tab') as TabId) || 'overview';
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetSiteDetailQuery(siteId);
  const { data: dashboard, isLoading: dashboardLoading } = useGetSiteDashboardQuery(
    { siteId, days },
    { skip: tab !== 'overview' },
  );

  const listArgs = { siteId, page, limit: 25 };
  const { data: sessionsData } = useGetSiteSessionsQuery({ ...listArgs, chatOnly: true }, { skip: tab !== 'sessions' });
  const { data: sessionDetail } = useGetSiteSessionDetailQuery(
    selectedSessionId ? { siteId, sessionId: selectedSessionId } : skipToken,
    { skip: !selectedSessionId },
  );
  const { data: leadsData } = useGetSiteLeadsQuery(listArgs, { skip: tab !== 'leads' });
  const { data: crawlsData } = useGetSiteCrawlsQuery(listArgs, { skip: tab !== 'crawls' });
  const { data: eventsData } = useGetSiteEventsQuery(listArgs, { skip: tab !== 'events' });

  const setTab = (next: TabId) => {
    setPage(1);
    const q = next === 'overview' ? '' : `?tab=${next}`;
    router.replace(`/sites/${siteId}${q}`);
  };

  const sessionRows = useMemo(
    () => (sessionsData?.sessions ?? []) as Record<string, unknown>[],
    [sessionsData],
  );
  const leadRows = useMemo(() => (leadsData?.leads ?? []) as Record<string, unknown>[], [leadsData]);
  const crawlRows = useMemo(() => (crawlsData?.crawls ?? []) as Record<string, unknown>[], [crawlsData]);
  const eventRows = useMemo(() => (eventsData?.events ?? []) as Record<string, unknown>[], [eventsData]);

  if (isLoading) return <div className="p-8 text-gray-500">Loading site...</div>;
  if (error || !data?.site) return <div className="p-8 text-red-500">Failed to load site.</div>;

  const site = data.site;

  return (
    <div className="space-y-6">
      <SiteHeader site={site} />

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <SiteOverviewTab
          site={site}
          dashboard={dashboard}
          days={days}
          onDaysChange={setDays}
          isLoadingDashboard={dashboardLoading}
        />
      )}

      {tab === 'sessions' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
              Chat Sessions: {sessionsData?.counts?.chatSessions?.toLocaleString() ?? 0}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              All Sessions: {sessionsData?.counts?.allSessions?.toLocaleString() ?? 0}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
              Empty Sessions: {sessionsData?.counts?.emptySessions?.toLocaleString() ?? 0}
            </span>
          </div>
          <PaginatedTable
            columns={[
              {
                key: 'startedAt',
                label: 'Started',
                render: (r) => new Date(String(r.startedAt)).toLocaleString(),
              },
              { key: 'pageUrl', label: 'Page' },
              { key: 'messageCount', label: 'Messages' },
              {
                key: 'hasLead',
                label: 'Lead',
                render: (r) => (r.hasLead ? 'Yes' : '—'),
              },
            ]}
            rows={sessionRows}
            total={sessionsData?.total ?? 0}
            page={page}
            limit={25}
            onPageChange={setPage}
            onRowClick={(row) => setSelectedSessionId(String(row.id))}
          />
          <SessionDetailDrawer
            open={Boolean(selectedSessionId)}
            onClose={() => setSelectedSessionId(null)}
            detail={sessionDetail}
          />
        </div>
      )}

      {tab === 'leads' && (
        <PaginatedTable
          columns={[
            { key: 'email', label: 'Email' },
            { key: 'name', label: 'Name' },
            { key: 'intentTag', label: 'Intent' },
            { key: 'intentScore', label: 'Score' },
            { key: 'pageUrl', label: 'Page' },
            {
              key: 'createdAt',
              label: 'Created',
              render: (r) => new Date(String(r.createdAt)).toLocaleString(),
            },
          ]}
          rows={leadRows}
          total={leadsData?.total ?? 0}
          page={page}
          limit={25}
          onPageChange={setPage}
        />
      )}

      {tab === 'crawls' && (
        <PaginatedTable
          columns={[
            { key: 'status', label: 'Status' },
            { key: 'pagesFound', label: 'Found' },
            { key: 'pagesEmbedded', label: 'Embedded' },
            {
              key: 'startedAt',
              label: 'Started',
              render: (r) => (r.startedAt ? new Date(String(r.startedAt)).toLocaleString() : '—'),
            },
            {
              key: 'completedAt',
              label: 'Completed',
              render: (r) => (r.completedAt ? new Date(String(r.completedAt)).toLocaleString() : '—'),
            },
          ]}
          rows={crawlRows}
          total={crawlsData?.total ?? 0}
          page={page}
          limit={25}
          onPageChange={setPage}
        />
      )}

      {tab === 'events' && (
        <PaginatedTable
          columns={[
            { key: 'type', label: 'Type' },
            { key: 'pageUrl', label: 'Page' },
            {
              key: 'timestamp',
              label: 'Time',
              render: (r) => new Date(String(r.timestamp)).toLocaleString(),
            },
          ]}
          rows={eventRows}
          total={eventsData?.total ?? 0}
          page={page}
          limit={25}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
