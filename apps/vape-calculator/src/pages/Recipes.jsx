import React, { useRef, useState } from "react";
import { Copy, Download, FileJson, FolderOpen, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { calculateDIY } from "../lib/calculations.js";
import { recipeInputs } from "./DIY.jsx";
import { Notice, PageHeader, Panel, format } from "../components/UI.jsx";
import { useI18n } from "../i18n.js";

export default function Recipes({ recipes, navigate, onEdit, onDelete, onDuplicate, onImport }) {
  const { t, lang } = useI18n();
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);
  const download = () => {
    const blob = new Blob([JSON.stringify({ format:"vapecalc-recipes",version:1,recipes },null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");link.href = url;link.download = "vapecalc-recipes.json";link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  const importFile = async event => {
    const file = event.target.files?.[0];event.target.value = "";
    if (!file) return;
    if (file.size > 512000) {setMessage(t("importError"));return;}
    try {
      const payload = JSON.parse(await file.text());
      const count = onImport(payload);
      setMessage(t("importDone",{count}));
    } catch {setMessage(t("importError"));}
  };
  return <>
    <PageHeader eyebrow={t("rEyebrow")} title={t("rTitle")} description={t("rDesc")}/>
    <Panel className="recipe-toolbar">
      <div><strong>{t("recipeCount",{count:recipes.length})}</strong><p>{t("savedLocally")}</p></div>
      <div className="toolbar-actions">
        <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}><Upload size={16}/>{t("import")}</button>
        <input ref={fileRef} type="file" hidden accept="application/json,.json" onChange={importFile} aria-label={t("import")}/>
        <button type="button" className="btn btn-outline" onClick={download} disabled={!recipes.length}><Download size={16}/>{t("export")}</button>
        <button type="button" className="btn btn-primary" onClick={() => navigate("diy")}><Plus size={16}/>{t("newRecipe")}</button>
      </div>
    </Panel>
    {message && <p role="status" className="save-feedback">{message}</p>}
    {!recipes.length ? <div className="empty-state"><FolderOpen size={48}/><h2>{t("empty")}</h2><p>{t("emptyDesc")}</p><button type="button" className="btn btn-primary" onClick={() => navigate("diy")}>{t("backToDIY")}</button></div> :
      <div className="recipe-grid">{recipes.map(recipe => {
        const calc=calculateDIY(recipeInputs(recipe.data));
        return <article key={recipe.id} className="saved-card">
          <div className="saved-card-top"><span className="saved-card-icon"><FileJson size={21}/></span><span className="saved-date">{new Date(recipe.updatedAt || recipe.createdAt).toLocaleDateString(lang === "sv" ? "sv-SE" : "en-GB")}</span></div>
          <h2>{recipe.data.name}</h2><p className="saved-notes">{recipe.data.notes || (recipe.data.flavors.length ? recipe.data.flavors.map(f=>f.name).join(", ") : "—")}</p>
          <div className="saved-stats"><span><b>{format(recipe.data.totalVolume)}</b> ml</span><span><b>{format(recipe.data.targetStrength)}</b> mg/ml</span><span><b>{format(recipe.data.targetVgPercent)}</b> % VG</span></div>
          {calc.ok && calc.feasible && <p className="saved-flavors">{t("nicShotLiquid")}: {format(calc.nicotineVolume)} ml · {t("flavorTotal")}: {format(calc.flavorVolume)} ml</p>}
          <div className="saved-actions">
            <button type="button" className="mini-action" onClick={() => onEdit(recipe)}><Pencil size={16}/>{t("edit")}</button>
            <button type="button" className="mini-action" onClick={() => onDuplicate(recipe)}><Copy size={16}/>{t("copy")}</button>
            <button type="button" className="mini-action danger" onClick={() => {if(window.confirm(t("confirmDelete",{name:recipe.data.name})))onDelete(recipe.id);}}><Trash2 size={16}/>{t("delete")}</button>
          </div>
        </article>;
      })}</div>}
    <Notice>{t("localNote")} {t("importNote")}</Notice>
  </>;
}
