'use client';

import type { SessionDetailResponse } from '@/types/admin';

type SessionDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  detail?: SessionDetailResponse;
};

function confidencePercent(value: number | null | undefined) {
  if (value == null) return '—';
  return `${Math.round(value * 100)}%`;
}

export function SessionDetailDrawer({ open, onClose, detail }: SessionDetailDrawerProps) {
  if (!open) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl border-l border-gray-200 bg-white shadow-2xl">
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-gray-500">
              Session · {detail?.session?.sessionToken?.slice(0, 16) ?? 'Loading'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Conversation transcript</h3>
          <p className="mt-1 text-sm text-gray-500">
            {detail?.session?.startedAt ? new Date(detail.session.startedAt).toLocaleString() : '—'} ·{' '}
            <span className="font-mono">{detail?.session?.pageUrl ?? '—'}</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Messages</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{detail?.session?.messageCount ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Assistant</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{detail?.stats?.assistantMessageCount ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Avg latency</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {detail?.stats?.avgResponseTimeMs != null ? `${detail.stats.avgResponseTimeMs}ms` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Avg confidence</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {confidencePercent(detail?.stats?.avgConfidenceScore)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!detail ? (
            <p className="text-sm text-gray-500">Loading session detail...</p>
          ) : detail.messages.length === 0 ? (
            <p className="text-sm text-gray-500">No conversation transcript available.</p>
          ) : (
            <div className="space-y-3">
              {detail.messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'rounded-br-sm bg-gray-900 text-white'
                          : 'rounded-bl-sm border border-indigo-100 bg-indigo-50 text-gray-900'
                      }`}
                    >
                      <div className={`mb-1 text-[10px] uppercase tracking-wider ${msg.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                        {msg.role === 'user' ? 'Visitor' : 'Vera AI'} ·{' '}
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      {msg.role !== 'user' && (
                        <div className="mt-1 text-[10px] text-gray-500">
                          {msg.responseTimeMs != null ? `Latency ${msg.responseTimeMs}ms` : 'Latency —'} ·{' '}
                          {confidencePercent(msg.confidenceScore ?? null)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

