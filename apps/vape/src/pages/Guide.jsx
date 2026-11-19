import React from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { PageHeader, Panel, Formula, Notice } from "../components/UI.jsx";
import { useI18n } from "../i18n.js";

export default function Guide() {
  const { t } = useI18n();
  return <>
    <PageHeader eyebrow={t("gEyebrow")} title={t("gTitle")} description={t("gDesc")}/>
    <div className="guide-grid">
      {[1,2,3,4,5,6].map(i => <Panel key={i} title={t("g"+i)}><p>{t("g"+i+"Text")}</p>
        {i===2 && <Formula>{t("strengthFormula")}</Formula>}
        {i===3 && <><Formula>{t("existingFormula")}</Formula><Formula>{t("finalFormula")}</Formula></>}
      </Panel>)}
    </div>
    <Panel title={t("safetyTitle")} className="safety-panel" right={<AlertTriangle size={22}/>}>
      <p>{t("safety")}</p><p>{t("law")}</p>
      <a className="source-link" href="https://www.folkhalsomyndigheten.se/regler-och-tillsyn/tobak-och-nikotinprodukter-regler-for-tillverkning-handel-och-hantering/elektroniska-cigaretter-och-pafyllningsbehallare-sa-foljer-du-reglerna/tillverkning-och-import-av-e-cigaretter-och-pafyllningsbehallare/" target="_blank" rel="noopener noreferrer">{t("source")} <ExternalLink size={15}/></a>
    </Panel>
    <Notice>{t("notMedical")}</Notice>
  </>;
}
