import { useEffect, useRef, useState } from 'react'
import { usePreferences, useTranslate } from './i18n'
import './portal.css'

const projects = [
  {id:'smoke',name:'Smoke Less',url:'/smoke-less/',icon:'◎',sv:'RÖKAVVÄNJNING',en:'SMOKING CESSATION',svTitle:'Små steg. Stor förändring.',enTitle:'Small steps. Big change.',svDesc:'En Android-app med personliga mål, statistik och stöd när röksuget kommer. Fortfarande under utveckling.',enDesc:'An Android app for personal goals, progress tracking and support when cravings strike. Still in development.',svTag:'Android · Preview',enTag:'Android · Preview'},
  {id:'vape',name:'Vape Calculator',url:'/vape-calculator/',icon:'⌁',sv:'E-VÄTSKEVERKTYG',en:'E-LIQUID TOOLS',svTitle:'Varje droppe uträknad.',enTitle:'Every drop calculated.',svDesc:'Räkna ut nikotinstyrka, shots och DIY-recept med VG/PG-fördelning. Gratis, utan konto.',enDesc:'Calculate nicotine strength, shots and DIY recipes with VG/PG balance. Free, no account required.',svTag:'Webbverktyg · Gratis',enTag:'Web tool · Free'}
]
export default function Portal() {
  const {lang,setLang,theme,toggleTheme}=usePreferences()
  const t=useTranslate()
  const [open,setOpen]=useState(false)
  const drawer=useRef<HTMLElement>(null),trigger=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.key==='Escape')setOpen(false)
      if(e.key==='Tab'&&open){
        const els=Array.from(drawer.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')??[])
        const first=els[0],last=els[els.length-1]
        if(!first||!last)return
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    }
    document.addEventListener('keydown',handler)
    return()=>document.removeEventListener('keydown',handler)
  },[open])
  useEffect(()=>{
    if(!open)return
    const previous=document.activeElement as HTMLElement|null
    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    drawer.current?.querySelector<HTMLButtonElement>('.hub-drawer-close')?.focus()
    return()=>{document.body.style.overflow=previousOverflow;if(previous?.isConnected)previous.focus();else trigger.current?.focus()}
  },[open])
  const nav=projects.map(p=><a key={p.id} href={p.url} onClick={()=>setOpen(false)}>{p.name}</a>)
  return <div className="hub" data-theme={theme}>
    <a className="hub-skip" href="#hub-main">{t('Hoppa till innehållet','Skip to content')}</a>
    <header className="hub-header"><div className="hub-header-inner">
      <a className="hub-brand" href="/"><span className="hub-brand-icon">W</span><span>WOLFYSLAYER<small>PROJECTS & TOOLS</small></span></a>
      <nav className="hub-desktop-nav" aria-label={t('Huvudmeny','Main menu')}>{nav}</nav>
      <div className="hub-controls">
        <label className="hub-language"><span aria-hidden="true">{lang==='sv'?'🇸🇪':'🇬🇧'}</span><select value={lang} onChange={e=>setLang(e.target.value==='en'?'en':'sv')} aria-label={t('Välj språk','Choose language')}><option value="sv">Svenska</option><option value="en">English</option></select><span aria-hidden="true">⌄</span></label>
        <button className="hub-control" type="button" onClick={toggleTheme} aria-label={t('Byt tema','Toggle theme')}>{theme==='dark'?'☀':'☾'}</button>
        <button className="hub-control hub-menu" ref={trigger} type="button" onClick={()=>setOpen(v=>!v)} aria-controls="hub-mobile-nav" aria-expanded={open} aria-label={open?t('Stäng meny','Close menu'):t('Öppna meny','Open menu')}>☰</button>
      </div>
    </div></header>
    <div className={'hub-backdrop'+(open?' visible':'')} aria-hidden="true" onClick={()=>setOpen(false)}></div>
    <nav id="hub-mobile-nav" ref={drawer} className={'hub-drawer'+(open?' open':'')} aria-hidden={!open} inert={!open} aria-label={t('Mobilmeny','Mobile menu')}>
      <div className="hub-drawer-head"><strong>{t('Välj projekt','Choose a project')}</strong><button className="hub-drawer-close" type="button" onClick={()=>setOpen(false)} aria-label={t('Stäng meny','Close menu')}>✕</button></div>
      {nav}<a href="#projects" onClick={()=>setOpen(false)}>{t('Utforska projekten','Explore projects')}</a><span className="hub-drawer-note">WOLFYSLAYER.ONLINE</span>
    </nav>
    <main id="hub-main">
      <section className="hub-hero"><div className="hub-halo" aria-hidden="true"></div><div className="hub-hero-inner">
        <span className="hub-eyebrow">✳ {t('ETT HEM FÖR VÅRA PROJEKT','ONE HOME FOR OUR PROJECTS')}</span>
        <h1>{t('Verktyg som gör','Tools that make')}<br/><em>{t('skillnad.','a difference.')}</em></h1>
        <p>{t('Välkommen till Wolfyslayer. Två projekt, ett gemensamt hem – byggda med fokus på enkelhet, tydlighet och kontroll.','Welcome to Wolfyslayer. Two projects, one home — built around simplicity, clarity and control.')}</p>
        <a className="hub-button" href="#projects">{t('Utforska projekten','Explore the projects')} <span aria-hidden="true">↗</span></a>
      </div><div className="hub-watermark" aria-hidden="true">W</div></section>
      <section className="hub-project-section" id="projects"><div className="hub-heading"><div><span className="hub-eyebrow">{t('VÅRA PROJEKT','OUR PROJECTS')}</span><h2>{t('Vad vill du utforska?','What would you like to explore?')}</h2></div><span className="hub-counter">02 / 02</span></div>
        <div className="hub-grid">{projects.map(p=><a className={'hub-project '+p.id} href={p.url} key={p.id}>
          <div className="hub-project-top"><span className="hub-project-mark" aria-hidden="true">{p.icon}</span><span>{t(p.sv,p.en)}</span><span className="hub-project-arrow" aria-hidden="true">↗</span></div>
          <div className="hub-art" aria-hidden="true">{p.id==='smoke'?<div className="hub-smoke-art"><div className="hub-circle"/><strong>75<small>%</small></strong></div>:<div className="hub-vape-art"><span>VG / PG</span><strong>70 <small>/ 30</small></strong><div className="hub-bars"><i/><i/></div><small>NICOTINE · SHOTS · RECIPES</small></div>}</div>
          <div className="hub-project-copy"><span className="hub-tag">{t(p.svTag,p.enTag)}</span><h3>{p.name}</h3><h4>{t(p.svTitle,p.enTitle)}</h4><p>{t(p.svDesc,p.enDesc)}</p><span className="hub-open-link">{t('Öppna projektet','Open project')} <span aria-hidden="true">→</span></span></div>
        </a>)}</div>
      </section>
      <section className="hub-bottom"><span className="hub-eyebrow">{t('BYGGT FÖR ATT VARA ANVÄNDBART','DESIGNED TO BE USEFUL')}</span><p>{t('Inga onödiga steg. Inget krångel. Bara genomtänkta verktyg som fortsätter utvecklas.','No unnecessary steps. No clutter. Just thoughtfully designed tools that keep improving.')}</p></section>
    </main>
    <footer className="hub-footer"><span>© {new Date().getFullYear()} Wolfyslayer</span><nav aria-label={t('Sidfot','Footer')}><a href="/smoke-less/">Smoke Less</a><a href="/vape-calculator/">Vape Calculator</a><a href="mailto:contact@wolfyslayer.online">{t('Kontakt','Contact')}</a></nav></footer>
  </div>
}
