type FunnelStage = {
  stage: string;
  label: string;
  count: number;
  percent: number;
};

const COLORS = ['#4338ca', '#6366f1', '#94a3b8', '#16a34a'];

export function SiteFunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const width = max > 0 ? Math.max((stage.count / max) * 100, 4) : 4;
        return (
          <div key={stage.stage}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{stage.label}</span>
              <span className="tabular-nums text-gray-500">
                {stage.count.toLocaleString()} ({stage.percent}%)
              </span>
            </div>
            <div className="h-8 overflow-hidden rounded-md bg-gray-100">
              <div
                className="h-full rounded-md transition-all"
                style={{ width: `${width}%`, backgroundColor: COLORS[i] ?? COLORS[COLORS.length - 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
