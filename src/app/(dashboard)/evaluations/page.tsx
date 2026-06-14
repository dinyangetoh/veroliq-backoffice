'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Download, Play } from 'lucide-react';
import {
  useGetEvaluationsQuery,
  useGetEvalRunsQuery,
  useRunEvaluationMutation,
} from '@/redux/api/adminApi';
import type { EvalRunSummary, EvaluationRow } from '@/types/admin';

const API_BASE =
  process.env.NEXT_PUBLIC_VEROLIQ_API_URL || 'http://localhost:3001';

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400">—</span>;
  const colour =
    score >= 7
      ? 'bg-emerald-50 text-emerald-700'
      : score >= 4
        ? 'bg-amber-50 text-amber-700'
        : 'bg-red-50 text-red-700';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${colour}`}>
      {score.toFixed(1)}
    </span>
  );
}

function hasPending(rows: EvaluationRow[]) {
  return rows.some((r) => r.status === 'PENDING');
}

function RunLabelModal({
  onConfirm,
  onClose,
  isLoading,
}: {
  onConfirm: (label: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [label, setLabel] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Start evaluation run</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add an optional label so you can identify this batch later (e.g. "Post-RAG upgrade").
        </p>
        <input
          className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConfirm(label)}
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(label)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {isLoading ? 'Queuing…' : 'Run'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionsTab() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, error, refetch } = useGetEvaluationsQuery(
    { page, limit },
    { pollingInterval: 0 },
  );

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => {
    if (!data) return;
    if (hasPending(data.evaluations)) {
      if (!pollRef.current) pollRef.current = setInterval(() => refetch(), 5000);
    } else {
      stopPolling();
    }
  }, [data, refetch, stopPolling]);
  useEffect(() => () => stopPolling(), [stopPolling]);

  const pending = data ? data.evaluations.filter((e) => e.status === 'PENDING').length : 0;
  const completed = data ? data.evaluations.filter((e) => e.status === 'COMPLETED').length : 0;
  const failed = data ? data.evaluations.filter((e) => e.status === 'FAILED').length : 0;
  const totalPages = Math.max(Math.ceil((data?.total ?? 0) / limit), 1);

  if (isLoading) return <div className="py-10 text-center text-gray-500">Loading…</div>;
  if (error) return <div className="py-10 text-center text-red-500">Failed to load evaluations.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">{data?.total ?? 0} total</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">{completed} completed</span>
        {pending > 0 && (
          <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 animate-pulse">{pending} pending…</span>
        )}
        {failed > 0 && (
          <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">{failed} failed</span>
        )}
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Site', 'Started', 'Msgs', 'Overall', 'Retrieval', 'Accuracy', 'Continuity', 'Lead', 'Redundancy', 'Concise', 'Verdict', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.evaluations?.map((ev) => (
              <tr key={ev.id} className="cursor-pointer hover:bg-indigo-50/40" onClick={() => router.push(`/sessions/${ev.sessionId}`)}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">{ev.site.domain}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{new Date(ev.session.startedAt).toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{ev.session.messageCount}</td>
                <td className="px-4 py-3 whitespace-nowrap"><ScorePill score={ev.overallScore} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><ScorePill score={ev.retrievalQuality} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><ScorePill score={ev.answerAccuracy} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><ScorePill score={ev.conversationContinuity} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><ScorePill score={ev.leadCaptureExecution} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><ScorePill score={ev.redundancy} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><ScorePill score={ev.conciseness} /></td>
                <td className="px-4 py-3 max-w-[200px]"><p className="truncate text-xs text-gray-500">{ev.verdict ?? '—'}</p></td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ev.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : ev.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                    {ev.status}
                  </span>
                </td>
              </tr>
            ))}
            {data?.evaluations?.length === 0 && (
              <tr>
                <td colSpan={12} className="px-6 py-10 text-center text-sm text-gray-400">
                  No evaluations yet — click Run Evaluation to score all sessions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{(data?.total ?? 0).toLocaleString()} results · page {page}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40">Previous</button>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}

function RunsTab() {
  const router = useRouter();
  const { data: runs, isLoading, error } = useGetEvalRunsQuery();

  if (isLoading) return <div className="py-10 text-center text-gray-500">Loading runs…</div>;
  if (error) return <div className="py-10 text-center text-red-500">Failed to load runs.</div>;

  return (
    <div className="space-y-4">
      {(!runs || runs.length === 0) ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
          No evaluation runs yet — click Run Evaluation to start your first batch.
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => <RunCard key={run.id} run={run} onClick={() => router.push(`/evaluations/runs/${run.id}`)} />)}
        </div>
      )}
    </div>
  );
}

function RunCard({ run, onClick }: { run: EvalRunSummary; onClick: () => void }) {
  const pending = run.queuedCount - run.completedCount - run.failedCount;
  return (
    <div
      className="cursor-pointer rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:ring-indigo-300 transition-all"
      onClick={onClick}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{run.label ?? <span className="text-gray-400 font-normal italic">Unlabelled run</span>}</p>
          <p className="mt-0.5 text-xs text-gray-500">{new Date(run.createdAt).toLocaleString()} · {run.queuedCount} sessions queued</p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">{run.completedCount} done</span>
          {run.failedCount > 0 && <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-700">{run.failedCount} failed</span>}
          {pending > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700 animate-pulse">{pending} pending</span>}
          {run.anthropicBatchId && run.batchStatus && run.batchStatus !== 'ended' && (
            <span className="rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700 animate-pulse">
              batch {run.batchStatus}
            </span>
          )}
        </div>
      </div>

      {run.avgOverallScore !== null && (
        <div className="mt-4 grid grid-cols-4 gap-x-6 gap-y-3 sm:grid-cols-7">
          {[
            ['Overall', run.avgOverallScore],
            ['Retrieval', run.avgRetrievalQuality],
            ['Accuracy', run.avgAnswerAccuracy],
            ['Continuity', run.avgConversationContinuity],
            ['Lead', run.avgLeadCaptureExecution],
            ['Redundancy', run.avgRedundancy],
            ['Concise', run.avgConciseness],
          ].map(([label, score]) => (
            <div key={label as string} className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
              <div className="mt-1"><ScorePill score={score as number | null} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvaluationsPage() {
  const [tab, setTab] = useState<'runs' | 'sessions'>('runs');
  const [showModal, setShowModal] = useState(false);
  const [runEvaluation, { isLoading: isRunning }] = useRunEvaluationMutation();
  const { refetch: refetchRuns } = useGetEvalRunsQuery();

  const handleRun = async (label: string) => {
    try {
      const result = await runEvaluation(label.trim() ? { label: label.trim() } : undefined).unwrap();
      toast.success(`Run started — ${result.queued} sessions queued`);
      setShowModal(false);
      setTimeout(() => refetchRuns(), 1000);
    } catch {
      toast.error('Failed to start evaluation run');
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/evaluations/report/download`, { credentials: 'include' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluation-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <RunLabelModal
          onConfirm={handleRun}
          onClose={() => setShowModal(false)}
          isLoading={isRunning}
        />
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Evaluations</h2>
          <p className="text-sm text-gray-500">Sessions scored by Claude on 6 quality criteria</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Run Evaluation
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download Report
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {(['runs', 'sessions'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'runs' ? 'Runs' : 'All Sessions'}
          </button>
        ))}
      </div>

      {tab === 'runs' ? <RunsTab /> : <SessionsTab />}
    </div>
  );
}
