'use client';

import { useMemo, useState } from 'react';
import {
  useGetNotificationTemplatesQuery,
  usePreviewNotificationTemplateQuery,
} from '@/redux/api/adminApi';

export default function NotificationTemplatesPage() {
  const { data, isLoading, error } = useGetNotificationTemplatesQuery();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<'html' | 'text'>('html');

  const templates = data?.templates ?? [];
  const selectedId = activeId ?? templates[0]?.id ?? null;
  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  );
  const { data: preview } = usePreviewNotificationTemplateQuery(
    selectedId ? { id: selectedId } : (undefined as never),
    { skip: !selectedId },
  );

  if (isLoading) {
    return <div className="p-8 text-gray-500">Loading templates...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-500">Failed to load templates.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Notification Templates
          </h2>
          <p className="text-sm text-gray-500">
            Browse the {templates.length} registered email templates and preview their sample payloads.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
            {templates.map((t) => {
              const active = t.id === selectedId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none ${
                      active ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{t.description}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-gray-400">
                      {t.id}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="space-y-4">
          {selected ? (
            <>
              <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg p-5">
                <p className="text-xs uppercase tracking-wider text-gray-400">Trigger</p>
                <p className="text-sm font-medium text-gray-900 mb-3">{selected.trigger}</p>
                <p className="text-xs uppercase tracking-wider text-gray-400">Variables</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selected.variables.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 text-gray-700"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
                <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">Subject</p>
                    <p className="text-sm font-medium text-gray-900">
                      {preview?.subject ?? selected.subject}
                    </p>
                  </div>
                  <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setView('html')}
                      className={`px-3 py-1.5 ${view === 'html' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                    >
                      HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('text')}
                      className={`px-3 py-1.5 ${view === 'text' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                    >
                      Plain text
                    </button>
                  </div>
                </header>
                <div className="bg-gray-50 p-4">
                  {view === 'html' ? (
                    <iframe
                      key={selected.id}
                      title={`Preview of ${selected.name}`}
                      srcDoc={preview?.html ?? selected.sampleHtml}
                      className="w-full h-[640px] bg-white rounded-md ring-1 ring-gray-200"
                    />
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 bg-white rounded-md ring-1 ring-gray-200 p-4 max-h-[640px] overflow-auto">
{preview?.text ?? selected.sampleText}
                    </pre>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 p-8">Select a template to preview.</div>
          )}
        </section>
      </div>
    </div>
  );
}
