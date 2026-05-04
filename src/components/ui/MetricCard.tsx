import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

function useCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const update = (time: number) => {
      if (startRef.current === null) startRef.current = time;
      const elapsed = time - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

interface MetricCardProps {
  label: string;
  value: number;
  format?: "number" | "percent" | "ms";
  delta?: number;
  comparison?: string;
  live?: boolean;
  limit?: { used: number; total: number };
  gold?: boolean;
  subtitle?: string;
}

export function MetricCard({
  label,
  value,
  format = "number",
  delta,
  comparison,
  live = false,
  limit,
  gold = false,
  subtitle,
}: MetricCardProps) {
  const count = useCounter(value);

  const formatValue = (v: number) => {
    if (format === "percent") return `${v.toFixed(1)}%`;
    if (format === "ms") return `${v}ms`;
    if (v >= 1000) return v.toLocaleString();
    return v.toString();
  };

  const limitPercent = limit ? Math.round((limit.used / limit.total) * 100) : 0;
  const limitColor =
    limitPercent >= 90 ? "var(--color-danger-500)" :
    limitPercent >= 71 ? "var(--color-warning-500)" :
    "var(--color-brand-500)";

  return (
    <div
      className="relative rounded-xl p-6 transition-all duration-150 cursor-default group"
      style={{
        background: "var(--color-surface)",
        border: gold
          ? `1px solid var(--color-veroliq-gold)`
          : `1px solid var(--color-border)`,
        borderLeft: gold ? `4px solid var(--color-veroliq-gold)` : undefined,
        fontFamily: "var(--font-body)",
      }}
      onMouseEnter={e => {
        if (!gold) (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand-200)";
      }}
      onMouseLeave={e => {
        if (!gold) (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="uppercase tracking-widest"
          style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          {live && (
            <span className="relative inline-flex w-2.5 h-2.5">
              <span
                className="absolute inline-flex w-full h-full rounded-full"
                style={{
                  background: "var(--color-success-500)",
                  opacity: 0.6,
                  animation: "veroliq-pulse 2s ease-in-out infinite",
                }}
              />
              <span
                className="relative inline-flex rounded-full w-2.5 h-2.5"
                style={{ background: "var(--color-success-500)" }}
              />
            </span>
          )}
          {delta !== undefined && (
            <span
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: delta >= 0 ? "var(--color-success-100)" : "var(--color-danger-100)",
                color: delta >= 0 ? "var(--color-success-700)" : "var(--color-danger-600)",
              }}
            >
              {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Metric value */}
      <div
        className="veroliq-metric mb-1"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatValue(count)}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
          {subtitle}
        </p>
      )}

      {/* Comparison text */}
      {comparison && (
        <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
          {comparison}
        </p>
      )}

      {/* Usage limit bar */}
      {limit && (
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
              {limit.used.toLocaleString()} / {limit.total === -1 ? "∞" : limit.total.toLocaleString()}
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
              {limit.total === -1 ? "unlimited" : `${limitPercent}%`}
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: "4px", background: "var(--color-slate-100)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: limit.total === -1 ? "20%" : `${Math.min(limitPercent, 100)}%`,
                background: limit.total === -1 ? "var(--color-success-500)" : limitColor,
                transition: "width 600ms ease-out",
              }}
            />
          </div>
          {limitPercent >= 90 && limit.total !== -1 && (
            <p style={{ fontSize: "11px", color: "var(--color-danger-600)", marginTop: "4px" }}>
              You're approaching your limit.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
