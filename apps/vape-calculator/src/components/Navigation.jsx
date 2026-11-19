import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpenText, ChevronDown, ChevronRight, FlaskConical, House, Layers3, Menu, Moon, Save, Sun, TestTube2, X } from "lucide-react";
import { useI18n } from "../i18n.js";

export const NAV = [
  { id: "home", icon: House },
  { id: "strength", icon: FlaskConical },
  { id: "shots", icon: TestTube2 },
  { id: "diy", icon: Layers3 },
  { id: "recipes", icon: Save },
  { id: "guide", icon: BookOpenText }
];

export function LanguageSwitcher({ lang, onChange }) {
  const { t } = useI18n();
  return <label className="select-shell" aria-label={t("language")}>
    <span className="language-flag" aria-hidden="true">{lang === "sv" ? "🇸🇪" : "🇬🇧"}</span>
    <select value={lang} onChange={event => onChange(event.target.value)} aria-label={t("language")}>
      <option value="sv">Svenska</option><option value="en">English</option>
    </select>
    <ChevronDown size={15} aria-hidden="true" />
  </label>;
}

export function Navigation({ page, navigate, lang, changeLang, theme, changeTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const { t } = useI18n();
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
        <LanguageSwitcher lang={lang} onChange={changeLang} />
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
        <p>{t("savedLocally")} · {t("noAccount")}</p>
      </div>
    </aside>
  </>;
}
