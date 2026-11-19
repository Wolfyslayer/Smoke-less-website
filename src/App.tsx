import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import ResponsiveHeader from './components/ResponsiveHeader'
import { usePreferences, useTranslate } from './i18n'

type Manifest = { available?: boolean; version?: string|null; versionCode?: number|null; runtimeVersion?: string|null; packageName?: string|null; downloadUrl?: string|null; sha256?: string|null; publishedAt?: string|null; releaseNotes?: string|null }
function Reveal({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  const reduced=useReducedMotion()
  return <motion.div initial={reduced?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.16}} transition={{duration:reduced?0:.65,delay:reduced?0:delay,ease:[.2,.8,.2,1]}}>{children}</motion.div>
}
function ProgressPreview() {
  const t=useTranslate(),reduced=useReducedMotion()
  const [screen,setScreen]=useState<'home'|'plan'|'sos'>('home')
  const [theme,setTheme]=useState<'dark'|'light'>('dark')
  const [breathing,setBreathing]=useState(false)
  useEffect(()=>{if(screen!=='sos')setBreathing(false)},[screen])
  const screens=[{id:'home' as const,label:t('Hem','Home')},{id:'plan' as const,label:t('Plan','Plan')},{id:'sos' as const,label:'SOS'}]
  return <div className="preview-showcase">
    <div className="preview-toolbar"><div className="preview-switcher" role="group" aria-label={t('Välj appskärm','Choose app screen')}>{screens.map(item=><button key={item.id} type="button" className={screen===item.id?'selected':''} aria-pressed={screen===item.id} onClick={()=>setScreen(item.id)}>{item.label}</button>)}</div>
      <button type="button" className="preview-theme" onClick={()=>setTheme(current=>current==='dark'?'light':'dark')} aria-label={theme==='dark'?t('Visa ljust tema','Show light theme'):t('Visa mörkt tema','Show dark theme')}>{theme==='dark'?t('☀ Ljust','☀ Light'):t('☾ Mörkt','☾ Dark')}</button></div>
    <motion.div className={'phone app-phone modern-preview '+theme} role="region" aria-label={t('Interaktiv förhandsvisning av Smoke Less','Interactive Smoke Less preview')} whileHover={reduced?undefined:{y:-4}} transition={{duration:reduced?0:.3}}>
      <div className="modern-scene" aria-hidden="true"><span className="scene-sun"/><span className="scene-hill one"/><span className="scene-hill two"/><span className="scene-leaf">❧</span></div>
      <div className="modern-content"><div className="modern-brand"><span>✳ Smoke Less</span><span>●</span></div>
      <AnimatePresence mode="wait" initial={false}><motion.div key={screen} initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={reduced?undefined:{opacity:0,y:-10}} transition={{duration:reduced?0:.25}}>
      {screen==='home'?<>
        <h3 className="modern-heading">{t('Din resa, i din takt','Your journey, your pace')}</h3>
        <div className="modern-card modern-goal"><p className="modern-kicker">{t('DAGENS FRAMSTEG','TODAY’S PROGRESS')}</p><div className="modern-goal-main">
          <div className="modern-ring" role="img" aria-label={t('Exempel: sex cigaretter kvar av tio i dagsmålet','Example: six cigarettes remaining out of a daily target of ten')}>
            <svg viewBox="0 0 112 112" aria-hidden="true"><circle cx="56" cy="56" r="45" className="ring-track"/><motion.circle cx="56" cy="56" r="45" className="ring-fill" initial={reduced?{pathLength:.4}:{pathLength:0}} whileInView={{pathLength:.4}} viewport={{once:true}} transition={{duration:reduced?0:1.2}} transform="rotate(-90 56 56)"/></svg>
            <div><b>6</b><small>{t('kvar','left')}</small></div>
          </div>
          <div className="modern-stats"><span>{t('Registrerade idag','Logged today')} <b>4</b></span><span>{t('Dagens mål','Daily target')} <b>10</b></span><small>{t('40 % av dagsmålet använt','40% of daily allowance used')}</small></div>
        </div></div>
        <div className="modern-summary"><strong>{t('Din överblick','Your overview')}</strong><span>{t('Exempelvy','Example')}</span></div>
        <div className="modern-metrics"><div><b>2 h</b><small>{t('Sedan senaste registrering','Since last log')}</small></div><div><b>25 kr</b><small>{t('Uppskattat sparat','Estimated savings')}</small></div><div><b>0</b><small>{t('Röksug idag','Cravings today')}</small></div></div>
        <div className="modern-actions"><div><strong>⊕ {t('Registrera','Log')}</strong><small>{t('Öppna registreringen','Open logging')}</small></div><div><strong>♡ SOS</strong><small>{t('Andning och stöd direkt','Breathing and support')}</small></div></div>
      </>:screen==='plan'?<>
        <h3 className="modern-heading">{t('Min plan','My plan')}</h3>
        <div className="modern-card"><p className="modern-kicker">{t('DAGENS MÅL','TODAY’S TARGET')}</p><strong className="modern-big">10</strong><p className="modern-muted">{t('cigaretter per dag · exempelvärde','cigarettes per day · sample data')}</p></div>
        <div className="modern-card"><p className="modern-kicker">{t('DIN NEDTRAPPNING','YOUR REDUCTION PLAN')}</p><h4>{t('Balanserad takt','Balanced pace')}</h4><p className="modern-muted">{t('Följ dina delmål och anpassa takten efter behov.','Follow milestones and adjust the pace as needed.')}</p><div className="modern-plan-track"><span/></div></div>
        <div className="modern-card"><p className="modern-kicker">{t('NÄSTA STEG','NEXT STEP')}</p><h4>{t('Fortsätt i din takt','Continue at your own pace')}</h4><p className="modern-muted">{t('Dina tidigare registreringar bevaras.','Your previous logs are preserved.')}</p></div>
      </>:<>
        <h3 className="modern-heading">{t('Ge suget en paus.','Give your craving a pause.')}</h3>
        <div className="modern-card modern-sos"><p className="modern-kicker">{t('TA ETT ANDETAG I TAGET','ONE BREATH AT A TIME')}</p>
          <motion.div className="modern-breathe" animate={breathing&&!reduced?{scale:[1,1.1,1.1,1]}:{scale:1}} transition={breathing&&!reduced?{duration:12,times:[0,4/12,6/12,1],repeat:Infinity,ease:'easeInOut'}:{duration:0}}><span>≋</span><strong>{t('Hitta ditt lugn','Find your calm')}</strong><small>{t('4 in · 2 håll · 6 ut','4 in · 2 hold · 6 out')}</small></motion.div>
          <div className="modern-breath-steps"><span>01<br/>{t('Andas in','Inhale')}<br/>4 {t('sek','sec')}</span><span>02<br/>{t('Håll','Hold')}<br/>2 {t('sek','sec')}</span><span>03<br/>{t('Andas ut','Exhale')}<br/>6 {t('sek','sec')}</span></div>
          <p className="modern-muted">{t('Du behöver inte bestämma något just nu.','You do not need to decide anything right now.')}</p><button type="button" className="modern-breathe-button" aria-pressed={breathing} aria-label={breathing?t('Avsluta visuell andningsanimation','Stop visual breathing animation'):t('Starta visuell andningsanimation','Start visual breathing animation')} onClick={()=>setBreathing(value=>!value)}>{breathing?t('Avsluta övning','End exercise'):t('Starta andningsövning','Start breathing exercise')}</button>
        </div>
      </>}
      </motion.div></AnimatePresence><p className="mock-note">{t('Förenklad designrekonstruktion från PR #184 · exempeldata · inga uppgifter sparas','Simplified design reconstruction from PR #184 · sample data · nothing saved')}</p></div>
    </motion.div>
  </div>
}
function Home() {
  const t=useTranslate()
  const features=[
    {icon:'◎',sv:'Din egen plan',en:'Your own plan',svDesc:'Välj en takt som passar dig och följ dina mål över tid.',enDesc:'Choose a pace that suits you and track your goals.'},
    {icon:'◷',sv:'Se dina framsteg',en:'See your progress',svDesc:'Följ registreringar, statistik och utveckling i en tydlig översikt.',enDesc:'Track logs, statistics and progress in a clear overview.'},
    {icon:'♡',sv:'Stöd när det behövs',en:'Support when you need it',svDesc:'Andningsövningar och SOS-stöd när röksuget kommer.',enDesc:'Breathing exercises and SOS support when a craving hits.'},
    {icon:'↗',sv:'Synk mellan enheter',en:'Sync across devices',svDesc:'Med konto kan du synkronisera dina framsteg mellan enheter.',enDesc:'With an account, you can sync progress between devices.'}
  ]
  return <>
    <section className="hero wrap"><div className="hero-copy"><Reveal><span className="eyebrow">{t('DIN RESA, I DIN TAKT','YOUR JOURNEY, YOUR PACE')}</span><h1>{t('Små steg.','Small steps.')}<br/><em>{t('Stor förändring.','Big change.')}</em></h1>
      <p className="lead">{t('En lugnare och tydligare väg mot ett rökfritt liv. Följ din utveckling, hitta stöd när röksuget kommer och bygg vanor som håller.','A calmer, clearer path towards a smoke-free life. Track your progress, find support when cravings strike and build lasting habits.')}</p>
      <div className="button-row"><Link className="button primary" to="/download">{t('Utforska Preview','Explore preview')} <span aria-hidden="true">↗</span></Link><a className="button outline" href="#funktioner">{t('Se funktionerna','Explore features')}</a></div><p className="fineprint">{t('Android · Preview-version under utveckling','Android · Preview under development')}</p>
    </Reveal></div><Reveal delay={.2}><ProgressPreview/></Reveal></section>
    <section id="funktioner" className="section wrap"><Reveal><span className="eyebrow">{t('BYGGD FÖR VARDAGEN','BUILT FOR EVERYDAY LIFE')}</span><h2>{t('Allt du behöver för att fortsätta','Everything you need to keep going')}</h2></Reveal>
      <div className="feature-grid">{features.map((feature,i)=><Reveal key={feature.sv} delay={i*.07}><article className="feature-card"><span className="feature-icon" aria-hidden="true">{feature.icon}</span><h3>{t(feature.sv,feature.en)}</h3><p>{t(feature.svDesc,feature.enDesc)}</p></article></Reveal>)}</div></section>
    <section className="wrap section"><Reveal><div className="cta"><div><span className="eyebrow">{t('BÖRJA NÄR DU ÄR REDO','START WHEN YOU ARE READY')}</span><h2>{t('En förändring som börjar med dig.','A change that starts with you.')}</h2><p>{t('Upptäck Smoke Less för Android och följ utvecklingen av appen.','Discover Smoke Less for Android and follow its development.')}</p></div><Link className="button primary" to="/download">{t('Till nedladdning ↗','Go to downloads ↗')}</Link></div></Reveal></section>
  </>
}
function Download() {
  const t=useTranslate(),{lang}=usePreferences()
  const [state,setState]=useState<'loading'|'none'|'available'|'error'>('loading')
  const [manifest,setManifest]=useState<Manifest|null>(null)
  const [retry,setRetry]=useState(0)
  useEffect(()=>{
    const controller=new AbortController()
    setState('loading')
    fetch('/updates/preview.json',{cache:'no-store',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json() as Promise<Manifest>})
      .then(m=>{
        setManifest(m)
        const valid=m.available===true&&typeof m.version==='string'&&m.version.trim().length>0&&Number.isInteger(m.versionCode)&&Number(m.versionCode)>0&&m.packageName==='com.smokeless.app.preview'&&typeof m.sha256==='string'&&/^[a-f0-9]{64}$/i.test(m.sha256)&&typeof m.downloadUrl==='string'&&/^https:\/\/github\.com\/Wolfyslayer\/Smoke-less-app\/releases\/download\/[^/?#]+\/[^/?#]+\.apk$/i.test(m.downloadUrl)
        setState(valid?'available':'none')
      }).catch(e=>{if(e.name!=='AbortError')setState('error')})
    return()=>controller.abort()
  },[retry])
  const date=manifest?.publishedAt&&Number.isFinite(Date.parse(manifest.publishedAt))?new Date(manifest.publishedAt).toLocaleDateString(lang==='sv'?'sv-SE':'en-GB',{year:'numeric',month:'long',day:'numeric'}):null
  return <Page eyebrow="ANDROID PREVIEW" title={t('Ladda ner Smoke Less','Download Smoke Less')}>
    <p className="lead">{t('Här hittar du verifierade Preview-versioner för Android. Appen utvecklas fortfarande och är inte en färdig produktionsrelease.','This is where verified preview versions for Android are published. The app is still being developed and is not a production release.')}</p>
    <div className="panel download-panel">
      <div className="download-panel-heading"><h2>{t('Senaste Preview-versionen','Latest preview release')}</h2><span className="download-status" role="status" aria-live="polite">{state==='loading'?t('Kontrollerar…','Checking…'):state==='available'?t('Tillgänglig','Available'):state==='none'?t('Inte publicerad','Not published'):t('Kunde inte kontrolleras','Unable to verify')}</span></div>
      <p>{state==='loading'?t('Hämtar publiceringsstatus…','Checking publication status…'):state==='none'?t('Ingen verifierad Preview-APK är publicerad via webbplatsen ännu.','No verified preview APK is published through the website yet.'):state==='error'?t('Versionsinformationen kunde inte hämtas. Kontrollera anslutningen och försök igen.','Release information could not be loaded. Check your connection and try again.'):t('Smoke Less Preview ','Smoke Less Preview ')+manifest?.version+t(' är tillgänglig för Android.',' is available for Android.')}</p>
      {state==='error'&&<button className="button outline" type="button" onClick={()=>setRetry(value=>value+1)}>{t('Försök igen','Try again')}</button>}
      {state==='available'&&manifest?.downloadUrl&&<><dl className="download-facts"><div><dt>{t('Version','Version')}</dt><dd>{manifest.version}</dd></div><div><dt>{t('Versionskod','Version code')}</dt><dd>{manifest.versionCode}</dd></div>{manifest.runtimeVersion&&<div><dt>Runtime</dt><dd>{manifest.runtimeVersion}</dd></div>}{date&&<div><dt>{t('Publicerad','Published')}</dt><dd>{date}</dd></div>}<div><dt>{t('Android-paket','Android package')}</dt><dd>{manifest.packageName}</dd></div></dl>
      <a className="button primary" href={manifest.downloadUrl} rel="noopener noreferrer" target="_blank">{t('Ladda ner Preview-APK ↗','Download preview APK ↗')}</a>
      <details className="download-checksum"><summary>{t('Verifiera APK-filens SHA-256','Verify APK SHA-256 checksum')}</summary><code>{manifest.sha256}</code><p className="fineprint">{t('Jämför kontrollsumman med den nedladdade filen innan installation.','Compare this checksum against your downloaded file before installing.')}</p></details>
      {manifest.releaseNotes&&<div className="download-notes"><h3>{t('Om versionen','Release notes')}</h3><p>{manifest.releaseNotes}</p></div>}</>}
      <p className="fineprint">{t('Nedladdningslänken visas endast när webbplatsens publiceringsmanifest innehåller en giltig Preview-version och GitHub Releases-länk. Android kan be dig godkänna installation.','A download link is shown only when the release manifest contains a valid preview version and GitHub Releases URL. Android may ask you to approve installation.')}</p>
    </div>
    <div className="download-help"><section className="panel"><h2>{t('Så installerar du','How to install')}</h2><ol><li>{t('Ladda ner den verifierade APK-filen när den finns tillgänglig.','Download the verified APK when it becomes available.')}</li><li>{t('Öppna filen på din Android-telefon.','Open the file on your Android phone.')}</li><li>{t('Följ Androids installationsanvisningar. Godkänn endast en källa du litar på.','Follow Android’s installation prompts. Only approve sources you trust.')}</li></ol></section><section className="panel"><h2>{t('Innan du testar','Before testing')}</h2>
      <p>{t('Preview kan innehålla fel. Gästhistorik finns lokalt på enheten och kan gå förlorad vid ominstallation eller byte av telefon. Ett konto ger möjlighet till synkronisering.','Preview builds may contain bugs. Guest history is stored locally and can be lost after reinstalling or changing devices. An account enables syncing.')}</p><p>{t('Den separata Preview-appen använder paketnamnet','The separate preview app uses package name')} <code>com.smokeless.app.preview</code>.</p></section></div>
    <Link className="text-link" to="/changelog">{t('Visa versionshistorik →','See release history →')}</Link>
  </Page>
}
function Support() {
  const t=useTranslate()
  return <Page eyebrow={t('HJÄLP & SUPPORT','HELP & SUPPORT')} title={t('Vi hjälper dig vidare','We are here to help')}>
    <p className="lead">{t('Här samlar vi vanliga frågor och information om Smoke Less.','Frequently asked questions and information about Smoke Less.')}</p>
    <div className="panel"><h2>{t('Vanliga frågor','Frequently asked questions')}</h2>
      <details><summary>{t('Kan jag använda appen utan konto?','Can I use the app without an account?')}</summary><p>{t('Ja. Gästuppgifter lagras lokalt och kan försvinna om appen avinstalleras eller du byter enhet.','Yes. Guest data is stored locally and may disappear if you uninstall the app or change devices.')}</p></details>
      <details><summary>{t('Hur fungerar synkronisering?','How does syncing work?')}</summary><p>{t('Med ett konto kan appen synkronisera framsteg mellan enheter.','With an account, the app can sync progress across devices.')}</p></details>
      <details><summary>{t('Var hämtar jag uppdateringar?','Where can I download updates?')}</summary><p>{t('På ','On the ')}<Link to="/download">{t('nedladdningssidan','download page')}</Link>{t(' visas verifierade Preview-versioner.',' you can find verified preview versions.')}</p></details>
    </div>
    <div className="panel"><h2>{t('Kontakt och kontoradering','Contact and account deletion')}</h2>
      <p>{t('Kontakta oss på','Contact us at')} <a href="mailto:contact@wolfyslayer.online">contact@wolfyslayer.online</a> {t('för frågor om appen eller om du behöver hjälp med ditt konto. För inloggade konton finns en serverbaserad raderingsfunktion i appens källkod, men den är ännu inte verifierad som driftsatt eller tillgänglig i appen. Du kan kontakta support för att få hjälp med en begäran om radering; ett mejl innebär inte att kontot automatiskt raderas.','for questions about the app or assistance with your account. A server-side deletion function exists in the app’s source code but has not been verified as deployed or available in the app. Contact support to request deletion; sending an email does not automatically delete your account.')}</p>
      <p>{t('I gästläge kan du radera lokal gästhistorik i appens historikinställningar. Det påverkar inte eventuella uppgifter i ett inloggat konto. Under tiden finns information om hur uppgifter hanteras på','In guest mode you can delete local guest history through the app’s history settings. This does not affect any data associated with a signed-in account. You can find more information on the')} <Link to="/privacy">{t('integritetssidan','privacy page')}</Link>. {t('Skicka inte känsliga hälsouppgifter via osäkra kontaktkanaler.','Do not send sensitive health information over insecure channels.')}</p>
    </div>
  </Page>
}
function Privacy() {
  const t=useTranslate()
  return <Page eyebrow={t('INTEGRITET','PRIVACY')} title={t('Din integritet är viktig','Your privacy matters')}>
    <div className="panel"><strong>{t('Information under färdigställande','Information being finalized')}</strong><p>{t('Den fullständiga integritetspolicyn är ännu inte godkänd för publicering. Den här sidan ersätter inte en färdig integritetspolicy.','The full privacy policy has not yet been approved for publication. This page is not a substitute for a complete privacy policy.')}</p></div>
    <h2>{t('Vilka uppgifter hanteras?','What data is processed?')}</h2><p>{t('Smoke Less kan hantera uppgifter om rökvanor, mål och framsteg. Dessa kan vara hälsorelaterade och behöver skyddas noggrant.','Smoke Less may process smoking habits, goals and progress. Such information may be health-related and requires careful protection.')}</p>
    <h2>{t('Gästläge och konto','Guest mode and account')}</h2><p>{t('Gästuppgifter lagras lokalt på enheten. Vid konto används Firebase Authentication för inloggning och Firestore för synkronisering av bland annat plan, registreringar, röksug och avstämningar. Appen har stöd för inloggning med e-post och Google. Inga molnuppgifter ska blandas mellan olika användarkonton.','Guest data is stored locally on your device. For accounts, Firebase Authentication handles sign-in and Firestore syncs data such as plans, logs, cravings and check-ins. Email and Google sign-in are supported. Cloud data must not be mixed between user accounts.')}</p>
    <h2>{t('Radering och dina val','Deletion and your choices')}</h2><p>{t('Gästhistorik kan raderas lokalt från appen. För konton finns kod för en serverstyrd raderingsprocess som först rensar kända Firestore-samlingar och därefter tar bort inloggningskontot. Funktionen är ännu inte verifierad som driftsatt och får inte betraktas som en aktiv självbetjäningstjänst.','Guest history can be deleted locally in the app. For accounts, code exists for a server-controlled deletion process that clears known Firestore collections before deleting the authentication account. This feature is not verified as deployed and must not be described as an active self-service option.')}</p>
    <p>{t('För frågor eller begäran om radering, kontakta','For questions or deletion requests, contact')} <a href="mailto:contact@wolfyslayer.online">contact@wolfyslayer.online</a>. {t('Skicka inte lösenord eller detaljerad hälsodata via mejl. Vi kan behöva verifiera att du äger kontot innan en begäran hanteras.','Do not email passwords or detailed health information. We may need to verify account ownership before processing your request.')}</p>
    <h2>{t('Innan lansering','Before launch')}</h2><p>{t('Fullständig information om personuppgiftsansvarig, kontakt, ändamål och rättslig grund, mottagare, lagringstider, rättigheter och radering måste granskas och publiceras. Vi anger inga obekräftade uppgifter här.','Full information about the controller, contact details, purposes and lawful basis, recipients, retention, user rights and deletion must be reviewed and published. We do not present unverified claims here.')}</p>
    <p>{t('För frågor om integritet kan du kontakta','For privacy questions, contact')} <a href="mailto:contact@wolfyslayer.online">contact@wolfyslayer.online</a> {t('eller läsa','or read the')} <Link to="/support">{t('supportinformationen','support information')}</Link>. {t('Denna sida är ännu inte en fullständig integritetspolicy.','This is not yet a complete privacy policy.')}</p>
  </Page>
}
function Changelog() {
  const t=useTranslate()
  return <Page eyebrow={t('UTVECKLING','DEVELOPMENT')} title={t('Versionshistorik','Release history')}>
    <p className="lead">{t('Här visas verifierade Preview-versioner och ändringshistorik när distributionssystemet är färdigt.','Verified preview releases and release history will appear here when the distribution system is ready.')}</p>
    <div className="panel"><h2>{t('Första offentliga Preview-versionen','First public preview release')}</h2><p>{t('Ännu inte publicerad via det nya distributionssystemet.','Not yet published through the new distribution system.')}</p><Link to="/download">{t('Se tillgängliga versioner →','See available versions →')}</Link></div>
  </Page>
}
function Page({eyebrow,title,children}:{eyebrow:string;title:string;children:React.ReactNode}) {
  return <main id="main-content" className="content wrap"><Reveal><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children}</Reveal></main>
}
function Shell() {
  const location=useLocation(),reduced=useReducedMotion(),{lang}=usePreferences(),t=useTranslate()
  const pageTitles:Record<string,string>=lang==='sv'
    ?{'/':'Små steg. Stor förändring.','/download':'Ladda ner','/support':'Support','/privacy':'Integritet','/changelog':'Versionshistorik'}
    :{'/':'Small steps. Big change.','/download':'Download','/support':'Support','/privacy':'Privacy','/changelog':'Release history'}
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'instant'})
    document.title=(pageTitles[location.pathname]??t('Sidan hittades inte','Page not found'))+' – Smoke Less'
    const main=document.getElementById('main-content')
    if(main){main.setAttribute('tabindex','-1');main.focus({preventScroll:true})}
  },[location.pathname,lang])
  return <><a className="skip-link" href="#main-content">{t('Hoppa till innehållet','Skip to content')}</a><ResponsiveHeader location={location.pathname}/>
    <AnimatePresence mode="wait" initial={false}><motion.div key={location.pathname} initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={reduced?undefined:{opacity:0,y:-8}} transition={{duration:.25}}>
      {location.pathname==='/'?<main id="main-content"><Home/></main>:<Routes location={location}>
        <Route path="/download" element={<Download/>}/><Route path="/support" element={<Support/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="/changelog" element={<Changelog/>}/>
        <Route path="*" element={<Page eyebrow="404" title={t('Sidan hittades inte','Page not found')}><Link to="/">{t('Tillbaka till startsidan →','Back to home →')}</Link></Page>}/>
      </Routes>}
    </motion.div></AnimatePresence>
    <footer className="site-footer wrap"><span>© {new Date().getFullYear()} Smoke Less · <a href="/">{t('Alla projekt','All projects')}</a></span><div><Link to="/privacy">{t('Integritet','Privacy')}</Link><Link to="/support">{t('Support','Support')}</Link><Link to="/changelog">{t('Versioner','Releases')}</Link></div></footer>
  </>
}
export default function App(){return <Shell/>}
