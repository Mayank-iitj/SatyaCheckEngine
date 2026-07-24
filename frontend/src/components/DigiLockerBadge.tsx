"use client";

import { useState } from "react";

interface DigiLockerBadgeProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * DigiLockerBadge — Government-shield icon displayed on credentials
 * that were fetched/verified through DigiLocker (source: "DIGILOCKER_VERIFIED").
 *
 * These credentials are government/institution-attested and skipped the
 * forensics pipeline — they carry a higher trust level than manually uploaded docs.
 *
 * NOTE: This integration is simulated against DigiLocker's public API documentation.
 * Production deployment requires DigiLocker partner/issuer onboarding.
 */
export function DigiLockerBadge({
  size = "md",
  showTooltip = true,
  style,
}: DigiLockerBadgeProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const sizeMap = {
    sm: { padding: "3px 8px", fontSize: 10, iconSize: 12, gap: 4 },
    md: { padding: "5px 12px", fontSize: 11, iconSize: 14, gap: 6 },
    lg: { padding: "8px 16px", fontSize: 13, iconSize: 18, gap: 8 },
  };

  const sz = sizeMap[size];

  return (
    <div
      style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: sz.gap,
          padding: sz.padding,
          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(67,56,202,0.15))",
          border: "1px solid rgba(59,130,246,0.35)",
          borderRadius: 20,
          cursor: showTooltip ? "help" : "default",
          userSelect: "none" as const,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Government shield icon */}
        <GovernmentShieldIcon size={sz.iconSize} />

        <span
          style={{
            fontSize: sz.fontSize,
            fontWeight: 700,
            color: "#93c5fd",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap" as const,
          }}
        >
          DigiLocker Verified
        </span>

        {/* Pulse indicator */}
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#22d3ee",
            boxShadow: "0 0 6px #22d3ee",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            width: 280,
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <GovernmentShieldIcon size={20} />
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#93c5fd",
                  marginBottom: 4,
                }}
              >
                DigiLocker Government-Attested
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                This credential was fetched directly from India's DigiLocker infrastructure —
                a government-backed digital document system. It is institution-issued (not
                self-uploaded), so it bypasses the forensics pipeline and carries a higher
                trust level.
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#475569",
                  marginTop: 8,
                  padding: "6px 8px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 6,
                  lineHeight: 1.5,
                }}
              >
                ⚠️ <em>Simulated against DigiLocker's public API documentation. Production
                deployment requires DigiLocker partner/issuer onboarding.</em>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(59,130,246,0.3)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Government shield SVG icon
 */
function GovernmentShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"
        fill="rgba(59,130,246,0.2)"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"
        fill="url(#shieldGrad)"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="shieldGrad" x1="12" y1="2" x2="12" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Indian flag tricolor stripe (subtle) */}
      <rect x="8" y="9" width="8" height="1.5" rx="0.5" fill="#FF9933" opacity="0.8" />
      <rect x="8" y="11" width="8" height="1.5" rx="0.5" fill="#ffffff" opacity="0.6" />
      <rect x="8" y="13" width="8" height="1.5" rx="0.5" fill="#138808" opacity="0.8" />
      {/* Ashoka Chakra dot */}
      <circle cx="12" cy="11.75" r="1" fill="none" stroke="#003580" strokeWidth="0.5" opacity="0.8" />
    </svg>
  );
}

export default DigiLockerBadge;
