"use client";

import Image from "next/image";
import { brandLogoFullSrc, brandLogoIconSrc, platformName } from "@/lib/branding";

export type VeroliqLogoProps = {
  variant: "auth" | "sidebar" | "marketing";
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
  light?: boolean;
  className?: string;
};

const marketingLockupHeightPx: Record<NonNullable<VeroliqLogoProps["size"]>, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

const marketingWordmarkSize: Record<NonNullable<VeroliqLogoProps["size"]>, string> = {
  sm: "14px",
  md: "18px",
  lg: "24px",
};

export function VeroliqLogo({
  variant,
  collapsed = false,
  size = "md",
  light = false,
  className = "",
}: VeroliqLogoProps) {
  if (variant === "auth") {
    return (
      <div className={`flex justify-center mb-8 ${className}`}>
        <Image
          src={brandLogoFullSrc}
          alt="Veroliq"
          width={280}
          height={84}
          className="h-10 sm:h-12 w-auto max-w-[min(100%,280px)] object-contain object-center"
          priority
        />
      </div>
    );
  }

  if (variant === "sidebar") {
    if (collapsed) {
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <Image
            src={brandLogoIconSrc}
            alt="Veroliq"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
        <Image
          src={brandLogoIconSrc}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 flex-shrink-0 object-contain"
          aria-hidden
        />
        <span
          className="text-white select-none truncate"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {platformName}
        </span>
      </div>
    );
  }

  const lockupH = marketingLockupHeightPx[size];

  if (light) {
    const iconDim = Math.round(lockupH * 0.85);
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <Image
          src={brandLogoIconSrc}
          alt=""
          width={iconDim}
          height={iconDim}
          className="flex-shrink-0 object-contain"
          style={{ width: iconDim, height: iconDim }}
          aria-hidden
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: marketingWordmarkSize[size],
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "white",
          }}
        >
          {platformName}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={brandLogoFullSrc}
        alt="Veroliq"
        width={240}
        height={72}
        style={{ height: lockupH, width: "auto" }}
        className="w-auto max-w-[220px] object-contain object-left"
        priority={size === "md"}
      />
    </div>
  );
}
