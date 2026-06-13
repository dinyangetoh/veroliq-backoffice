'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useGetEvalRunDetailQuery } from '@/redux/api/adminApi';

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

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <ScorePill score={score} />
      </div>
      {score !== null && (
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className={`h-1.5 rounded-full ${score >= 7 ? 'bg-emerald-400' : score >= 4 ? 'bg-amber-400' : 'bg-red-400'}`}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function EvalRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetEvalRunDetailQuery(id);

  if (isLoading) return <div className="p-8 text-gray-500">Loading run…</div>;
  if (error || !data) return <div className="p-8 text-red-500">Failed to load run.</div>;

  const { run, evaluations } = data;
  const pending = run.queuedCount - run.completedCount - run.failedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/evaluations')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {run.label ?? <span className="italic text-gray-400 font-normal">Unlabelled run</span>}
          </h2>
          <p className="text-xs text-gray-500">{new Date(run.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">{run.queuedCount} queued</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">{run.completedCount} completed</span>
        {run.failedCount > 0 && <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">{run.failedCount} failed</span>}
        {pending > 0 && <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 animate-pulse">{pending} pending</span>}
      </div>

      {run.avgOverallScore !== null && (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">Average scores across {run.completedCount} completed sessions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ScoreBar label="Overall" score={run.avgOverallScore} />
            <ScoreBar label="Retrieval Quality" score={run.avgRetrievalQuality} />
            <ScoreBar label="Answer Accuracy" score={run.avgAnswerAccuracy} />
            <ScoreBar label="Conversation Continuity" score={run.avgConversationContinuity} />
            <ScoreBar label="Lead Capture" score={run.avgLeadCaptureExecution} />
            <ScoreBar label="Redundancy" score={run.avgRedundancy} />
            <ScoreBar label="Conciseness" score={run.avgConciseness} />
          </div>
        </div>
      )}

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
            {evaluations.map((ev) => (
              <tr
                key={ev.id}
                className="cursor-pointer hover:bg-indigo-50/40"
                onClick={() => router.push(`/sessions/${ev.sessionId}`)}
              >
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
            {evaluations.length === 0 && (
              <tr>
                <td colSpan={12} className="px-6 py-10 text-center text-sm text-gray-400">
                  No evaluations in this run yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
