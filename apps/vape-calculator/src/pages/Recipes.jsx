import React, { useMemo, useRef, useState } from "react";
import { Copy, Download, FileJson, FolderOpen, Heart, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { calculateDIY } from "../lib/calculations.js";
import { recipeInputs } from "./DIY.jsx";
import { Notice, PageHeader, Panel, format } from "../components/UI.jsx";
import { useI18n } from "../i18n.js";

export default function Recipes({ recipes, navigate, onEdit, onDelete, onDuplicate, onToggleFavorite, onImport, importGuest, user, guestCount, busy = false, reloadCloud }) {
  const { t, lang } = useI18n();
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);
  const [search,setSearch]=useState("");
  const [nicotineFilter,setNicotineFilter]=useState("all");
  const [vgFilter,setVgFilter]=useState("all");
  const [onlyFavorites,setOnlyFavorites]=useState(false);
  const [sort,setSort]=useState("recent");
  const visible=useMemo(()=>recipes.filter(recipe=>{
    const d=recipe.data;
    const needle=search.trim().toLocaleLowerCase();
    if(needle && ![d.name,d.notes,...d.flavors.map(f=>f.name)].some(value=>value.toLocaleLowerCase().includes(needle)))return false;
    if(onlyFavorites && recipe.favorite!==true)return false;
    if(nicotineFilter==="zero" && d.targetStrength!==0)return false;
    if(nicotineFilter==="low" && !(d.targetStrength>0&&d.targetStrength<=6))return false;
    if(nicotineFilter==="high" && d.targetStrength<=6)return false;
    if(vgFilter==="70" && d.targetVgPercent!==70)return false;
    if(vgFilter==="50" && d.targetVgPercent!==50)return false;
    if(vgFilter==="other" && [50,70].includes(d.targetVgPercent))return false;
    return true;
  }).sort((a,b)=>sort==="name"?a.data.name.localeCompare(b.data.name,lang==="sv"?"sv":"en"): (Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0)),[recipes,search,nicotineFilter,vgFilter,onlyFavorites,sort,lang]);
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
      const count = await onImport(payload);
      setMessage(t("importDone",{count}));
    } catch {setMessage(t("importError"));}
  };
  return <>
    <PageHeader eyebrow={t("rEyebrow")} title={t("rTitle")} description={t(user?"rDescCloud":"rDesc")}/>
    <Panel className="recipe-toolbar">
      <div><strong>{t("recipeCount",{count:recipes.length})}</strong><p>{user?(lang==="sv"?"🔒 Privata recept i Supabase Storage":"🔒 Private recipes in Supabase Storage"):t("savedLocally")}</p></div>
      <div className="toolbar-actions">
        <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()} disabled={busy}><Upload size={16}/>{t("import")}</button>
        <input ref={fileRef} type="file" hidden accept="application/json,.json" onChange={importFile} aria-label={t("import")}/>
        <button type="button" className="btn btn-outline" onClick={download} disabled={!recipes.length || busy}><Download size={16}/>{t("export")}</button>
        <button type="button" className="btn btn-primary" onClick={() => navigate("diy")} disabled={busy}><Plus size={16}/>{t("newRecipe")}</button>
      </div>
    </Panel>
    <div className="recipe-filter-panel">
      <label className="recipe-search"><Search size={18} aria-hidden="true"/><span className="sr-only">{t("searchRecipes")}</span><input aria-label={t("searchRecipes")} type="search" value={search} placeholder={t("searchRecipes")} onChange={e=>setSearch(e.target.value)} /></label>
      <label>{t("nicotineFilter")}<select value={nicotineFilter} onChange={e=>setNicotineFilter(e.target.value)}><option value="all">{t("filterAll")}</option><option value="zero">0 mg/ml</option><option value="low">0–6 mg/ml</option><option value="high">&gt;6 mg/ml</option></select></label>
      <label>{t("vgFilter")}<select value={vgFilter} onChange={e=>setVgFilter(e.target.value)}><option value="all">{t("filterAll")}</option><option value="70">70 % VG</option><option value="50">50 % VG</option><option value="other">{t("filterOther")}</option></select></label>
      <label>{t("sortBy")}<select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">{t("sortRecent")}</option><option value="name">{t("sortName")}</option></select></label>
      <label className="recipe-favorite-toggle"><input type="checkbox" checked={onlyFavorites} onChange={e=>setOnlyFavorites(e.target.checked)} /> <Heart size={16} aria-hidden="true"/>{t("favoritesOnly")}</label>
    </div>
    <p className="recipe-result-count" role="status">{t("showingRecipes",{count:visible.length,total:recipes.length})}</p>
    {user?<div className="cloud-tools">
      <button type="button" className="btn btn-outline" onClick={()=>void reloadCloud()} disabled={busy}>{lang==="sv"?"↻ Uppdatera från molnet":"↻ Refresh from cloud"}</button>
      {guestCount>0&&<button type="button" className="btn btn-outline" onClick={()=>void importGuest()} disabled={busy}>{lang==="sv"?"Importera lokala gästrecept":"Import local guest recipes"} ({guestCount})</button>}
    </div>:<p className="guest-sync-note">{lang==="sv"?"Recepten sparas bara i denna webbläsare.":"Recipes are saved only in this browser."} <a href={"/vape-calculator/account/?returnTo="+encodeURIComponent("/vape-calculator/#/recipes")}>{lang==="sv"?"Logga in för privata molnrecept":"Sign in for private cloud recipes"} →</a></p>}
    {busy&&<p role="status" className="save-feedback">{lang==="sv"?"Synkroniserar recept…":"Syncing recipes…"}</p>}
    {message && <p role="status" className="save-feedback">{message}</p>}
    {!recipes.length ? <div className="empty-state"><FolderOpen size={48}/><h2>{t("empty")}</h2><p>{t("emptyDesc")}</p><button type="button" className="btn btn-primary" onClick={() => navigate("diy")}>{t("backToDIY")}</button></div> :
      !visible.length?<div className="empty-state"><Search size={36}/><h2>{t("noResults")}</h2><button type="button" className="btn btn-outline" onClick={()=>{setSearch("");setNicotineFilter("all");setVgFilter("all");setOnlyFavorites(false)}}>{t("clearFilters")}</button></div>:
      <div className="recipe-grid">{visible.map(recipe => {
        const calc=calculateDIY(recipeInputs(recipe.data));
        return <article key={recipe.id} className="saved-card">
          <div className="saved-card-top"><span className="saved-card-icon"><FileJson size={21}/></span><span className="saved-date">{new Date(recipe.updatedAt || recipe.createdAt).toLocaleDateString(lang === "sv" ? "sv-SE" : "en-GB")}</span></div>
          <h2>{recipe.data.name}</h2><p className="saved-notes">{recipe.data.notes || (recipe.data.flavors.length ? recipe.data.flavors.map(f=>f.name).join(", ") : "—")}</p>
          <div className="saved-stats"><span><b>{format(recipe.data.totalVolume)}</b> ml</span><span><b>{format(recipe.data.targetStrength)}</b> mg/ml</span><span><b>{format(recipe.data.targetVgPercent)}</b> % VG</span></div>
          {calc.ok && calc.feasible && <p className="saved-flavors">{t("nicShotLiquid")}: {format(calc.nicotineVolume)} ml · {t("flavorTotal")}: {format(calc.flavorVolume)} ml</p>}
          <div className="saved-actions">
            <button type="button" className={"mini-action favorite-action"+(recipe.favorite?" is-favorite":"")} aria-pressed={recipe.favorite===true} aria-label={recipe.favorite?t("removeFavorite"):t("addFavorite")} title={recipe.favorite?t("removeFavorite"):t("addFavorite")} onClick={()=>void onToggleFavorite(recipe)} disabled={busy}><Heart size={16} fill={recipe.favorite?"currentColor":"none"}/>{recipe.favorite?t("favorite"):t("addFavorite")}</button>
            <button type="button" className="mini-action" onClick={() => onEdit(recipe)} disabled={busy}><Pencil size={16}/>{t("edit")}</button>
            <button type="button" className="mini-action" onClick={() => void onDuplicate(recipe)} disabled={busy}><Copy size={16}/>{t("copy")}</button>
            <button type="button" className="mini-action danger" onClick={() => {if(window.confirm(t("confirmDelete",{name:recipe.data.name})))void onDelete(recipe.id);}} disabled={busy}><Trash2 size={16}/>{t("delete")}</button>
          </div>
        </article>;
      })}</div>}
    <Notice>{user?(lang==="sv"?"Recepten sparas i en privat bucket under ditt konto. Lokala gästrecept förs inte över utan ditt val.":"Recipes are saved in a private bucket under your account. Local guest recipes are not transferred without your consent."):t("localNote")} {t("importNote")}</Notice>
  </>;
}
