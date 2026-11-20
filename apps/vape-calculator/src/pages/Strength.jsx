import React, { useState } from "react";
import { Droplets, FlaskConical } from "lucide-react";
import { strengthFromShots } from "../lib/calculations.js";
import { translateCalcError } from "../lib/translateErrors.js";
import { Field, Formula, Metric, Notice, PageHeader, Panel, ProgressBar, format } from "../components/UI.jsx";
import { useI18n } from "../i18n.js";

export default function Strength() {
  const { t, lang } = useI18n();
  const [values, setValues] = useState({ baseVolume: 50, shotVolume: 10, shotStrength: 20, shotCount: 1 });
  const change = field => value => setValues(old => ({ ...old, [field]: value }));
  const r = strengthFromShots(values);
  return <>
    <PageHeader eyebrow={t("sEyebrow")} title={t("sTitle")} description={t("sDesc")} />
    <div className="workspace-grid">
      <Panel title={t("yourMix")} subtitle={t("fillDetails")}>
        <div className="fields-grid">
          <Field label={t("baseVolume")} unit="ml" value={values.baseVolume} onChange={change("baseVolume")} />
          <Field label={t("shotCount")} unit={t("shotsName") === "Nicotine shots" ? "pcs" : "st"} step="1" max={1000} value={values.shotCount} onChange={change("shotCount")} />
          <Field label={t("shotStrength")} unit="mg/ml" max={20} value={values.shotStrength} onChange={change("shotStrength")} />
          <Field label={t("shotVolume")} unit="ml" max={10} value={values.shotVolume} onChange={change("shotVolume")} />
        </div>
        <div className="preset-row"><span>{t("presets")}</span>
          <button type="button" className="pill-button" onClick={() => setValues({ baseVolume: 50, shotVolume: 10, shotStrength: 20, shotCount: 1 })}>50 ml + 1</button>
          <button type="button" className="pill-button" onClick={() => setValues({ baseVolume: 40, shotVolume: 10, shotStrength: 18, shotCount: 2 })}>40 ml + 2</button>
        </div>
        <Notice>{t("volIncreases")}</Notice>
      </Panel>
      <div className="result-column">
        <Panel className="result-panel">
          <div className="result-top"><span className="eyebrow">{t("finalStrength")}</span><Droplets size={21}/></div>
          {r.ok ? <>
            <div className="hero-number">{format(r.strength)} <span>mg/ml</span></div>
            <p className="result-caption">{t("concentration")}</p>
            <div className="metrics-grid">
              <Metric label={t("totalVolume")} value={format(r.totalVolume)} unit="ml" />
              <Metric label={t("nicTotal")} value={format(r.nicotineMg)} unit="mg" />
            </div>
          </> : <Notice type="error">{translateCalcError(r.error,lang)}</Notice>}
        </Panel>
        {r.ok && <Panel title={t("contents")}>
          <ProgressBar items={[
            { name: t("baseVolume"), value: values.baseVolume, color: "var(--bar-base)" },
            { name: t("shotsName"), value: r.nicotineVolume, color: "var(--accent)" }
          ]}/>
        </Panel>}
      </div>
    </div>
    <Panel className="how-panel" title={t("how")} right={<FlaskConical size={19} aria-hidden="true" />}>
      <p>{t("strengthExplain")}</p><Formula>{t("strengthFormula")}</Formula>
    </Panel>
  </>;
}
