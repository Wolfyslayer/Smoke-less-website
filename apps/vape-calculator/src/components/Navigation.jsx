import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, BookOpenText, ChevronDown, ChevronRight, FlaskConical, House, Layers3, Menu, Moon, Save, Sun, TestTube2, UserRound, X } from "lucide-react";
import { useI18n } from "../i18n.js";

export const NAV = [
  { id: "home", icon: House },
  { id: "strength", icon: FlaskConical },
  { id: "shots", icon: TestTube2 },
  { id: "diy", icon: Layers3 },
  { id: "recipes", icon: Save },
  { id: "guide", icon: BookOpenText }
];

export function LanguageSwitcher({lang,onChange,theme}) {
  const {t}=useI18n();
  const [open,setOpen]=useState(false);
  const title=useId();
  const button=useRef(null),dialog=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const before=document.activeElement;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    dialog.current?.querySelector('button[aria-pressed="true"]')?.focus();
    const keys=event=>{
      if(event.key==="Escape"){event.preventDefault();setOpen(false);return;}
      if(event.key!=="Tab")return;
      const elements=Array.from(dialog.current?.querySelectorAll('button:not([disabled])')||[]);
      if(!elements.length)return;
      const first=elements[0],last=elements[elements.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",keys);
    return()=>{
      document.removeEventListener("keydown",keys);
      document.body.style.overflow=previousOverflow;
      if(before?.isConnected)before.focus();
      else button.current?.focus();
    };
  },[open]);
  const change=next=>{onChange(next);setOpen(false);};
  return <>
    <button ref={button} className="vape-lang-trigger" type="button" aria-label={lang==="sv"?"Välj språk":"Choose language"} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>
      <span aria-hidden="true">{lang==="sv"?"🇸🇪":"🇬🇧"}</span><span>{lang.toUpperCase()}</span><ChevronDown size={16}/>
    </button>
    {open&&createPortal(<div className="vape-language-modal" data-theme={theme} onPointerDown={event=>{if(event.target===event.currentTarget)setOpen(false);}}>
      <div className="vape-language-panel" role="dialog" aria-modal="true" aria-labelledby={title} ref={dialog}>
        <div className="vape-language-title"><div><span>VAPECALC / LANGUAGE</span><h2 id={title}>{lang==="sv"?"Välj språk":"Choose language"}</h2></div>
          <button type="button" className="vape-language-close" aria-label={lang==="sv"?"Stäng":"Close"} onClick={()=>setOpen(false)}><X size={20}/></button></div>
        <p>{lang==="sv"?"Välj språket du vill använda.":"Select your preferred language."}</p>
        <div className="vape-language-choices">
          <button type="button" lang="sv" aria-pressed={lang==="sv"} onClick={()=>change("sv")}><span>🇸🇪</span><span><strong>Svenska</strong><small>Swedish</small></span><span className="vape-language-check">{lang==="sv"?"✓":""}</span></button>
          <button type="button" lang="en" aria-pressed={lang==="en"} onClick={()=>change("en")}><span>🇬🇧</span><span><strong>English</strong><small>Engelska</small></span><span className="vape-language-check">{lang==="en"?"✓":""}</span></button>
        </div>
        <small className="vape-language-foot">{lang==="sv"?"Språkvalet sparas på din enhet.":"Your language preference is saved on your device."}</small>
      </div>
    </div>,document.body)}
  </>;
}

export function Navigation({ page, navigate, lang, changeLang, theme, changeTheme, user, checkingAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const { t } = useI18n();
  const accountHref = '/account/?returnTo=' + encodeURIComponent(window.location.pathname + window.location.hash);
  const choose = (id) => {
    setMenuOpen(false);
    navigate(id);
  };
  useEffect(() => {
    if (!menuOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = event => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const nodes = menuRef.current?.querySelectorAll('a[href],button:not([disabled]),select:not([disabled])') || [];
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    menuRef.current?.querySelector("button.drawer-close")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
      else triggerRef.current?.focus();
    };
  }, [menuOpen]);
  return <>
    <header className="site-topbar">
      <div className="topbar-start">
        <button ref={triggerRef} className="icon-button hamburger" type="button" aria-label={t("menu")} aria-expanded={menuOpen} aria-controls="main-drawer" onClick={() => setMenuOpen(value => !value)}><Menu size={23}/></button>
        <button className="brand-link" type="button" onClick={() => choose("home")} aria-label="VapeCalc">
          <span className="brand-symbol"><FlaskConical size={22} /></span><span>Vape<span className="brand-accent">Calc</span><small>{t("brandTag")}</small></span>
        </button>
      </div>
      <div className="topbar-controls">
        <a className="vape-account-link" href={accountHref} aria-label={user?(lang==="sv"?"Mitt konto":"My account"):(lang==="sv"?"Logga in":"Sign in")}><UserRound size={18}/><span>{checkingAuth?"…":user?(lang==="sv"?"Mitt konto":"My account"):(lang==="sv"?"Logga in":"Sign in")}</span></a>
        <LanguageSwitcher lang={lang} onChange={changeLang} theme={theme} />
        <button type="button" className="icon-button" onClick={changeTheme} aria-label={t("theme") + ": " + t(theme === "dark" ? "light" : "dark")} title={t(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={20}/> : <Moon size={20}/>}</button>
      </div>
    </header>
    <div className={"drawer-overlay " + (menuOpen ? "is-open" : "")} onClick={() => setMenuOpen(false)} aria-hidden="true" />
    <aside ref={menuRef} id="main-drawer" className={"navigation-drawer " + (menuOpen ? "is-open" : "")} aria-label={t("menu")} aria-hidden={!menuOpen} inert={!menuOpen ? true : undefined}>
      <div className="drawer-heading">
        <span className="brand-compact"><span className="brand-symbol"><FlaskConical size={19} /></span><b>Vape<span className="brand-accent">Calc</span></b></span>
        <button type="button" className="icon-button drawer-close" onClick={() => setMenuOpen(false)} aria-label={t("closeMenu")}><X size={21}/></button>
      </div>
      <nav aria-label={t("menu")} className="drawer-links">
        {NAV.map(({id, icon: Icon}) => <button key={id} type="button" className={"drawer-item " + (page === id ? "is-active" : "")} aria-current={page === id ? "page" : undefined} onClick={() => choose(id)}><Icon size={19}/><span>{t(id)}</span><ChevronRight size={16} className="drawer-chevron"/></button>)}
      </nav>
      <div className="drawer-bottom">
        <a className="drawer-back" href="/"><ArrowLeft size={16}/>{t("backHub")}</a>
        <a className="drawer-back" href={accountHref}><UserRound size={16}/>{user?(lang==="sv"?"Mitt konto":"My account"):(lang==="sv"?"Logga in":"Sign in")}</a>
        <p>{t("savedLocally")} · {t("noAccount")}</p>
      </div>
    </aside>
  </>;
}
