'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetSessionMessagesQuery } from '@/redux/api/adminApi';
import type { EvaluationDetail } from '@/types/admin';

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-xs text-gray-400">N/A</span>;
  }
  const pct = Math.round((score / 10) * 100);
  const colour =
    score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-amber-400' : 'bg-red-500';
  const textColour =
    score >= 7 ? 'text-emerald-700' : score >= 4 ? 'text-amber-700' : 'text-red-700';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${colour}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium tabular-nums ${textColour}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-gray-400">—</span>;
  const colour =
    score >= 7
      ? 'bg-emerald-50 text-emerald-700'
      : score >= 4
        ? 'bg-amber-50 text-amber-700'
        : 'bg-red-50 text-red-700';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${colour}`}>
      {score.toFixed(1)} / 10
    </span>
  );
}

function EvaluationPanel({ ev }: { ev: EvaluationDetail }) {
  const criteria: [string, keyof EvaluationDetail][] = [
    ['Retrieval Quality', 'retrievalQuality'],
    ['Answer Accuracy', 'answerAccuracy'],
    ['Conversation Continuity', 'conversationContinuity'],
    ['Lead Capture', 'leadCaptureExecution'],
    ['Redundancy', 'redundancy'],
    ['Conciseness', 'conciseness'],
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Overall Score</p>
          <div className="mt-1"><ScorePill score={ev.overallScore} /></div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            ev.status === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-700'
              : ev.status === 'FAILED'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700'
          }`}
        >
          {ev.status}
        </span>
      </div>

      <div className="space-y-3">
        {criteria.map(([label, key]) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="w-44 shrink-0 text-xs text-gray-600">{label}</span>
            <ScoreBar score={ev[key] as number | null} />
          </div>
        ))}
      </div>

      {ev.verdict && (
        <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 leading-relaxed">
          {ev.verdict}
        </p>
      )}

      {ev.issues && ev.issues.length > 0 && (
        <ul className="mt-3 space-y-1">
          {ev.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
              <span className="mt-0.5 shrink-0 text-red-400">•</span>
              {issue}
            </li>
          ))}
        </ul>
      )}

      {ev.evaluatedAt && (
        <p className="mt-4 text-xs text-gray-400">
          Evaluated {new Date(ev.evaluatedAt).toLocaleString()} · {ev.claudeModel ?? 'claude'}
        </p>
      )}
    </div>
  );
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { data, isLoading, error } = useGetSessionMessagesQuery(
    sessionId ? { sessionId } : skipToken,
  );

  if (isLoading) return <div className="p-8 text-gray-500">Loading session...</div>;
  if (error || !data) return <div className="p-8 text-red-500">Failed to load session.</div>;

  const { session, stats, messages, evaluation } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Sessions
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">{session.site?.domain}</h2>
          <span className="font-mono text-sm text-gray-500">{session.sessionToken}</span>
          {session.leadCaptured && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Lead captured
            </span>
          )}
          {session.outcome && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {session.outcome}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Started {new Date(session.startedAt).toLocaleString()} · {session.messageCount} messages
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Session Metadata</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">Site</dt>
              <dd className="text-gray-900">{session.site?.domain ?? '—'}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">Page URL</dt>
              <dd className="truncate text-gray-900">{session.pageUrl}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">Referrer</dt>
              <dd className="truncate text-gray-900">{session.referrer ?? '—'}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">Outcome</dt>
              <dd className="text-gray-900">{session.outcome ?? '—'}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">Lead</dt>
              <dd className="text-gray-900">{session.leadCaptured ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">Avg Confidence</dt>
              <dd className="text-gray-900">
                {stats.avgConfidenceScore != null ? stats.avgConfidenceScore.toFixed(3) : '—'}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">Avg Latency</dt>
              <dd className="text-gray-900">
                {stats.avgResponseTimeMs != null ? `${stats.avgResponseTimeMs.toLocaleString()}ms` : '—'}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-gray-500">User Agent</dt>
              <dd className="truncate text-xs text-gray-500">{session.userAgent ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div>
          {evaluation ? (
            <EvaluationPanel ev={evaluation} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <div>
                <p className="text-sm font-medium text-gray-600">No evaluation yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Run evaluation from the{' '}
                  <Link href="/evaluations" className="text-indigo-600 underline">
                    Evaluations page
                  </Link>{' '}
                  to score this session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Conversation</h3>
        </div>
        <div className="divide-y divide-gray-50 px-5 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`py-4 ${msg.role === 'user' ? '' : 'pl-4'}`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    msg.role === 'user' ? 'text-gray-500' : 'text-indigo-600'
                  }`}
                >
                  {msg.role === 'user' ? 'User' : 'Vera'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
                {msg.role === 'assistant' && (
                  <>
                    {msg.confidenceScore != null && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
                        conf {msg.confidenceScore.toFixed(2)}
                      </span>
                    )}
                    {msg.responseTimeMs != null && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                        {msg.responseTimeMs.toLocaleString()}ms
                      </span>
                    )}
                    {msg.intentDetected && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                        {msg.intentDetected}
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
