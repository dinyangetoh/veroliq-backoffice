'use client';

import { useGetSiteIntelligenceQuery } from '@/redux/api/adminApi';

function IntelligenceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h4>
      {children}
    </div>
  );
}

function Tag({ label, color = 'gray' }: { label: string; color?: 'gray' | 'blue' | 'green' | 'amber' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  );
}

export function SiteIntelligenceTab({ siteId }: { siteId: string }) {
  const { data, isLoading, error } = useGetSiteIntelligenceQuery(siteId);

  if (isLoading) return <div className="py-8 text-center text-sm text-gray-400">Loading intelligence...</div>;
  if (error) return <div className="py-8 text-center text-sm text-red-500">Failed to load intelligence.</div>;

  const intel = data?.intelligence as Record<string, unknown> | null;

  if (!intel) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-gray-700">No site intelligence generated yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Intelligence is auto-generated after the first successful crawl. Trigger a re-crawl to generate it.
        </p>
      </div>
    );
  }

  const entities = intel.primary_entities as Record<string, string> | null;
  const terminologyMap = intel.terminology_map as Record<string, string[]> | null;
  const actionUrls = intel.action_urls as Record<string, string | null> | null;
  const visitorGoals = intel.visitor_goals as string[] | null;
  const highIntentSignals = intel.high_intent_signals as string[] | null;
  const sensitivityNotes = intel.sensitivity_notes as string[] | null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Site Intelligence</h3>
        {intel.industry && <Tag label={String(intel.industry)} color="blue" />}
        {intel.business_model && <Tag label={String(intel.business_model)} color="green" />}
        {intel.currency && <Tag label={String(intel.currency)} color="amber" />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entities && (
          <IntelligenceSection title="Primary Entities">
            <dl className="space-y-1">
              {Object.entries(entities).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <dt className="w-20 shrink-0 font-medium capitalize text-gray-500">{k}</dt>
                  <dd className="text-gray-800">{v}</dd>
                </div>
              ))}
            </dl>
          </IntelligenceSection>
        )}

        {actionUrls && (
          <IntelligenceSection title="Action URLs">
            <dl className="space-y-1.5">
              {Object.entries(actionUrls).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <dt className="font-medium capitalize text-gray-500">{k}</dt>
                  {v ? (
                    <dd className="mt-0.5 truncate text-blue-600">{v}</dd>
                  ) : (
                    <dd className="mt-0.5 text-gray-400">Not detected</dd>
                  )}
                </div>
              ))}
            </dl>
          </IntelligenceSection>
        )}

        {terminologyMap && (
          <IntelligenceSection title="Terminology Map">
            <div className="space-y-2">
              {Object.entries(terminologyMap).map(([concept, terms]) => (
                <div key={concept} className="text-xs">
                  <span className="font-medium capitalize text-gray-600">{concept}:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {terms.map((t) => <Tag key={t} label={t} />)}
                  </div>
                </div>
              ))}
            </div>
          </IntelligenceSection>
        )}

        {visitorGoals && visitorGoals.length > 0 && (
          <IntelligenceSection title="Visitor Goals">
            <ul className="space-y-1">
              {visitorGoals.map((g, i) => (
                <li key={i} className="text-xs text-gray-700">• {g}</li>
              ))}
            </ul>
          </IntelligenceSection>
        )}
      </div>

      {highIntentSignals && highIntentSignals.length > 0 && (
        <IntelligenceSection title="High-Intent Signals">
          <div className="flex flex-wrap gap-2">
            {highIntentSignals.map((s, i) => <Tag key={i} label={s} color="amber" />)}
          </div>
        </IntelligenceSection>
      )}

      {sensitivityNotes && sensitivityNotes.length > 0 && (
        <IntelligenceSection title="Sensitivity Notes">
          <ul className="space-y-1">
            {sensitivityNotes.map((n, i) => (
              <li key={i} className="text-xs text-amber-700">⚠ {n}</li>
            ))}
          </ul>
        </IntelligenceSection>
      )}

      {intel.lead_capture_framing && (
        <p className="text-xs text-gray-500">
          <span className="font-medium">Lead framing:</span> {String(intel.lead_capture_framing)}
        </p>
      )}
    </div>
  );
}
