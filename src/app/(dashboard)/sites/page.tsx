'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGetSitesQuery } from '@/redux/api/adminApi';
import { StatusPill } from '@/components/sites/SiteUi';

function SitesContent() {
  const searchParams = useSearchParams();
  const liveOnly = searchParams.get('live') === '1';
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetSitesQuery({
    page,
    limit: 50,
    q: search || undefined,
    live: liveOnly || undefined,
  });

  if (isLoading) return <div className="p-8 text-gray-500">Loading sites...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load sites.</div>;

  const totalPages = Math.max(Math.ceil((data?.total ?? 0) / (data?.limit ?? 50)), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sites</h2>
          <p className="mt-1 text-sm text-gray-500">
            {(data?.total ?? 0).toLocaleString()} sites
            {liveOnly ? ' · live widgets only' : ''}
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q);
            setPage(1);
          }}
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search domain, name, email..."
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-64"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Domain</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Widget</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Crawl</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pages</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Chats/mo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Leads/mo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.sites?.map((site) => (
              <tr key={site.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <Link href={`/sites/${site.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {site.domain}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{site.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{site.user?.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <StatusPill
                    label={site.widgetLive ? 'Live' : 'Offline'}
                    variant={site.widgetLive ? 'live' : 'offline'}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{site.crawlStatus}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-gray-700">{site.pageCount}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-gray-700">{site.chatsThisMonth}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-gray-700">{site.leadsThisMonth}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                  {new Date(site.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SitesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading sites...</div>}>
      <SitesContent />
    </Suspense>
  );
}
