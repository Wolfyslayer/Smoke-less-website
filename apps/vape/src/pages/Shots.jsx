import React, { useState } from "react";
import { ArrowRightLeft, FlaskConical } from "lucide-react";
import { shotsNeeded } from "../lib/calculations.js";
import { Field, Formula, Metric, Notice, PageHeader, Panel, format } from "../components/UI.jsx";
import { useI18n } from "../i18n.js";

export default function Shots() {
  const { t } = useI18n();
  const [mode, setMode] = useState("base");
  const [values, setValues] = useState({ volume: 50, targetStrength: 3, shotStrength: 20, shotVolume: 10 });
  const change = field => value => setValues(old => ({ ...old, [field]: value }));
  const r = shotsNeeded({ ...values, mode });
  return <>
    <PageHeader eyebrow={t("pEyebrow")} title={t("pTitle")} description={t("pDesc")}/>
    <div className="workspace-grid">
      <Panel title={t("planMix")} subtitle={t("planDesc")}>
        <div className="mode-switch" role="group" aria-label={t("planMix")}>
          <button type="button" className={mode === "base" ? "selected" : ""} aria-pressed={mode === "base"} onClick={() => setMode("base")}>{t("existing")}</button>
          <button type="button" className={mode === "final" ? "selected" : ""} aria-pressed={mode === "final"} onClick={() => setMode("final")}>{t("final")}</button>
        </div>
        <p className="mode-description">{t(mode === "base" ? "existingText" : "finalText")}</p>
        <div className="fields-grid">
          <Field label={t(mode === "base" ? "baseVolume" : "desired")} min={0.01} unit="ml" value={values.volume} onChange={change("volume")}/>
          <Field label={t("targetStrength")} unit="mg/ml" max={20} value={values.targetStrength} onChange={change("targetStrength")}/>
          <Field label={t("shotStrength")} unit="mg/ml" min={0.01} max={20} value={values.shotStrength} onChange={change("shotStrength")}/>
          <Field label={t("shotVolume")} unit="ml" max={10} value={values.shotVolume} onChange={change("shotVolume")}/>
        </div>
        <Notice>{t("roundedNotice")}</Notice>
      </Panel>
      <div className="result-column">
        <Panel className="result-panel">
          <div className="result-top"><span className="eyebrow">{t("bottles")}</span><ArrowRightLeft size={21}/></div>
          {r.ok ? <>
            <div className="hero-number">{format(r.bottlesToBuy, 0)} <span>{t("shotsName")}</span></div>
            <p className="result-caption">{t("useVolume", {amount:format(r.nicotineVolume)})}</p>
            <div className="metrics-grid">
              <Metric label={t("exactShots")} value={format(r.exactShots, 3)}/>
              <Metric label={t("totalVolume")} value={format(r.totalVolume)} unit="ml"/>
              <Metric label={t("baseLeft")} value={format(r.baseVolume)} unit="ml"/>
              <Metric label={t("shotRemaining")} value={format(r.leftoverShotVolume)} unit="ml"/>
            </div>
          </> : <Notice type="error">{t("errorGeneric")} {r.error}</Notice>}
        </Panel>
        {r.ok && r.leftoverShotVolume > 0.001 && <Notice type="warning">
          <strong>{t("onlyUse", {amount: format(r.nicotineVolume)})}</strong>{" "}
          {mode === "base" && r.strengthIfAllUsed !== null ?
            t("allUsed", {count:r.bottlesToBuy,strength:format(r.strengthIfAllUsed)}) :
            t("tooMuch")}
        </Notice>}
      </div>
    </div>
    <Panel className="how-panel" title={t("how")} right={<FlaskConical size={19} aria-hidden="true" />}>
      <p>{t(mode === "base" ? "existingText" : "finalText")}</p>
      <Formula>{t(mode === "base" ? "existingFormula" : "finalFormula")}</Formula>
    </Panel>
  </>;
}
