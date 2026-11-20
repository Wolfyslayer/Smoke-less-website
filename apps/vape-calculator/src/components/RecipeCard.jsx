import React,{useEffect,useId,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {Clipboard,Printer,Share2,X} from "lucide-react";
import {calculateDIY} from "../lib/calculations.js";
import {calculateRecipeCost} from "../lib/recipeCosts.js";
import {useI18n} from "../i18n.js";

export function recipeCardText(recipe,lang="sv"){
 const d=recipe.data,r=calculateDIY(d),money=calculateRecipeCost(d);
 if(!r.ok||!r.feasible)return "";
 const fmt=n=>new Intl.NumberFormat(lang==="en"?"en-GB":"sv-SE",{maximumFractionDigits:2}).format(n);
 const lines=[d.name,fmt(d.totalVolume)+" ml • "+fmt(d.targetStrength)+" mg/ml • "+fmt(d.targetVgPercent)+" % VG",
  "VG: "+fmt(r.vgVolume)+" ml","PG: "+fmt(r.pgVolume)+" ml",
  (lang==="en"?"Nicotine shots: ":"Nikotinshots: ")+fmt(r.nicotineVolume)+" ml",
  ...r.flavorItems.map(f=>f.name+": "+fmt(f.volume)+" ml")];
 if(money.ok&&money.hasPrices)lines.push((lang==="en"?"Estimated cost: ":"Beräknad kostnad: ")+fmt(money.totalCost)+" SEK");
 if(d.notes?.trim())lines.push((lang==="en"?"Notes: ":"Anteckningar: ")+d.notes.trim());
 return lines.join("\n");
}
export default function RecipeCard({recipe,onClose}){
 const {t,lang}=useI18n();
 const titleId=useId();const panel=useRef(null),closeButton=useRef(null);
 const [message,setMessage]=useState(""),[fallback,setFallback]=useState(false);
 const data=recipe.data,calc=calculateDIY(data),cost=calculateRecipeCost(data);
 const text=recipeCardText(recipe,lang);
 const fmt=n=>new Intl.NumberFormat(lang==="en"?"en-GB":"sv-SE",{maximumFractionDigits:2}).format(n);
 useEffect(()=>{
  const before=document.activeElement,prevOverflow=document.body.style.overflow;
  document.body.style.overflow="hidden";closeButton.current?.focus();
  const onKey=e=>{
   if(e.key==="Escape"){e.stopPropagation();onClose();return;}
   if(e.key!=="Tab")return;
   const nodes=Array.from(panel.current?.querySelectorAll("button:not([disabled]),textarea:not([disabled])")||[]);
   if(!nodes.length)return;
   if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes[nodes.length-1].focus();}
   else if(!e.shiftKey&&document.activeElement===nodes[nodes.length-1]){e.preventDefault();nodes[0].focus();}
  };
  document.addEventListener("keydown",onKey);
  return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=prevOverflow;if(before?.isConnected)before.focus();};
 },[onClose]);
 const copy=async()=>{try{await navigator.clipboard.writeText(text);setMessage(t("recipeCopied"));setFallback(false);}catch{setFallback(true);setMessage(t("recipeShareError"));}};
 const share=async()=>{
  if(!navigator.share){await copy();return;}
  try{await navigator.share({title:data.name,text});}catch(err){if(err?.name!=="AbortError"){setFallback(true);setMessage(t("recipeShareError"));}}
 };
 const lines=calc.ok&&calc.feasible?[
  ["VG",calc.vgVolume],["PG",calc.pgVolume],[t("nicShotLiquid"),calc.nicotineVolume],
  ...calc.flavorItems.map(f=>[f.name,f.volume])]:[];
 return createPortal(<div className="recipe-print-overlay" onPointerDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="recipe-card-dialog" ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
   <div className="recipe-card-heading"><div><span className="eyebrow">VAPECALC · {t("recipeCard")}</span><h2 id={titleId}>{data.name}</h2></div><button ref={closeButton} type="button" className="icon-button recipe-card-close" aria-label={t("cancel")} onClick={onClose}><X size={19}/></button></div>
   <p className="recipe-card-info">{fmt(data.totalVolume)} ml · {fmt(data.targetStrength)} mg/ml · VG {fmt(data.targetVgPercent)} %</p>
   <h3>{t("cardIngredients")}</h3>
   <ul className="recipe-card-lines">{lines.map(([label,amount],i)=><li key={i}><span>{label}</span><strong>{fmt(amount)} ml</strong></li>)}</ul>
   {cost.ok&&cost.hasPrices&&<p><strong>{t("estimatedCost")}: {fmt(cost.totalCost)} {t("currency")}</strong></p>}
   <h3>{t("notes")}</h3><p>{data.notes?.trim()||t("cardNoNotes")}</p>
   <div className="recipe-card-actions"><button className="btn btn-outline" type="button" onClick={()=>window.print()}><Printer size={17}/>{t("printRecipe")}</button><button className="btn btn-outline" type="button" onClick={()=>void share()}><Share2 size={17}/>{t("shareRecipe")}</button><button className="btn btn-outline" type="button" onClick={()=>void copy()}><Clipboard size={17}/>{t("copyRecipe")}</button></div>
   {message&&<p role="status" className="save-feedback">{message}</p>}
   {fallback&&<textarea className="recipe-share-text" readOnly value={text} aria-label={t("copyRecipe")} onFocus={e=>e.target.select()} />}
  </div>
 </div>,document.body);
}
