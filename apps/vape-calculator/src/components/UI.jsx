import React, { useId } from "react";
import { AlertTriangle, Info } from "lucide-react";

export const format = (value, digits = 2) =>
  typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("sv-SE", { maximumFractionDigits: digits }).format(value)
    : "–";

export function Field({ label, value, onChange, unit, hint, min = 0, max = 10000, step = "any", placeholder, disabled = false }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="field-box">
        <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step}
          value={value} placeholder={placeholder} disabled={disabled}
          onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} />
        {unit && <span className="field-unit">{unit}</span>}
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder, maxLength = 120, hint }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="field-box">
        <input id={id} type="text" value={value} placeholder={placeholder} maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)} />
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Panel({ children, title, subtitle, right, className = "" }) {
  return (
    <section className={"panel " + className}>
      {(title || subtitle || right) && (
        <div className="panel-heading">
          <div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

export function Metric({ label, value, unit, strong = false, detail }) {
  return (
    <div className={"metric " + (strong ? "metric-strong" : "")}>
      <span className="metric-label">{label}</span>
      <div className="metric-number">{value}{unit && <span>{unit}</span>}</div>
      {detail && <span className="metric-detail">{detail}</span>}
    </div>
  );
}

export function Notice({ type = "info", children }) {
  return (
    <div className={"notice notice-" + type} role={type === "error" ? "alert" : "note"}>
      {type === "error" || type === "warning" ? <AlertTriangle size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}

export function Formula({ children }) {
  return <div className="formula"><code>{children}</code></div>;
}

export function ProgressBar({ items }) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  return <div className="composition">
    <div className="composition-track" aria-label="Fördelning av ingredienser">
      {items.map((item, index) => <span key={index} style={{ width: (total ? Math.max(0, item.value) / total * 100 : 0) + "%", background: item.color }} />)}
    </div>
    <div className="composition-legend">
      {items.map((item, index) => <div key={index}><i style={{ background: item.color }} />{item.name}<strong>{format(item.value)} ml</strong></div>)}
    </div>
  </div>;
}
