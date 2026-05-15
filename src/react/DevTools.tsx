"use client";

import type { BreakpointMap } from "../core/breakpoints.js";
import { type DebugState, formatDebugState } from "../core/debug.js";
import { useBreakpoint } from "./useBreakpoint.js";
import { useColorScheme } from "./useColorScheme.js";
import { useDevicePixelRatio } from "./useDevicePixelRatio.js";
import { usePointer } from "./usePointer.js";
import { usePreference } from "./usePreference.js";
import { useViewport } from "./useViewport.js";

export interface DevToolsProps {
  /** Render only when `process.env.NODE_ENV !== 'production'`. Default true. */
  devOnly?: boolean;
}

const isProduction = () => typeof process !== "undefined" && process.env?.NODE_ENV === "production";

function getBreakpointColor(breakpoint: string) {
  let hash = 0;
  for (const char of breakpoint) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `hsl(${hash % 360} 85% 62%)`;
}

function getPointerLabel(pointer: ReturnType<typeof usePointer>) {
  if (pointer.fine) return "fine";
  if (pointer.coarse) return "coarse";
  if (pointer.hover || pointer.anyHover) return "hover";
  return "none";
}

function PreferenceBadge({ active, label }: { active: boolean; label: string }) {
  const style: React.CSSProperties = {
    borderRadius: 999,
    padding: "2px 6px",
    background: active ? "rgba(52, 211, 153, 0.18)" : "rgba(148, 163, 184, 0.12)",
    color: active ? "#a7f3d0" : "#cbd5e1",
    border: `1px solid ${active ? "rgba(52, 211, 153, 0.45)" : "rgba(148, 163, 184, 0.18)"}`,
  };

  return <span style={style}>{label}</span>;
}

/** Small floating overlay for inspecting responsive state during development. */
export function DevTools({ devOnly = true }: DevToolsProps = {}) {
  const breakpoint = useBreakpoint<BreakpointMap>();
  const viewport = useViewport();
  const { isDark } = useColorScheme();
  const reducedMotion = usePreference("reducedMotion");
  const highContrast = usePreference("moreContrast") || usePreference("forcedColors");
  const pointer = usePointer();
  const dpr = useDevicePixelRatio();

  if (devOnly && isProduction()) return null;

  const state: DebugState = {
    breakpoint: String(breakpoint.active),
    viewport: {
      width: viewport.width,
      height: viewport.height,
    },
    orientation: viewport.orientation,
    dpr,
    preferences: {
      reducedMotion,
      dark: isDark,
      highContrast,
    },
    pointer: getPointerLabel(pointer),
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    right: 12,
    bottom: 12,
    zIndex: 2147483646,
    minWidth: 180,
    maxWidth: 220,
    padding: 10,
    borderRadius: 10,
    background: "rgba(15, 23, 42, 0.78)",
    backdropFilter: "blur(8px)",
    color: "#f8fafc",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.22)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    font: "11px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
    pointerEvents: "none",
    userSelect: "none",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  };

  const labelStyle: React.CSSProperties = {
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontSize: 10,
  };

  const valueStyle: React.CSSProperties = {
    color: "#f8fafc",
    textAlign: "right",
  };

  const breakpointColor = getBreakpointColor(state.breakpoint);

  return (
    <aside
      aria-label="Fluidity debug panel"
      data-fluidity-devtools
      style={panelStyle}
      title={formatDebugState(state)}
    >
      <div style={{ ...rowStyle, marginTop: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: breakpointColor,
              boxShadow: `0 0 0 2px ${breakpointColor}33`,
            }}
          />
          <span style={labelStyle}>breakpoint</span>
        </div>
        <strong style={valueStyle}>{state.breakpoint}</strong>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>viewport</span>
        <span style={valueStyle}>
          {state.viewport.width}×{state.viewport.height}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>orientation</span>
        <span style={valueStyle}>{state.orientation}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>preferences</span>
        <span
          style={{
            ...valueStyle,
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <PreferenceBadge active={state.preferences.reducedMotion} label="motion" />
          <PreferenceBadge active={state.preferences.dark} label="dark" />
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>pointer</span>
        <span style={valueStyle}>{state.pointer}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>dpr</span>
        <span style={valueStyle}>{Number(state.dpr.toFixed(2))}</span>
      </div>
    </aside>
  );
}
