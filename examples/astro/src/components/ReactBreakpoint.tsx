import { useBreakpoint } from "reflow/react";
import { getColumns, getLayoutLabel, type DemoBreakpoint } from "../lib/fluidity";

export default function ReactBreakpoint() {
  const bp = useBreakpoint();
  const active = bp.active as DemoBreakpoint;
  const checks = [
    { label: 'is("xs")', value: bp.is("xs") },
    { label: 'above("md")', value: bp.above("md") },
    { label: 'between("md", "xl")', value: bp.between("md", "xl") },
  ];

  return (
    <article className="island-card">
      <div className="island-header">
        <div>
          <p className="eyebrow">React island</p>
          <h2>reflow/react</h2>
        </div>
        <span className="badge">{active}</span>
      </div>
      <p>
        {getLayoutLabel(active)} · {getColumns(active)} columns
      </p>
      <ul className="check-list">
        {checks.map((check) => (
          <li key={check.label}>
            <span>{check.label}</span>
            <strong>{check.value ? "true" : "false"}</strong>
          </li>
        ))}
      </ul>
    </article>
  );
}
