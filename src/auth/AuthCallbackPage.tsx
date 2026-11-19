import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { SiteNavigation } from '../SiteNavigation'
import { useSiteLocale } from '../SiteLocale'
import { supabase } from './client'
import { safeReturnTo } from './returnTo'
import './auth.css'

export default function AuthCallbackPage({purpose}:{purpose:'signup'|'recovery'}){
  const {tr,language}=useSiteLocale()
  const [status,setStatus]=useState<'checking'|'success'|'failure'>('checking')
  const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [resume]=useState(()=>{try{return safeReturnTo(sessionStorage.getItem('wolfyslayer:auth-return-to'))}catch{return null}})
  const [accountHome]=useState(()=>{try{const path=sessionStorage.getItem('wolfyslayer:auth-account-home');return path==='/vape-calculator/account/'||path==='/smoke-less/account/'?path:'/account/'}catch{return '/account/'}})
  const verification=useRef<Promise<boolean>|null>(null)
  const [verified,setVerified]=useState(false)
  useEffect(()=>{document.title=tr('Verifiera konto – Wolfyslayer','Verify account – Wolfyslayer');document.documentElement.lang=language},[language,tr])
  useEffect(()=>{
    // Run verification exactly once even when React StrictMode remounts effects.
    // Later effect passes subscribe to the same pending promise.
    if (!verification.current) {
      const params=new URLSearchParams(window.location.search)
      const token_hash=params.get('token_hash')
      const type=params.get('type')
      window.history.replaceState(window.history.state,'',window.location.pathname)
      verification.current=token_hash && type===purpose
        ? supabase.auth.verifyOtp({token_hash,type:purpose}).then(({error})=>!error).catch(()=>false)
        : Promise.resolve(false)
    }
    let active=true
    void verification.current.then(ok=>{
      if(active){setStatus(ok?'success':'failure');setVerified(ok)}
    })
    return()=>{active=false}
  },[purpose])
  async function updatePassword(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    if(!verified||busy)return
    if(password.length<8||!/[a-z]/.test(password)||!/[A-Z]/.test(password)||!/\d/.test(password)||!/[^A-Za-z0-9]/.test(password)||password!==confirm){
      setMessage(tr('Välj minst 8 tecken med stor/liten bokstav, siffra och specialtecken. Lösenorden måste matcha.','Use at least 8 characters with upper/lowercase, a number and symbol. Passwords must match.'));return
    }
    setBusy(true);setMessage('')
    try{
      const {error}=await supabase.auth.updateUser({password})
      if(error)throw error
      await supabase.auth.signOut()
      setVerified(false);setPassword('');setConfirm('')
      setMessage(tr('Lösenordet är uppdaterat. Logga in igen.','Your password was updated. Sign in again.'))
    }catch{setMessage(tr('Kunde inte ändra lösenordet. Begär en ny återställningslänk.','Unable to update the password. Request a new reset link.'))}
    finally{setBusy(false)}
  }
  return <div className="wolf-account">
    <SiteNavigation section="hub"/>
    <main id="auth-main" className="wolf-auth-wrap">
      <a className="wolf-auth-back" href={accountHome}>{tr('← Till kontot','← Back to account')}</a>
      <div className="wolf-auth-heading"><span className="wolf-auth-eyebrow">WOLFYSLAYER · SUPABASE</span><h1>{purpose==='recovery'?tr('Återställ lösenordet','Reset your password'):tr('Bekräfta din e-post','Confirm your email')}</h1></div>
      <section className="wolf-auth-card">
        {status==='checking'?<p role="status">{tr('Verifierar din engångslänk…','Verifying your one-time link…')}</p>:status==='failure'?<p role="alert">{tr('Länken är ogiltig eller har gått ut. Begär en ny från kontosidan.','The link is invalid or expired. Request a new one from the account page.')}</p>:purpose==='signup'?<p role="status">{tr('E-posten är verifierad. Du kan nu gå till ditt konto.','Email verified. You can now access your account.')}</p>:verified?<form className="wolf-auth-form" onSubmit={e=>void updatePassword(e)}>
          <label htmlFor="reset-password">{tr('Nytt lösenord','New password')}</label>
          <input id="reset-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/>
          <label htmlFor="reset-confirm">{tr('Upprepa lösenord','Confirm password')}</label>
          <input id="reset-confirm" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)}/>
          <button className="wolf-auth-submit" type="submit" disabled={busy}>{busy?tr('Sparar…','Saving…'):tr('Spara nytt lösenord','Save new password')}</button>
        </form>:null}
        {message&&<p role="status" className="wolf-auth-message">{message}</p>}
        <a href={purpose==='signup'&&verified&&resume?resume:accountHome} className="wolf-auth-link">{purpose==='signup'&&verified&&resume?tr('Fortsätt där du var →','Continue where you left off →'):tr('Till kontosidan →','Go to account →')}</a>
      </section>
    </main>
  </div>
}
