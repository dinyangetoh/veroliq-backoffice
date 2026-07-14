'use client';

import { useState } from 'react';
import {
  useApproveSupportPatternMutation,
  useGetSupportPatternsQuery,
  useRejectSupportPatternMutation,
  useRevokeSupportPatternMutation,
} from '@/redux/api/adminApi';

const STATUS_TABS: Array<{ value: 'proposed' | 'approved' | 'rejected'; label: string }> = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function SupportPatternsPage() {
  const [status, setStatus] = useState<'proposed' | 'approved' | 'rejected'>('proposed');
  const [reviewer, setReviewer] = useState('');
  const { data: patterns, isFetching } = useGetSupportPatternsQuery(status);
  const [approve, { isLoading: approving }] = useApproveSupportPatternMutation();
  const [reject, { isLoading: rejecting }] = useRejectSupportPatternMutation();
  const [revoke, { isLoading: revoking }] = useRevokeSupportPatternMutation();

  const busy = approving || rejecting || revoking;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Learned Triage — Pattern Review</h2>
        <p className="text-sm text-gray-500 max-w-2xl">
          Every pattern here was mined from real routing signals (mostly agents manually converting a
          lead into a ticket). Nothing below ever affects live routing until it's approved — approving
          pushes it to the live Qdrant collection; rejecting keeps it out permanently. No pattern is ever
          auto-published without a human clicking approve here.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-white ring-1 ring-gray-200 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium ${
                status === tab.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Your name/email (recorded as approvedBy)"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
          className="text-sm rounded-md border-gray-200 px-3 py-1.5 ring-1 ring-gray-200 w-72"
        />
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
        {isFetching ? (
          <p className="p-6 text-sm text-gray-400">Loading…</p>
        ) : !patterns || patterns.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No {status} patterns.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {patterns.map((p) => (
              <li key={p.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{p.label}</span>
                      <span
                        className={`text-[11px] uppercase px-1.5 py-0.5 rounded font-medium ${
                          p.route === 'support' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.route}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {p.siteId ? `site-scoped` : 'global'}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {p.exemplarPhrases.map((phrase, i) => (
                        <li key={i} className="text-xs text-gray-600 font-mono">
                          &ldquo;{phrase}&rdquo;
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-[11px] text-gray-400">
                      Created {new Date(p.createdAt).toLocaleString()}
                      {p.approvedBy ? ` · reviewed by ${p.approvedBy}` : ''}
                      {p.hitCount > 0 ? ` · matched ${p.hitCount} times` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {status === 'proposed' && (
                      <>
                        <button
                          type="button"
                          disabled={busy || !reviewer.trim()}
                          onClick={() => approve({ id: p.id, approvedBy: reviewer.trim() })}
                          className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          title={!reviewer.trim() ? 'Enter your name/email first' : undefined}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy || !reviewer.trim()}
                          onClick={() => reject({ id: p.id, rejectedBy: reviewer.trim() })}
                          className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {status === 'approved' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => revoke(p.id)}
                        className="px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
