import React from "react";
import { ArrowRight, BookOpenText, FlaskConical, Layers3, Save, ShieldCheck, TestTube2, Zap } from "lucide-react";
import { useI18n } from "../i18n.js";
export default function Home({ navigate, count }) {
  const { t } = useI18n();
  const cards = [
    { id:"strength", icon:FlaskConical, index:"01", text:t("strengthInfo") },
    { id:"shots", icon:TestTube2, index:"02", text:t("shotsInfo") },
    { id:"diy", icon:Layers3, index:"03", text:t("diyInfo") },
    { id:"recipes", icon:Save, index:"04", text:t("recipesInfo") }
  ];
  return <>
    <div className="home-hero">
      <div className="hero-copy">
        <span className="eyebrow"><span className="status-dot" />{t("heroOverline")}</span>
        <h1>{t("heroTitle")}<br/><span>{t("heroSubtitle")}</span></h1>
        <p>{t("heroDesc")}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" type="button" onClick={() => navigate("strength")}>{t("start")} <ArrowRight size={18}/></button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("diy")}>{t("newRecipe")}</button>
        </div>
        <div className="hero-points">
          <span><Zap size={17}/>{t("instant")}</span>
          <span><ShieldCheck size={17}/>{t("noAccount")}</span>
        </div>
      </div>
      <div className="hero-demo" aria-hidden="true">
        <div className="demo-header"><span className="demo-dot"/><span className="demo-dot"/><span className="demo-dot"/><span className="demo-name">VapeCalc / 01</span></div>
        <div className="demo-inner"><span className="eyebrow">{t("finalStrength")}</span><div className="demo-big">3,33 <small>mg/ml</small></div><div className="demo-slider"><span/></div>
          <div className="demo-mini"><span>50 ml</span><span>+ 10 ml</span><span>= 60 ml</span></div><div className="demo-flask"><FlaskConical size={78} strokeWidth={1}/></div>
        </div>
      </div>
    </div>
    <div className="section-heading"><div><span className="eyebrow">VAPECALC</span><h2>{t("tools")}</h2><p>{t("toolsDesc")}</p></div></div>
    <div className="tool-grid">
      {cards.map(({id,index,icon:Icon,text}) => <button className="tool-card" key={id} type="button" onClick={() => navigate(id)}>
        <span className="tool-icon"><Icon size={24}/></span><span className="tool-index">{index}</span>
        <h3>{t(id)}</h3><p>{text}</p><span className="tool-link">{t("open")}<ArrowRight size={17}/></span>
      </button>)}
    </div>
    <div className="info-strip"><span><BookOpenText size={20}/>{t("savedLocally")}: {count}</span><button type="button" onClick={() => navigate("guide")}>{t("guide")} <ArrowRight size={16}/></button></div>
  </>;
}
