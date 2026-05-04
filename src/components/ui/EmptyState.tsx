import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  primary: string;
  secondary: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
  secondaryCta?: {
    label: string;
    onClick: () => void;
  };
}

function DefaultIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="20" y="20" width="40" height="40" rx="8" fill="var(--color-brand-100)" />
      <rect x="28" y="28" width="24" height="24" rx="4" fill="var(--color-brand-200)" />
      <rect x="34" y="34" width="12" height="12" rx="2" fill="var(--color-brand-300)" />
    </svg>
  );
}

export function EmptyState({ icon, primary, secondary, cta, secondaryCta }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-8"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="mb-6 opacity-80">
        {icon || <DefaultIcon />}
      </div>
      <p
        className="mb-2"
        style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}
      >
        {primary}
      </p>
      <p
        className="mb-6 max-w-sm"
        style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.6" }}
      >
        {secondary}
      </p>
      {cta && (
        <button
          onClick={cta.onClick}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: "var(--color-brand-600)",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {cta.label}
        </button>
      )}
      {secondaryCta && (
        <button
          onClick={secondaryCta.onClick}
          className="mt-3 text-sm"
          style={{ color: "var(--color-brand-600)", background: "none", border: "none", cursor: "pointer" }}
        >
          {secondaryCta.label}
        </button>
      )}
    </div>
  );
}

// Pre-built empty state icons
export function FunnelIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="10" y="20" width="60" height="8" rx="4" fill="var(--color-brand-200)" />
      <rect x="18" y="33" width="44" height="7" rx="3.5" fill="var(--color-brand-200)" />
      <rect x="26" y="45" width="28" height="6" rx="3" fill="var(--color-brand-300)" />
      <rect x="34" y="56" width="12" height="5" rx="2.5" fill="var(--color-brand-400)" />
    </svg>
  );
}

export function PagesIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="16" y="12" width="32" height="42" rx="4" fill="var(--color-brand-100)" />
      <rect x="22" y="20" width="20" height="3" rx="1.5" fill="var(--color-brand-300)" />
      <rect x="22" y="27" width="16" height="3" rx="1.5" fill="var(--color-brand-200)" />
      <rect x="22" y="34" width="18" height="3" rx="1.5" fill="var(--color-brand-200)" />
      <rect x="28" y="20" width="32" height="42" rx="4" fill="var(--color-brand-200)" />
      <rect x="34" y="28" width="20" height="3" rx="1.5" fill="var(--color-brand-400)" />
      <rect x="34" y="35" width="16" height="3" rx="1.5" fill="var(--color-brand-300)" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="12" stroke="var(--color-brand-300)" strokeWidth="4" fill="none" />
      <circle cx="40" cy="40" r="5" fill="var(--color-brand-400)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <rect
          key={i}
          x="38"
          y="14"
          width="4"
          height="8"
          rx="2"
          fill="var(--color-brand-300)"
          transform={`rotate(${angle} 40 40)`}
        />
      ))}
    </svg>
  );
}

export function LineChartIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="12" y="60" width="56" height="2" rx="1" fill="var(--color-slate-200)" />
      <rect x="12" y="12" width="2" height="50" rx="1" fill="var(--color-slate-200)" />
      <path d="M 16 50 L 28 42 L 38 46 L 50 30 L 64 20" stroke="var(--color-brand-200)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="4 4" />
    </svg>
  );
}

export function LightbulbIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M40 16 C28 16 22 24 22 32 C22 38 25 42 30 46 L30 52 L50 52 L50 46 C55 42 58 38 58 32 C58 24 52 16 40 16Z" fill="var(--color-brand-100)" stroke="var(--color-brand-300)" strokeWidth="2" />
      <rect x="30" y="54" width="20" height="4" rx="2" fill="var(--color-brand-200)" />
      <rect x="32" y="60" width="16" height="4" rx="2" fill="var(--color-brand-200)" />
      <circle cx="40" cy="32" r="6" fill="var(--color-brand-400)" />
    </svg>
  );
}