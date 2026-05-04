import type { IntentTag } from "@/types/site";

const intentConfig: Record<IntentTag, { bg: string; text: string; border: string; icon: string; label: string }> = {
  PRICING: {
    bg:     "var(--intent-pricing-bg)",
    text:   "var(--intent-pricing-text)",
    border: "var(--intent-pricing-border)",
    icon:   "💰",
    label:  "PRICING",
  },
  DEMO: {
    bg:     "var(--intent-demo-bg)",
    text:   "var(--intent-demo-text)",
    border: "var(--intent-demo-border)",
    icon:   "🎯",
    label:  "DEMO",
  },
  CONTACT: {
    bg:     "var(--intent-contact-bg)",
    text:   "var(--intent-contact-text)",
    border: "var(--intent-contact-border)",
    icon:   "💬",
    label:  "CONTACT",
  },
  FALLBACK: {
    bg:     "var(--intent-fallback-bg)",
    text:   "var(--intent-fallback-text)",
    border: "var(--intent-fallback-border)",
    icon:   "❓",
    label:  "FALLBACK",
  },
  EXIT: {
    bg:     "var(--intent-exit-bg)",
    text:   "var(--intent-exit-text)",
    border: "var(--intent-exit-border)",
    icon:   "🚪",
    label:  "EXIT",
  },
};

interface IntentBadgeProps {
  intent: IntentTag;
  showIcon?: boolean;
}

export function IntentBadge({ intent, showIcon = true }: IntentBadgeProps) {
  const config = intentConfig[intent];
  if (!config) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2"
      style={{
        height: "22px",
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        borderRadius: "4px",
        fontFamily: "var(--font-body)",
        fontSize: "11px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {showIcon && <span style={{ fontSize: "10px" }}>{config.icon}</span>}
      {config.label}
    </span>
  );
}

export function intentLabel(intent: IntentTag): string {
  return intentConfig[intent]?.label ?? intent;
}
