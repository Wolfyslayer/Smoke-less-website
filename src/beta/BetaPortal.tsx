import { useEffect, useState } from 'react'
import { SiteNavigation } from '../SiteNavigation'
import { useSiteAuth } from '../auth/SiteAuthProvider'
import { useSiteLocale } from '../SiteLocale'
import { accountLink } from '../auth/returnTo'
import { supabase } from './client'
import { useBetaAccess } from './useBetaAccess'
import type { BetaApplication, BetaStatus } from './useBetaAccess'
import './beta.css'

type Settings = {mode: 'closed'|'beta'|'release'; public_release_approved:boolean; active_artifact_id:string|null}
type Artifact = {id:string; version:string; version_code:number; status:string; sha256:string}
const statuses:BetaStatus[]=['approved','rejected','revoked']

export default function BetaPortal({adminOnly=false}:{adminOnly?:boolean}) {
  const {user,loading:authLoading}=useSiteAuth()
  const {tr,language}=useSiteLocale()
  const access=useBetaAccess(user?.id)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [applications,setApplications]=useState<BetaApplication[]>([])
  const [settings,setSettings]=useState<Settings|null>(null)
  const [artifacts,setArtifacts]=useState<Artifact[]>([])
  const [adminLoading,setAdminLoading]=useState(false)
  const [refreshKey,setRefreshKey]=useState(0)

  useEffect(()=>{
    document.title=(adminOnly?tr('Administration','Administration'):tr('Betaprogram','Beta programme'))+' – Smoke Less'
    document.documentElement.lang=language
  },[adminOnly,language,tr])

  useEffect(()=>{
    let active=true
    setApplications([]);setSettings(null);setArtifacts([])
    if(!adminOnly||!user||!access.configured||!access.admin){setAdminLoading(false);return}
    setAdminLoading(true)
    void Promise.all([
      supabase.from('beta_applications').select('user_id,status,message,created_at').order('created_at',{ascending:false}),
      supabase.from('beta_settings').select('mode,public_release_approved,active_artifact_id').eq('singleton',true).single(),
      supabase.from('beta_artifacts').select('id,version,version_code,status,sha256').order('version_code',{ascending:false})
    ]).then(([apps,config,releases])=>{
      if(!active)return
      if(apps.error||config.error||releases.error)throw Error('Could not read beta admin resources')
      setApplications((apps.data??[]) as BetaApplication[])
      setSettings(config.data as Settings)
      setArtifacts((releases.data??[]) as Artifact[])
    }).catch(()=>{if(active)setError(tr('Kunde inte hämta administrationsuppgifter.','Unable to load administration data.'))})
      .finally(()=>{if(active)setAdminLoading(false)})
    return()=>{active=false}
  },[adminOnly,user?.id,access.configured,access.admin,refreshKey])

  const refresh=()=>{access.refresh();setRefreshKey(v=>v+1)}
  async function apply() {
    if(!user||!access.configured||access.mode!=='beta'||access.application||busy)return
    setBusy(true);setError('')
    const {error:dbError}=await supabase.from('beta_applications').insert({user_id:user.id,status:'pending'})
    if(dbError)setError(tr('Kunde inte skicka ansökan.','Unable to submit application.'))
    else refresh()
    setBusy(false)
  }
  async function review(id:string,status:BetaStatus) {
    if(!user||!access.admin||busy||!statuses.includes(status))return
    setBusy(true);setError('')
    const {error:dbError}=await supabase.from('beta_applications').update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq('user_id',id)
    if(dbError)setError(tr('Kunde inte uppdatera ansökan.','Unable to update application.'))
    else refresh()
    setBusy(false)
  }
  async function setMode(mode:'closed'|'beta') {
    if(!user||!access.admin||busy||!settings)return
    setBusy(true);setError('')
    const {error:dbError}=await supabase.from('beta_settings').update({mode,updated_at:new Date().toISOString()}).eq('singleton',true)
    if(dbError)setError(tr('Kunde inte ändra läge.','Unable to change mode.'))
    else refresh()
    setBusy(false)
  }
  const statusLabels={
    pending:tr('Väntar på godkännande','Pending review'),
    approved:tr('Godkänd','Approved'),
    rejected:tr('Nekad','Declined'),
    revoked:tr('Återkallad','Revoked')
  }
  const loading=authLoading||access.loading
  return <div className="wolf-beta">
    <a className="wolf-auth-skip" href="#beta-main">{tr('Hoppa till innehållet','Skip to content')}</a>
    <SiteNavigation section="smoke"/>
    <main className="wolf-beta-main" id="beta-main">
      <a className="wolf-beta-back" href="/smoke-less/">{tr('← Till Smoke Less','← Back to Smoke Less')}</a>
      <span className="wolf-beta-kicker">SMOKE LESS / {adminOnly?'ADMIN':'BETA'}</span>
      <h1>{adminOnly?tr('Administration','Administration'):tr('Betaprogrammet','Beta programme')}</h1>
      <p className="wolf-beta-lead">{adminOnly?tr('Hantera betatestare och portalens åtkomst. Alla ändringar verifieras i Supabase.','Manage testers and portal access. Every change is checked in Supabase.'):tr('Testa Smoke Less före lansering. Deltagande kräver uttryckligt godkännande.','Test Smoke Less before release. Participation requires explicit approval.')}</p>
      {loading?<section className="wolf-beta-panel"><p role="status">{tr('Kontrollerar behörigheter…','Checking permissions…')}</p></section>:
       !user?<section className="wolf-beta-panel">
         <h2>{tr('Logga in med ditt Wolfyslayer-konto','Sign in with your Wolfyslayer account')}</h2>
         <p>{tr('Samma konto fungerar på alla tre webbplatser.','The same account works on all three websites.')}</p>
         <a className="wolf-beta-button" href={accountLink(adminOnly?'/smoke-less/admin/':'/smoke-less/beta/','smoke')}>{tr('Logga in eller skapa konto','Sign in or create account')}</a>
       </section>:
       !access.configured?<section className="wolf-beta-panel">
         <h2>{tr('Betaportalen är inte tillgänglig','Beta portal unavailable')}</h2>
         <p role="alert">{tr('Supabase behöver konfigureras eller kan inte nås. Åtkomsten förblir stängd.','Supabase needs configuration or is unreachable. Access remains closed.')}</p>
       </section>:
       adminOnly?(!access.admin?<section className="wolf-beta-panel"><h2>{tr('Åtkomst nekad','Access denied')}</h2><p role="alert">{tr('Kontot saknar verifierad administratörsbehörighet.','This account has no verified administrator permission.')}</p></section>:
       <section className="wolf-beta-panel">
         <h2>{tr('Betaportalen','Beta portal')}</h2>
         {adminLoading?<p role="status">{tr('Hämtar uppgifter…','Loading records…')}</p>:settings?<><p>{tr('Nuvarande läge','Current mode')}: <strong>{settings.mode}</strong></p>
          <div className="wolf-beta-actions"><button disabled={busy||settings.mode==='closed'} onClick={()=>void setMode('closed')}>{tr('Stängd','Closed')}</button><button disabled={busy||settings.mode==='beta'} onClick={()=>void setMode('beta')}>{tr('Betatestning','Beta testing')}</button></div>
          <p className="wolf-beta-note">{tr('Offentlig release är serverlåst tills separat säkerhetsgranskning är klar.','Public release remains server-locked until separate security review.')}</p>
          <h3>{tr('Ansökningar','Applications')} ({applications.length})</h3>
          {applications.length===0?<p>{tr('Inga ansökningar.','No applications.')}</p>:applications.map(a=><div className="wolf-beta-entry" key={a.user_id}><strong>{a.user_id}</strong><p>{statusLabels[a.status]}</p><div className="wolf-beta-actions">
            <button disabled={busy||a.status==='approved'} onClick={()=>void review(a.user_id,'approved')}>{tr('Godkänn','Approve')}</button>
            <button disabled={busy||a.status==='rejected'} onClick={()=>void review(a.user_id,'rejected')}>{tr('Neka','Decline')}</button>
            <button disabled={busy||a.status==='revoked'} onClick={()=>void review(a.user_id,'revoked')}>{tr('Återkalla','Revoke')}</button>
          </div></div>)}
          <h3>{tr('APK-kandidater','APK candidates')} ({artifacts.length})</h3>
          <p className="wolf-beta-note">{tr('Privat uppladdning och godkänd nedladdning är ännu inte aktiverade.','Private upload and authorised downloads are not enabled yet.')}</p>
          {artifacts.map(a=><p key={a.id}>{a.version} · #{a.version_code} · {a.status}</p>)}
         </>:<p role="status">{tr('Administrationsdata kan inte hämtas.','Administration data unavailable.')}</p>}
       </section>):
       <section className="wolf-beta-panel">
         <h2>{tr('Din ansökan','Your application')}</h2>
         <p>{tr('Betaprogrammets läge','Programme mode')}: <strong>{access.mode==='beta'?tr('Öppet för ansökningar','Accepting applications'):access.mode==='release'?tr('Release (låst)','Release (locked)'):tr('Stängt','Closed')}</strong></p>
         {access.application?<p role="status">{tr('Status','Status')}: <strong>{statusLabels[access.application.status]}</strong></p>:
          access.mode==='beta'?<button className="wolf-beta-button" type="button" onClick={()=>void apply()} disabled={busy}>{busy?tr('Skickar…','Submitting…'):tr('Ansök om betatestning','Apply for beta testing')}</button>:
          <p>{tr('Det går inte att skicka en ansökan just nu.','Applications are currently unavailable.')}</p>}
         {access.application?.status==='approved'&&<p className="wolf-beta-note">{tr('Du har godkänd betaåtkomst. En säker APK-nedladdning öppnas först efter separat verifiering.','Your beta access is approved. Secure APK downloads will only open after separate verification.')}</p>}
         <a className="wolf-beta-inline" href="/smoke-less/account/">{tr('Se betastatus på mitt konto →','View beta status on my account →')}</a>
       </section>}
      {error&&<p className="wolf-beta-error" role="alert">{error}</p>}
      <p className="wolf-beta-note">{tr('Ingen privat eller offentlig APK-nedladdning aktiveras av denna sida.','This page does not enable private or public APK downloads.')}</p>
    </main>
  </div>
}
