import { useEffect, useState } from 'react'
import { SiteNavigation } from './SiteNavigation'
import { useSiteLocale } from './SiteLocale'
import './hub.css'

export default function Hub(){
  const {language,tr} = useSiteLocale()
  const [theme,setTheme] = useState<'dark'|'light'>(()=>{try{return localStorage.getItem('wolfyslayer:hub-theme')==='light'?'light':'dark'}catch{return 'dark'}})
  useEffect(()=>{document.title=tr('Wolfyslayer – Projekt & verktyg','Wolfyslayer – Projects & tools');document.documentElement.lang=language},[language,tr])
  const changeTheme=()=>setTheme(old=>{const next=old==='dark'?'light':'dark';try{localStorage.setItem('wolfyslayer:hub-theme',next)}catch{}return next})
  return <div className={'wolf-hub hub-theme-'+theme}>
    <a className="hub-skip" href="#hub-content">{tr('Hoppa till innehållet','Skip to content')}</a>
    <SiteNavigation section="hub" theme={theme}/>
    <main id="hub-content" className="hub-main">
      <div className="hub-ambient" aria-hidden="true"/>
      <div className="hub-topline"><span className="hub-eyebrow"><i/> WOLFYSLAYER / DIGITAL</span><button className="hub-theme-button" type="button" onClick={changeTheme} aria-label={theme==='dark'?tr('Byt till ljust tema','Switch to light theme'):tr('Byt till mörkt tema','Switch to dark theme')}>{theme==='dark'?'☀':'☾'} <span>{theme==='dark'?tr('Ljust','Light'):tr('Mörkt','Dark')}</span></button></div>
      <section className="hub-hero">
        <span className="hub-pill">{tr('ETT HEM FÖR VÅRA PROJEKT','ONE HOME FOR OUR PROJECTS')}</span>
        <h1>{tr('Välj vart du vill','Choose where to')}<br/><em>{tr('ta vägen härnäst.','go next.')}</em></h1>
        <p>{tr('Vi skapar digitala verktyg och appar med fokus på tydlighet, funktion och användarupplevelse. Välj ett projekt nedan för att komma vidare.','We build digital tools and apps with clarity, function and user experience in mind. Choose a project below to explore.')}</p>
        <a className="hub-explore" href="#projects">{tr('Utforska projekten','Explore the projects')} <span aria-hidden="true">↓</span></a>
      </section>
      <section id="projects" className="hub-projects" aria-label={tr('Våra projekt','Our projects')}>
        <div className="hub-section-heading"><span className="hub-eyebrow">{tr('VÅRA PROJEKT','OUR PROJECTS')}</span><h2>{tr('Hitta rätt verktyg för dig.','Find the right tool for you.')}</h2></div>
        <div className="hub-card-grid">
          <a className="hub-card hub-smoke" href="/smoke-less/">
            <div className="hub-card-top"><span className="hub-card-icon" aria-hidden="true">♡</span><span className="hub-card-label">{tr('ANDROID-APP','ANDROID APP')}</span></div>
            <div className="hub-card-copy"><h3>Smoke Less</h3><p>{tr('En lugnare väg mot ett rökfritt liv. Planera, följ dina framsteg och hitta stöd när du behöver det.','A calmer path toward a smoke-free life. Plan your journey, follow your progress and find support when you need it.')}</p></div>
            <span className="hub-card-bottom">{tr('Upptäck Smoke Less','Explore Smoke Less')} <span>↗</span></span>
          </a>
          <a className="hub-card hub-vape" href="/vape-calculator/">
            <div className="hub-card-top"><span className="hub-card-icon" aria-hidden="true">⌁</span><span className="hub-card-label">{tr('BERÄKNINGSVERKTYG','CALCULATION TOOL')}</span></div>
            <div className="hub-card-copy"><h3>Vape Calculator</h3><p>{tr('Räkna på nikotinstyrka, planera shots och skapa egna DIY-recept med tydliga PG/VG-beräkningar.','Calculate nicotine strength, plan shots and create your own DIY recipes with clear PG/VG calculations.')}</p></div>
            <span className="hub-card-bottom">{tr('Öppna kalkylatorn','Open calculator')} <span>↗</span></span>
          </a>
          <a className="hub-card hub-shadow" href="/shadow-slayers/">
            <div className="hub-card-top"><span className="hub-card-icon" aria-hidden="true">✧</span><span className="hub-card-label">{tr('DISCORD-BOT','DISCORD BOT')}</span></div>
            <div className="hub-card-copy"><h3>ShadowSlayers</h3><p>{tr('En fantasyinspirerad Discord-bot för moderation, roller, support och communityhantering. Under utveckling.','A fantasy-inspired Discord bot for moderation, roles, support and community management. In development.')}</p></div>
            <span className="hub-card-bottom">{tr('Upptäck ShadowSlayers','Explore ShadowSlayers')} <span>↗</span></span>
          </a>
        </div>
      </section>
    </main>
    <footer className="hub-footer"><span>© {new Date().getFullYear()} Wolfyslayer</span><span>{tr('Digitala projekt, samlade på ett ställe.','Digital projects, all in one place.')}</span><a href="mailto:contact@wolfyslayer.online">contact@wolfyslayer.online</a></footer>
  </div>
}
