import { useEffect } from "react";
import { useBreakpoint, useColorScheme, useViewport } from "fluidity-ts/react";
import { fluidClamp } from "fluidity-ts/styles";

const defaultBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

const displayClamp = fluidClamp({ minPx: 32, maxPx: 60, minVwPx: 360, maxVwPx: 1440 });
const bodyClamp = fluidClamp({ minPx: 16, maxPx: 18, minVwPx: 360, maxVwPx: 1440 });

export default function Index() {
  const breakpoint = useBreakpoint();
  const viewport = useViewport();
  const { colorScheme, isDark, setColorScheme } = useColorScheme({
    storageKey: "fluidity-remix-theme",
  });

  useEffect(() => {
    document.documentElement.dataset.theme = colorScheme;
    document.documentElement.style.colorScheme = colorScheme;
  }, [colorScheme]);

  const cardStyle = {
    border: "1px solid var(--border)",
    borderRadius: 18,
    padding: 20,
    background: "var(--panel)",
    boxShadow: isDark ? "none" : "0 18px 40px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(10px)",
  } as const;

  return (
    <main
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "48px 20px 72px",
        display: "grid",
        gap: 24,
        fontSize: bodyClamp,
      }}
    >
      <section style={{ ...cardStyle, display: "grid", gap: 16 }}>
        <span style={{ color: "var(--accent)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          fluidity-ts × Remix
        </span>
        <h1 style={{ margin: 0, fontSize: displayClamp, lineHeight: 1.05 }}>
          SSR-safe responsive UI with FluidityProvider and client hints
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", maxWidth: 760 }}>
          <code>entry.server.tsx</code> advertises <code>Sec-CH-Viewport-Width</code>, the root loader
          resolves the server width, and <code>FluidityProvider</code> seeds hydration.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            onClick={() => setColorScheme(isDark ? "light" : "dark")}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "10px 16px",
              background: "var(--accent)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Toggle {isDark ? "light" : "dark"} mode
          </button>
          <button
            type="button"
            onClick={() => setColorScheme(null)}
            style={{
              borderRadius: 999,
              padding: "10px 16px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Follow system
          </button>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: breakpoint.above("lg") ? "repeat(3, minmax(0, 1fr))" : "1fr",
        }}
      >
        <article style={cardStyle}>
          <p style={{ marginTop: 0, color: "var(--muted)" }}>useBreakpoint()</p>
          <h2 style={{ marginTop: 0 }}>{breakpoint.active}</h2>
          <p style={{ marginBottom: 8 }}>above(&quot;md&quot;): {String(breakpoint.above("md"))}</p>
          <p style={{ marginBottom: 0 }}>below(&quot;xl&quot;): {String(breakpoint.below("xl"))}</p>
        </article>

        <article style={cardStyle}>
          <p style={{ marginTop: 0, color: "var(--muted)" }}>useViewport()</p>
          <h2 style={{ marginTop: 0 }}>
            {viewport.width} × {viewport.height}
          </h2>
          <p style={{ marginBottom: 0 }}>orientation: {viewport.orientation}</p>
        </article>

        <article style={cardStyle}>
          <p style={{ marginTop: 0, color: "var(--muted)" }}>useColorScheme()</p>
          <h2 style={{ marginTop: 0 }}>{colorScheme}</h2>
          <p style={{ marginBottom: 0 }}>persisted theme toggle with SSR-safe defaults</p>
        </article>
      </section>

      <section style={{ ...cardStyle, display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Breakpoint map</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {Object.entries(defaultBreakpoints).map(([key, value]) => {
            const active = key === breakpoint.active;
            return (
              <span
                key={key}
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {key} ≥ {value}px
              </span>
            );
          })}
        </div>
      </section>

      <section style={{ ...cardStyle, display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Fluid typography</h2>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Use <code>fluidClamp()</code> to generate CSS <code>clamp()</code> values at runtime.
        </p>
        <pre
          style={{
            margin: 0,
            overflowX: "auto",
            padding: 16,
            borderRadius: 14,
            background: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(241, 245, 249, 0.9)",
            border: "1px solid var(--border)",
          }}
        >
{`const titleSize = fluidClamp({ minPx: 32, maxPx: 60, minVwPx: 360, maxVwPx: 1440 });
// ${displayClamp}

Accept-CH: Sec-CH-Viewport-Width
Critical-CH: Sec-CH-Viewport-Width`}
        </pre>
      </section>
    </main>
  );
}
