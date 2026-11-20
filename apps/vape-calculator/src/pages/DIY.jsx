import React from "react";
import { CheckCircle2, Plus, Save, Trash2, X } from "lucide-react";
import { calculateDIY, LIMITS } from "../lib/calculations.js";
import { translateCalcError } from "../lib/translateErrors.js";
import { Field, Metric, Notice, PageHeader, Panel, ProgressBar, TextField, format } from "../components/UI.jsx";
import { useI18n } from "../i18n.js";

export const emptyDraft = () => ({
  name: "", notes: "", totalVolume: 60, targetStrength: 3,
  shotStrength: 20, shotVolume: 10, shotVgPercent: 50, targetVgPercent: 70,
  flavors: [{id:crypto.randomUUID(),name:"",percent:10,vgPercent:0}]
});
export const recipeInputs = draft => ({
  totalVolume: draft.totalVolume, targetStrength: draft.targetStrength,
  shotStrength: draft.shotStrength, shotVolume: draft.shotVolume,
  shotVgPercent: draft.shotVgPercent, targetVgPercent: draft.targetVgPercent,
  flavors: draft.flavors.map(({name,percent,vgPercent}) => ({name,percent,vgPercent}))
});

export default function DIY({ draft, setDraft, editing, onSave, cancelEdit, message, busy = false }) {
  const { t, lang } = useI18n();
  const change = key => value => setDraft(old => ({...old,[key]:value}));
  const editFlavor = (id,key,value) => setDraft(old => ({...old,flavors:old.flavors.map(f => f.id === id ? {...f,[key]:value}:f)}));
  const addFlavor = () => setDraft(old => ({...old,flavors:[...old.flavors,{id:crypto.randomUUID(),name:"",percent:5,vgPercent:0}]}));
  const removeFlavor = id => setDraft(old => ({...old,flavors:old.flavors.filter(f => f.id !== id)}));
  const r = calculateDIY(recipeInputs(draft));
  const valid = r.ok && r.feasible && draft.name.trim().length > 0 && draft.name.length <= 120 && draft.notes.length <= 2000 &&
    draft.flavors.every(f => f.name.trim().length > 0 && f.name.length <= 100);
  const items = r.ok && r.feasible ? [
    {name:t("pureVG"),value:r.vgVolume,color:"#f97316"},
    {name:t("purePG"),value:r.pgVolume,color:"#667cd3"},
    {name:t("nicShotLiquid"),value:r.nicotineVolume,color:"#17b39b"},
    ...r.flavorItems.map((f,i) => ({name:f.name || t("flavors")+" "+(i+1),value:f.volume,color:["#dc82a1","#ae8bd5","#dcaa55","#60a7ca"][i%4]}))
  ] : [];
  return <>
    <PageHeader eyebrow={t("dEyebrow")} title={t("dTitle")} description={t("dDesc")}/>
    {editing && <div className="editing-bar"><span>{t("editMode")}</span><button className="btn btn-ghost" type="button" onClick={cancelEdit}><X size={16}/>{t("cancelEdit")}</button></div>}
    <div className="workspace-grid">
      <div className="editor-column">
        <Panel title={t("recipeSettings")}><div className="fields-grid">
          <TextField label={t("recipeName")} value={draft.name} onChange={change("name")} placeholder={t("recipeExample")}/>
          <Field label={t("batch")} value={draft.totalVolume} onChange={change("totalVolume")} min={1} unit="ml"/>
        </div></Panel>
        <Panel title={t("baseAndNic")}><div className="fields-grid">
          <Field label={t("targetStrength")} value={draft.targetStrength} onChange={change("targetStrength")} max={20} unit="mg/ml"/>
          <Field label={t("vgTarget")} value={draft.targetVgPercent} onChange={change("targetVgPercent")} max={100} unit="%" hint={t("vgHint")}/>
          <Field label={t("shotStrength")} value={draft.shotStrength} onChange={change("shotStrength")} max={20} unit="mg/ml"/>
          <Field label={t("shotVolume")} value={draft.shotVolume} onChange={change("shotVolume")} max={10} unit="ml"/>
          <Field label={t("shotVg")} value={draft.shotVgPercent} onChange={change("shotVgPercent")} max={100} unit="%" hint={t("shotVgHint")}/>
        </div></Panel>
        <Panel title={t("flavors")} subtitle={t("flavorsDesc")} right={<span className="counter-tag">{draft.flavors.length}/{LIMITS.maxFlavors}</span>}>
          {draft.flavors.length ? <div className="flavor-list">{draft.flavors.map((f,i) =>
            <div className="flavor-editor" key={f.id}>
              <div className="flavor-heading"><span className="flavor-number">{String(i+1).padStart(2,"0")}</span>
                <button type="button" className="icon-button flavor-remove" aria-label={t("removeFlavor")} onClick={() => removeFlavor(f.id)}><Trash2 size={17}/></button>
              </div>
              <div className="flavor-fields">
                <TextField label={t("flavorName")} value={f.name} onChange={v => editFlavor(f.id,"name",v)} placeholder={t("flavorExample")} maxLength={100}/>
                <Field label={t("flavorPct")} value={f.percent} onChange={v => editFlavor(f.id,"percent",v)} max={100} unit="%"/>
                <Field label={t("flavorVg")} value={f.vgPercent} onChange={v => editFlavor(f.id,"vgPercent",v)} max={100} unit="%"/>
              </div>
            </div>)}</div> : <p className="empty-tiny">{t("noFlavors")}</p>}
          <button className="btn btn-outline add-flavor" type="button" disabled={draft.flavors.length >= LIMITS.maxFlavors} onClick={addFlavor}><Plus size={18}/>{t("addFlavor")}</button>
        </Panel>
        <Panel title={t("notes")}><textarea className="notes-input" value={draft.notes} maxLength={2000} onChange={e => change("notes")(e.target.value)} placeholder={t("notesExample")} rows={3}/></Panel>
      </div>
      <div className="result-column">
        <Panel className="result-panel sticky-result">
          <span className="eyebrow">{t("resultRecipe")}</span>
          <div className="hero-number">{format(draft.totalVolume)} <span>ml</span></div>
          <p className="result-caption">{t("targetStrength")}: {format(draft.targetStrength)} mg/ml · VG {format(draft.targetVgPercent)} %</p>
          {!r.ok ? <Notice type="error">{translateCalcError(r.error,lang)}</Notice> : !r.feasible ?
            <Notice type="warning"><strong>{t("impossible")}</strong> {t("closest",{percent:format(r.closestVgPercent)})}</Notice> :
            <>
              <div className="metrics-grid result-measures">
                <Metric label={t("pureVG")} value={format(r.vgVolume)} unit="ml"/>
                <Metric label={t("purePG")} value={format(r.pgVolume)} unit="ml"/>
                <Metric label={t("nicShotLiquid")} value={format(r.nicotineVolume)} unit="ml"/>
                <Metric label={t("flavorTotal")} value={format(r.flavorVolume)} unit="ml"/>
              </div>
              <div className="result-divider"/>
              <h3>{t("ingredients")}</h3><ProgressBar items={items}/>
              <div className="bottles-summary"><span>{t("buyBottles")}</span><strong>{format(r.bottlesToBuy,0)} st</strong></div>
              <Notice><CheckCircle2 size={16}/>{t("mixOkay")}</Notice>
            </>}
          <button className="btn btn-primary save-button" type="button" disabled={!valid || busy} onClick={() => onSave(draft)}><Save size={18}/>{t(editing ? "update" : "save")}</button>
          {message && <p role="status" className="save-feedback">{message}</p>}
        </Panel>
      </div>
    </div>
  </>;
}
