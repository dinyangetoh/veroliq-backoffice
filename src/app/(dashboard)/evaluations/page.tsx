'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Download, Play } from 'lucide-react';
import { useGetEvaluationsQuery, useRunEvaluationMutation } from '@/redux/api/adminApi';
import type { EvaluationRow } from '@/types/admin';

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

export default function EvaluationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, error, refetch } = useGetEvaluationsQuery(
    { page, limit },
    { pollingInterval: 0 },
  );
  const [runEvaluation, { isLoading: isRunning }] = useRunEvaluationMutation();

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    if (hasPending(data.evaluations)) {
      if (!pollRef.current) {
        pollRef.current = setInterval(() => {
          refetch();
        }, 5000);
      }
    } else {
      stopPolling();
    }
  }, [data, refetch, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleRun = async () => {
    try {
      const result = await runEvaluation().unwrap();
      toast.success(`Queued ${result.queued} sessions for evaluation`);
      setTimeout(() => refetch(), 1500);
    } catch {
      toast.error('Failed to start evaluation run');
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/evaluations/report/download`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `evaluation-report-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download report');
    }
  };

  const pending = data ? data.evaluations.filter((e) => e.status === 'PENDING').length : 0;
  const completed = data ? data.evaluations.filter((e) => e.status === 'COMPLETED').length : 0;
  const failed = data ? data.evaluations.filter((e) => e.status === 'FAILED').length : 0;
  const totalPages = Math.max(Math.ceil((data?.total ?? 0) / limit), 1);

  if (isLoading) return <div className="p-8 text-gray-500">Loading evaluations...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load evaluations.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Evaluations</h2>
          <p className="text-sm text-gray-500">
            Sessions scored by Claude on 6 quality criteria
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {isRunning ? 'Queuing…' : 'Run Evaluation'}
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

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
          {data?.total ?? 0} total
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
          {completed} completed
        </span>
        {pending > 0 && (
          <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 animate-pulse">
            {pending} pending…
          </span>
        )}
        {failed > 0 && (
          <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">
            {failed} failed
          </span>
        )}
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Msgs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retrieval</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Continuity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redundancy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concise</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.evaluations?.map((ev) => (
              <tr
                key={ev.id}
                className="cursor-pointer hover:bg-indigo-50/40"
                onClick={() => router.push(`/sessions/${ev.sessionId}`)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                  {ev.site.domain}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {new Date(ev.session.startedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {ev.session.messageCount}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScorePill score={ev.overallScore} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScorePill score={ev.retrievalQuality} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScorePill score={ev.answerAccuracy} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScorePill score={ev.conversationContinuity} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScorePill score={ev.leadCaptureExecution} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScorePill score={ev.redundancy} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScorePill score={ev.conciseness} />
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="truncate text-xs text-gray-500">{ev.verdict ?? '—'}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
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
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
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
