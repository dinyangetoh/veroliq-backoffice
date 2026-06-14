'use client';

import { useState } from 'react';
import { useGetSiteGapsQuery, usePatchSiteGapMutation } from '@/redux/api/adminApi';

const STATUS_OPTIONS = ['PENDING', 'PLANNED', 'DISMISSED', 'RESOLVED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PLANNED: 'bg-blue-100 text-blue-800',
  DISMISSED: 'bg-gray-100 text-gray-600',
  RESOLVED: 'bg-green-100 text-green-800',
};

export function SiteGapsTab({ siteId }: { siteId: string }) {
  const { data, isLoading, error } = useGetSiteGapsQuery(siteId);
  const [patchGap] = usePatchSiteGapMutation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading gaps...</div>;
  if (error) return <div className="py-8 text-center text-sm text-red-500">Failed to load gaps.</div>;

  const gaps = data?.gaps ?? [];

  if (gaps.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-gray-700">No knowledge gaps detected</p>
        <p className="mt-1 text-xs text-gray-400">
          Gaps appear here when visitors ask questions Vera could not answer from your site content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Knowledge Gaps</h3>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          {gaps.filter((g) => g.status === 'PENDING').length} pending
        </span>
        <span className="text-xs text-gray-400">{gaps.length} total</span>
      </div>
      <p className="text-xs text-gray-500">
        Genuine questions visitors asked that Vera could not answer from your knowledge base. Add this content to your site and re-crawl, or upload a PDF/document.
      </p>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {gaps.map((gap) => {
          const examples = Array.isArray(gap.exampleQuestions) ? (gap.exampleQuestions as string[]) : [];
          const isExpanded = expandedId === gap.id;
          const suggestion = (gap as any).contentSuggestion as string | null | undefined;
          return (
            <div key={gap.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : gap.id)}
                      className="text-left text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {gap.clusterLabel}
                    </button>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[gap.status] ?? STATUS_COLORS.PENDING}`}>
                      {gap.status}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                    <span>Asked {gap.questionCount}×</span>
                    <span>Last: {new Date(gap.lastAsked).toLocaleDateString()}</span>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      {suggestion && (
                        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                          <p className="text-xs font-semibold text-blue-700 mb-1">AI suggestion</p>
                          <p className="text-xs text-blue-800">{suggestion}</p>
                        </div>
                      )}
                      {examples.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Visitor phrasing:</p>
                          {examples.map((q, i) => (
                            <p key={i} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200 mb-1">
                              {q}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <select
                  value={gap.status}
                  onChange={(e) => patchGap({ siteId, gapId: gap.id, status: e.target.value })}
                  className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
