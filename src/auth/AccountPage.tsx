import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { SiteNavigation } from '../SiteNavigation'
import { useSiteLocale } from '../SiteLocale'
import { useSiteAuth } from './SiteAuthProvider'
import { supabase } from './client'
import './auth.css'

type Mode = 'login'|'signup'|'forgot'
const strong = (s:string)=>s.length>=8&&/[a-z]/.test(s)&&/[A-Z]/.test(s)&&/\d/.test(s)&&/[^A-Za-z0-9]/.test(s)

export default function AccountPage(){
  const {tr,language}=useSiteLocale()
  const {user,loading}=useSiteAuth()
  const [mode,setMode]=useState<Mode>('login')
  const [email,setEmail]=useState(''),[password,setPassword]=useState('')
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false)
  useEffect(()=>{document.title=tr('Mitt konto – Wolfyslayer','My account – Wolfyslayer');document.documentElement.lang=language},[language,tr])
  const pick=(value:Mode)=>{setMode(value);setPassword('');setMessage('');setFailed(false)}
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    if(busy)return
    if(mode==='signup'&&!strong(password)){
      setFailed(true);setMessage(tr('Minst 8 tecken, stor och liten bokstav, siffra och specialtecken.','At least 8 characters including uppercase, lowercase, a number and a symbol.'));return
    }
    setBusy(true);setMessage('');setFailed(false)
    try{
      if(mode==='forgot'){
        const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/recoverpassword/'})
        if(error)throw error
        setMessage(tr('Om adressen finns registrerad får du ett mejl. Kontrollera även skräppost.','If the address is registered, you will receive an email. Check your spam folder too.'))
      }else if(mode==='signup'){
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/confirmemail/'}})
        if(error)throw error
        setPassword('')
        setMessage(data.session?tr('Kontot har skapats.','Your account is ready.'):tr('Kontrollera e-posten och bekräfta ditt konto.','Check your email to confirm your account.'))
      }else{
        const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password})
        if(error)throw error
        setPassword('')
      }
    }catch{
      setFailed(true)
      setMessage(mode==='login'?tr('Kunde inte logga in. Kontrollera e-post och lösenord.','Could not sign in. Check your email and password.'):mode==='signup'?tr('Kunde inte skapa kontot. Kontrollera uppgifterna och försök igen.','Unable to create the account. Check your details and try again.'):tr('Mejlet kunde inte skickas. Försök igen senare.','Unable to send the email. Please try again later.'))
    }finally{setBusy(false)}
  }
  async function signOut(){
    if(busy)return
    setBusy(true);setMessage('');setFailed(false)
    const {error}=await supabase.auth.signOut()
    setBusy(false)
    if(error){setFailed(true);setMessage(tr('Kunde inte logga ut. Försök igen.','Unable to sign out. Please try again.'))}
    else{setPassword('');setMessage(tr('Du har loggat ut.','You have signed out.'))}
  }
  return <div className="wolf-account">
    <a className="wolf-auth-skip" href="#auth-main">{tr('Hoppa till innehållet','Skip to content')}</a>
    <SiteNavigation section="hub"/>
    <main id="auth-main" className="wolf-auth-wrap">
      <a className="wolf-auth-back" href="/">{tr('← Tillbaka till projekten','← Back to projects')}</a>
      <div className="wolf-auth-heading"><span className="wolf-auth-eyebrow">WOLFYSLAYER · ACCOUNT</span><h1>{tr('Ditt konto, på ditt sätt.','Your account, your way.')}</h1><p>{tr('Logga in eller skapa ett konto för att spara dina Vape Calculator-recept privat i Supabase.','Sign in or create an account to save your Vape Calculator recipes privately in Supabase.')}</p></div>
      <section className="wolf-auth-card" aria-label={tr('Mitt konto','My account')}>
      {loading?<p role="status">{tr('Kontrollerar inloggning…','Checking your session…')}</p>:user?<>
        <span className="wolf-auth-status"><span aria-hidden="true"/> {tr('Inloggad','Signed in')}</span>
        <h2>{tr('Välkommen tillbaka','Welcome back')}</h2>
        <div className="wolf-auth-identity"><span>{tr('E-postadress','Email address')}</span><strong>{user.email??'—'}</strong></div>
        <p className="wolf-auth-note">{tr('Recept som du sparar när du är inloggad tillhör ditt konto. Lokala gästrecept överförs endast om du själv väljer det.','Recipes saved while signed in belong to your account. Local guest recipes are only transferred if you choose to import them.')}</p>
        <a className="wolf-auth-link" href="/vape-calculator/#/recipes">{tr('Mina recept i Vape Calculator →','My Vape Calculator recipes →')}</a>
        <button type="button" className="wolf-auth-submit secondary" disabled={busy} onClick={()=>void signOut()}>{busy?tr('Loggar ut…','Signing out…'):tr('Logga ut','Sign out')}</button>
      </>:<>
        <div className="wolf-auth-tabs" role="group" aria-label={tr('Kontoval','Account options')}>
          <button type="button" className={mode==='login'?'selected':''} aria-pressed={mode==='login'} onClick={()=>pick('login')}>{tr('Logga in','Sign in')}</button>
          <button type="button" className={mode==='signup'?'selected':''} aria-pressed={mode==='signup'} onClick={()=>pick('signup')}>{tr('Skapa konto','Create account')}</button>
        </div>
        <h2>{mode==='forgot'?tr('Glömt lösenord?','Forgot password?'):mode==='signup'?tr('Skapa konto','Create account'):tr('Logga in','Sign in')}</h2>
        <p>{mode==='forgot'?tr('Ange e-postadressen för att få en säker återställningslänk.','Enter your email to receive a secure reset link.'):mode==='signup'?tr('Välj ett säkert lösenord och bekräfta din e-postadress.','Choose a strong password and confirm your email address.'):tr('Använd e-postadressen och lösenordet för ditt webbplatskonto.','Use your website account email and password.')}</p>
        <form className="wolf-auth-form" onSubmit={e=>void submit(e)}>
          <label htmlFor="auth-email">{tr('E-postadress','Email address')}</label>
          <input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={busy} placeholder="namn@exempel.se"/>
          {mode!=='forgot'&&<>
            <label htmlFor="auth-password">{tr('Lösenord','Password')}</label>
            <input id="auth-password" type="password" autoComplete={mode==='signup'?'new-password':'current-password'} required minLength={mode==='signup'?8:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/>
            {mode==='signup'&&<small>{tr('Minst 8 tecken med stor och liten bokstav, siffra och specialtecken.','At least 8 characters with uppercase, lowercase, a number and a symbol.')}</small>}
          </>}
          <button className="wolf-auth-submit" disabled={busy} type="submit">{busy?tr('Arbetar…','Working…'):mode==='signup'?tr('Skapa konto','Create account'):mode==='forgot'?tr('Skicka återställningslänk','Send reset link'):tr('Logga in','Sign in')}</button>
        </form>
        {mode==='forgot'?<button className="wolf-auth-text-button" type="button" onClick={()=>pick('login')}>{tr('Tillbaka till inloggning','Back to sign in')}</button>:<button className="wolf-auth-text-button" type="button" onClick={()=>pick('forgot')}>{tr('Glömt lösenord?','Forgot your password?')}</button>}
      </>}
      {message&&<p className={'wolf-auth-message'+(failed?' error':'')} role={failed?'alert':'status'}>{message}</p>}
      </section>
      <p className="wolf-auth-disclaimer">{tr('Webbplatskontot är separat från Smoke Less-appens Firebase-konto. Inloggning ger inte automatiskt adminrättigheter eller tillgång till privata APK-filer.','Your website account is separate from the Smoke Less app’s Firebase account. Signing in does not automatically grant admin privileges or access to private APKs.')}</p>
    </main>
  </div>
}
