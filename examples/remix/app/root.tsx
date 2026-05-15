import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { ResponsiveProvider as FluidityProvider } from "fluidity-ts/react";
import { resolveServerBreakpoint } from "fluidity-ts/server";

const globalStyles = `
  :root {
    --bg: #f8fafc;
    --panel: rgba(255, 255, 255, 0.88);
    --text: #0f172a;
    --muted: #475569;
    --border: rgba(148, 163, 184, 0.35);
    --accent: #2563eb;
  }

  html[data-theme="dark"] {
    --bg: #020617;
    --panel: rgba(15, 23, 42, 0.84);
    --text: #e2e8f0;
    --muted: #94a3b8;
    --border: rgba(148, 163, 184, 0.22);
    --accent: #60a5fa;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    min-height: 100%;
  }

  body {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    background:
      radial-gradient(circle at top, rgba(37, 99, 235, 0.18), transparent 32%),
      var(--bg);
    color: var(--text);
  }

  a {
    color: var(--accent);
  }

  button {
    font: inherit;
  }

  code,
  pre {
    font-family: "SFMono-Regular", Consolas, monospace;
  }
`;

export function loader({ request }: LoaderFunctionArgs) {
  const serverSnapshot = resolveServerBreakpoint({
    headers: request.headers,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return json({ serverWidth: serverSnapshot?.width ?? null });
}

export const meta = () => [
  { title: "fluidity-ts × Remix" },
  {
    name: "description",
    content: "Minimal Remix example showing fluidity-ts with SSR client hints.",
  },
];

export default function App() {
  const { serverWidth } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>
        <FluidityProvider serverWidth={serverWidth ?? undefined}>
          <Outlet />
        </FluidityProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
