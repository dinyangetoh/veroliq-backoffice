'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo, useState } from 'react';
import { useGetMessagesQuery, useGetSessionMessagesQuery } from '@/redux/api/adminApi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [siteId, setSiteId] = useState('');
  const [role, setRole] = useState<'user' | 'assistant' | ''>('');
  const [hasLead, setHasLead] = useState<'all' | 'yes' | 'no'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetMessagesQuery({
    page,
    limit: 50,
    siteId: siteId || undefined,
    role: role || undefined,
    hasLead: hasLead === 'all' ? undefined : hasLead === 'yes',
    from: from || undefined,
    to: to || undefined,
    q: query || undefined,
  });

  const { data: thread } = useGetSessionMessagesQuery(
    selectedSessionId ? { sessionId: selectedSessionId } : skipToken,
  );

  const uniqueSites = useMemo(() => {
    const entries = new Map<string, string>();
    for (const message of data?.messages ?? []) {
      entries.set(message.session.siteId, message.session.site.domain);
    }
    return Array.from(entries.entries());
  }, [data?.messages]);

  const roleChartData = useMemo(() => {
    const userCount = (data?.messages ?? []).filter((m) => m.role === 'user').length;
    const assistantCount = (data?.messages ?? []).filter((m) => m.role === 'assistant').length;
    return [
      { name: 'User', value: userCount },
      { name: 'Assistant', value: assistantCount },
    ];
  }, [data?.messages]);

  const qualityChartData = useMemo(() => {
    const assistantMessages = (data?.messages ?? []).filter((m) => m.role === 'assistant');
    const withLatency = assistantMessages.filter((m) => m.responseTimeMs != null);
    const withConfidence = assistantMessages.filter((m) => m.confidenceScore != null);
    const avgLatency =
      withLatency.length > 0
        ? Math.round(withLatency.reduce((sum, m) => sum + (m.responseTimeMs ?? 0), 0) / withLatency.length)
        : 0;
    const avgConfidence =
      withConfidence.length > 0
        ? Math.round(
            (withConfidence.reduce((sum, m) => sum + (m.confidenceScore ?? 0), 0) / withConfidence.length) * 1000,
          ) / 1000
        : 0;
    return [
      { name: 'Avg Latency (ms)', value: avgLatency },
      { name: 'Avg Confidence', value: avgConfidence },
    ];
  }, [data?.messages]);

  if (isLoading) return <div className="p-8 text-gray-500">Loading messages...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load messages.</div>;

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 50));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500">Filter messages and open full conversation threads by session.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 md:grid-cols-2 lg:grid-cols-4">
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={siteId}
          onChange={(e) => {
            setPage(1);
            setSiteId(e.target.value);
          }}
        >
          <option value="">All sites</option>
          {uniqueSites.map(([id, domain]) => (
            <option key={id} value={id}>
              {domain}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as 'user' | 'assistant' | '');
          }}
        >
          <option value="">All roles</option>
          <option value="assistant">Assistant</option>
          <option value="user">User</option>
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={hasLead}
          onChange={(e) => {
            setPage(1);
            setHasLead(e.target.value as 'all' | 'yes' | 'no');
          }}
        >
          <option value="all">Lead + non-lead</option>
          <option value="yes">Has lead</option>
          <option value="no">No lead</option>
        </select>
        <div className="flex gap-2">
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Search content"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
          />
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setPage(1);
              setQuery(queryInput.trim());
            }}
          >
            Search
          </button>
        </div>
        <input
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          type="datetime-local"
          value={from}
          onChange={(e) => {
            setPage(1);
            setFrom(e.target.value);
          }}
        />
        <input
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          type="datetime-local"
          value={to}
          onChange={(e) => {
            setPage(1);
            setTo(e.target.value);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Role Distribution (Current Page)</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Assistant Quality (Current Page)</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Content</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Site</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Session</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Metadata</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(data?.messages ?? []).map((message) => (
              <tr
                key={message.id}
                className="cursor-pointer hover:bg-indigo-50/40"
                onClick={() => setSelectedSessionId(message.session.id)}
              >
                <td className="px-4 py-3 text-sm text-gray-800">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${message.role === 'assistant' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                    {message.role}
                  </span>
                </td>
                <td className="max-w-[420px] truncate px-4 py-3 text-sm text-gray-600">{message.content}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{message.session.site.domain}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-600">{message.session.sessionToken}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {message.intentDetected ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">intent: {message.intentDetected}</span>
                    ) : null}
                    {message.confidenceScore != null ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                        conf: {message.confidenceScore.toFixed(3)}
                      </span>
                    ) : null}
                    {message.responseTimeMs != null ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                        latency: {message.responseTimeMs}ms
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(message.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Page {data?.page ?? 1} of {totalPages} ({data?.total ?? 0} messages)
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1.5 text-gray-700 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className="rounded-md border px-3 py-1.5 text-gray-700 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {selectedSessionId && thread ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={() => setSelectedSessionId(null)}>
          <div
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Conversation Thread</h3>
                <p className="text-xs text-gray-500">
                  {thread.session.site?.domain ?? '-'} - {thread.session.sessionToken}
                </p>
              </div>
              <button className="text-sm text-gray-500" onClick={() => setSelectedSessionId(null)}>
                Close
              </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1">messages: {thread.session.messageCount}</span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                assistant: {thread.stats.assistantMessageCount}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                avg latency: {thread.stats.avgResponseTimeMs ?? '-'} ms
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                avg confidence: {thread.stats.avgConfidenceScore ?? '-'}
              </span>
            </div>
            <div className="space-y-3">
              {thread.messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 ${
                    message.role === 'assistant' ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide">
                    {message.role}
                    <span className="ml-2 font-normal normal-case text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
