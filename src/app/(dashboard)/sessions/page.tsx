'use client';

import { useState } from 'react';
import { useGetSessionsQuery } from "@/redux/api/adminApi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function SessionsPage() {
  const [chatOnly, setChatOnly] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 50;
  const { data, isLoading, error } = useGetSessionsQuery({ chatOnly, page, limit });

  if (isLoading) return <div className="p-8 text-gray-500">Loading sessions...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load sessions.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sessions</h2>
          <p className="text-sm text-gray-500">Showing {chatOnly ? 'chat sessions' : 'all sessions'}</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!chatOnly}
            onChange={(e) => {
              setChatOnly(!e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          Include empty sessions
        </label>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
          Chat Sessions: {data?.counts?.chatSessions?.toLocaleString() ?? 0}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
          All Sessions: {data?.counts?.allSessions?.toLocaleString() ?? 0}
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
          Empty Sessions: {data?.counts?.emptySessions?.toLocaleString() ?? 0}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Session Composition</h3>
          <p className="text-xs text-gray-500">Chat vs empty sessions across all tracked sessions</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Chat Sessions', value: data?.counts?.chatSessions ?? 0 },
                  { name: 'Empty Sessions', value: data?.counts?.emptySessions ?? 0 },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">List Scope</h3>
          <p className="text-xs text-gray-500">
            The table below currently shows {chatOnly ? 'chat sessions only' : 'all sessions'}.
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>Displayed records: {(data?.sessions?.length ?? 0).toLocaleString()}</p>
            <p>Total matching records: {(data?.total ?? 0).toLocaleString()}</p>
            <p>
              Current page density:{' '}
              {data?.limit ? `${Math.round(((data.sessions?.length ?? 0) / data.limit) * 100)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.sessions?.map((session: any) => (
              <tr key={session.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[200px]">{session.sessionToken}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{session.site?.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[200px]">{session.pageUrl}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.messageCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.startedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {(data?.total ?? 0).toLocaleString()} results · page {data?.page ?? page}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={(data?.page ?? page) <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={(data?.total ?? 0) <= ((data?.page ?? page) * (data?.limit ?? limit))}
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
