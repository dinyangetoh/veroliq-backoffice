'use client';

import { useMemo, useState } from 'react';
import {
  useCancelNotificationMutation,
  useGetNotificationDetailQuery,
  useGetNotificationMetricsQuery,
  useGetNotificationTemplatesQuery,
  useGetNotificationsQuery,
  useGetNotificationsQueueHealthQuery,
  useRetryNotificationMutation,
} from '@/redux/api/adminApi';

const RANGE_OPTIONS: Array<{ value: '24h' | '7d' | '30d'; label: string }> = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const STATUS_BADGE: Record<string, string> = {
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-amber-100 text-amber-800',
  QUEUED: 'bg-blue-100 text-blue-800',
  SENDING: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function NotificationsPage() {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [templateId, setTemplateId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data: metrics } = useGetNotificationMetricsQuery({
    range,
    templateId: templateId || undefined,
  });
  const { data: queueHealth } = useGetNotificationsQueueHealthQuery();
  const { data: templatesData } = useGetNotificationTemplatesQuery();
  const { data: items } = useGetNotificationsQuery({
    page,
    limit: 25,
    status: status || undefined,
    templateId: templateId || undefined,
    q: q || undefined,
  });

  const [retry] = useRetryNotificationMutation();
  const [cancel] = useCancelNotificationMutation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [reveal, setReveal] = useState<boolean>(false);

  const totals = metrics?.totals;
  const deliveryPct = totals ? Math.round(totals.deliveryRate * 1000) / 10 : 0;
  const failurePct = totals ? Math.round(totals.failureRate * 1000) / 10 : 0;

  const templateAggregates = useMemo(() => {
    const out = new Map<string, { sent: number; failed: number; total: number }>();
    metrics?.byTemplate?.forEach((r) => {
      const cur = out.get(r.templateId) ?? { sent: 0, failed: 0, total: 0 };
      cur.total += r.count;
      if (r.status === 'SENT') cur.sent += r.count;
      if (r.status === 'FAILED') cur.failed += r.count;
      out.set(r.templateId, cur);
    });
    return [...out.entries()]
      .map(([id, v]) => ({
        templateId: id,
        sent: v.sent,
        failed: v.failed,
        total: v.total,
        rate: v.total > 0 ? v.sent / v.total : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [metrics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Notification Monitoring
          </h2>
          <p className="text-sm text-gray-500">
            Delivery health, failures, and recent sends across every notification channel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500" htmlFor="range">
            Range
          </label>
          <select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value as '24h' | '7d' | '30d')}
            className="text-sm rounded-md border-gray-200 bg-white px-2 py-1 ring-1 ring-gray-200"
          >
            {RANGE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi title="Sent" value={totals?.sent?.toLocaleString() ?? '0'} accent="text-green-700" />
        <Kpi title="Delivery rate" value={`${deliveryPct.toFixed(1)}%`} accent="text-blue-700" />
        <Kpi title="Failure rate" value={`${failurePct.toFixed(1)}%`} accent="text-red-700" />
        <Kpi
          title="Queued"
          value={totals?.queued?.toLocaleString() ?? '0'}
          accent="text-amber-700"
          subtitle={
            totals?.averageLatencyMs != null
              ? `Avg latency ${(totals.averageLatencyMs / 1000).toFixed(1)}s`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Top templates ({range})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="py-2">Template</th>
                  <th className="py-2 text-right">Sent</th>
                  <th className="py-2 text-right">Failed</th>
                  <th className="py-2 text-right">Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templateAggregates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-400 text-sm">
                      No data in window.
                    </td>
                  </tr>
                ) : (
                  templateAggregates.map((row) => (
                    <tr key={row.templateId}>
                      <td className="py-2 text-gray-800">{row.templateId}</td>
                      <td className="py-2 text-right text-green-700">{row.sent}</td>
                      <td className="py-2 text-right text-red-700">{row.failed}</td>
                      <td className="py-2 text-right">{(row.rate * 100).toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top failure messages</h3>
          {(metrics?.topFailures ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">
              No failures in this window — nice.
            </p>
          ) : (
            <ul className="space-y-3">
              {metrics!.topFailures.map((f, i) => (
                <li
                  key={`${f.message}-${i}`}
                  className="border-l-4 border-red-300 bg-red-50 rounded-r-md px-3 py-2"
                >
                  <p className="text-xs font-mono text-red-800">{f.message}</p>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    {f.count} occurrence{f.count === 1 ? '' : 's'}
                    {f.lastSeen ? ` · last ${new Date(f.lastSeen).toLocaleString()}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {queueHealth ? (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Queue · {queueHealth.name}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(queueHealth.counts).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-gray-50 ring-1 ring-gray-200 rounded-md py-2"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      {k}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <input
            type="search"
            placeholder="Search recipient, subject, error..."
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="text-sm rounded-md border-gray-200 px-3 py-1.5 ring-1 ring-gray-200 w-72"
          />
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="text-sm rounded-md border-gray-200 px-2 py-1.5 ring-1 ring-gray-200"
          >
            <option value="">All statuses</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
            <option value="QUEUED">Queued</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={templateId}
            onChange={(e) => {
              setPage(1);
              setTemplateId(e.target.value);
            }}
            className="text-sm rounded-md border-gray-200 px-2 py-1.5 ring-1 ring-gray-200"
          >
            <option value="">All templates</option>
            {(templatesData?.templates ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="ml-auto text-xs text-gray-400">
            {items ? `${items.total.toLocaleString()} matches` : ''}
          </p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {(items?.items ?? []).map((row) => (
              <tr
                key={row.id}
                onClick={() => {
                  setOpenId(row.id);
                  setReveal(false);
                }}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800">
                  {row.templateId}
                  <p className="text-[11px] text-gray-400 mt-0.5">{row.subject ?? '—'}</p>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">
                  {row.toAddress}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-xs">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                      STATUS_BADGE[row.status] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {row.status}
                  </span>
                  {row.errorMessage ? (
                    <p className="text-[11px] text-red-600 mt-1 max-w-[260px] truncate">
                      {row.errorMessage}
                    </p>
                  ) : null}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                  {row.attempts}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right text-xs">
                  {row.status === 'FAILED' ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        retry(row.id);
                      }}
                      className="px-2 py-1 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Retry
                    </button>
                  ) : null}
                  {['PENDING', 'QUEUED'].includes(row.status) ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        cancel(row.id);
                      }}
                      className="ml-2 px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!items || items.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  No notifications match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <footer className="flex items-center justify-between p-4 border-t border-gray-100 text-sm text-gray-500">
          <span>
            Page {items?.page ?? page} of {items ? Math.max(1, Math.ceil(items.total / items.limit)) : 1}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!items || items.items.length < items.limit}
              className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </footer>
      </div>

      {openId ? (
        <NotificationDetailDrawer
          id={openId}
          reveal={reveal}
          onToggleReveal={() => setReveal((v) => !v)}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </div>
  );
}

function NotificationDetailDrawer({
  id,
  reveal,
  onToggleReveal,
  onClose,
}: {
  id: string;
  reveal: boolean;
  onToggleReveal: () => void;
  onClose: () => void;
}) {
  const { data, isFetching } = useGetNotificationDetailQuery({ id, reveal });
  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
        aria-label="Close detail"
      />
      <aside className="w-[640px] max-w-full h-full bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Notification {id}
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {data?.templateId ?? '…'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-md p-3 text-xs">
            <span className="text-amber-900">
              {data?.redacted === false
                ? 'PII reveal active. This view is recorded in the admin audit log.'
                : 'Recipient and body PII are masked. Reveal will be audited.'}
            </span>
            <button
              type="button"
              onClick={onToggleReveal}
              className={`px-2 py-1 rounded-md font-medium ${
                reveal
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {reveal ? 'Hide PII' : 'Reveal recipient details'}
            </button>
          </div>

          {isFetching ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : data ? (
            <>
              {data.contentPurgedHint ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
                  {data.contentPurgedHint}
                </p>
              ) : null}
              <DetailRow label="Status" value={data.status} />
              <DetailRow label="Recipient" value={data.toAddress} mono />
              <DetailRow label="Subject" value={data.subject ?? '—'} />
              <DetailRow label="Attempts" value={String(data.attempts)} />
              <DetailRow
                label="Scheduled"
                value={data.scheduledAt ? new Date(data.scheduledAt).toLocaleString() : '—'}
              />
              <DetailRow
                label="Sent"
                value={data.sentAt ? new Date(data.sentAt).toLocaleString() : '—'}
              />
              {data.errorMessage ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Error
                  </p>
                  <pre className="bg-red-50 text-red-800 text-xs rounded-md p-3 whitespace-pre-wrap break-all">
                    {data.errorMessage}
                  </pre>
                </div>
              ) : null}
              {data.bodyText ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Plain text
                  </p>
                  <pre className="bg-gray-50 ring-1 ring-gray-200 rounded-md p-3 whitespace-pre-wrap text-xs">
                    {data.bodyText}
                  </pre>
                </div>
              ) : null}
              {data.body ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Rendered HTML
                  </p>
                  <iframe
                    title="Notification body"
                    srcDoc={data.body}
                    className="w-full h-[480px] rounded-md border border-gray-200 bg-white"
                  />
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-gray-400">Notification not found.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <p className="w-24 shrink-0 text-xs uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className={`text-sm text-gray-800 break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function Kpi({
  title,
  value,
  accent,
  subtitle,
}: {
  title: string;
  value: string;
  accent: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-gray-400">{title}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
      {subtitle ? <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p> : null}
    </div>
  );
}
