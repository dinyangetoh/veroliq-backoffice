type StatusType = "live" | "offline" | "processing" | "error" | "complete" | "queued" | "crawling";

interface StatusIndicatorProps {
  status: StatusType | string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

function getStatusConfig(status: string): { color: string; label: string; pulse?: boolean; spin?: boolean } {
  switch (status?.toUpperCase()) {
    case "LIVE":
    case "COMPLETE":
    case "VERIFIED":
    case "ACTIVE":
      return { color: "var(--color-success-500)", label: status === "LIVE" ? "Live" : "Complete", pulse: true };
    case "OFFLINE":
    case "UNVERIFIED":
    case "INACTIVE":
      return { color: "var(--color-slate-300)", label: "Offline" };
    case "PROCESSING":
    case "CRAWLING":
    case "EMBEDDING":
    case "QUEUED":
      return { color: "var(--color-brand-500)", label: status.charAt(0) + status.slice(1).toLowerCase(), spin: true };
    case "ERROR":
    case "FAILED":
    case "DOMAIN_MISMATCH":
      return { color: "var(--color-danger-500)", label: "Error" };
    case "PAUSED":
      return { color: "var(--color-warning-500)", label: "Paused" };
    default:
      return { color: "var(--color-slate-300)", label: status || "Unknown" };
  }
}

export function StatusIndicator({ status, showLabel = true, size = "md" }: StatusIndicatorProps) {
  const config = getStatusConfig(status);
  const dotSize = size === "sm" ? 6 : 8;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex" style={{ width: dotSize, height: dotSize }}>
        {config.pulse && (
          <span
            className="absolute inline-flex w-full h-full rounded-full"
            style={{
              background: config.color,
              opacity: 0.5,
              animation: "veroliq-pulse 2s ease-in-out infinite",
            }}
          />
        )}
        {config.spin ? (
          <svg
            className="veroliq-spin"
            width={dotSize}
            height={dotSize}
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle cx="8" cy="8" r="6" stroke={config.color} strokeWidth="2" strokeDasharray="30" strokeDashoffset="10" />
          </svg>
        ) : (
          <span
            className="relative inline-flex rounded-full"
            style={{ width: dotSize, height: dotSize, background: config.color }}
          />
        )}
      </span>
      {showLabel && (
        <span
          style={{
            fontSize: size === "sm" ? "12px" : "13px",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {config.label}
        </span>
      )}
    </span>
  );
}
