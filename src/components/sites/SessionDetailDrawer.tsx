'use client';

import type { SessionDetailResponse } from '@/types/admin';

type SessionDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  detail?: SessionDetailResponse;
};

export function SessionDetailDrawer({ open, onClose, detail }: SessionDetailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Conversation Thread</h3>
              <p className="mt-1 text-xs text-gray-500">
                {detail?.session?.site?.domain ?? '—'} - {detail?.session?.sessionToken ?? 'Loading…'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              messages: {detail?.session?.messageCount ?? '—'}
            </span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
              assistant: {detail?.stats?.assistantMessageCount ?? '—'}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              avg latency: {detail?.stats?.avgResponseTimeMs ?? '—'} ms
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              avg confidence: {detail?.stats?.avgConfidenceScore ?? '—'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!detail ? (
            <p className="text-sm text-gray-500">Loading conversation thread…</p>
          ) : detail.messages.length === 0 ? (
            <p className="text-sm text-gray-500">No messages in this session.</p>
          ) : (
            <div className="space-y-3">
              {detail.messages.map((message) => {
                const isAssistant = message.role === 'assistant';
                return (
                  <div
                    key={message.id}
                    className={`rounded-lg p-3 ${
                      isAssistant ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-100 text-slate-900'
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
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
