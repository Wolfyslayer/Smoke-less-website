import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { SiteNavigation } from '../SiteNavigation'
import { useSiteLocale } from '../SiteLocale'
import { useSiteAuth } from './SiteAuthProvider'
import { supabase } from './client'
import { safeReturnTo } from './returnTo'
import BetaAccountStatus from '../beta/BetaAccountStatus'
import './auth.css'

type Mode = 'login'|'signup'|'forgot'
const strong = (s:string)=>s.length>=8&&/[a-z]/.test(s)&&/[A-Z]/.test(s)&&/\d/.test(s)&&/[^A-Za-z0-9]/.test(s)

export default function AccountPage({section='hub'}:{section?:'hub'|'smoke'|'vape'}){
  const {tr,language}=useSiteLocale()
  const {user,loading}=useSiteAuth()
  const isSmoke=section==='smoke'
  const isVape=section==='vape'
  const accountHome=isSmoke?'/smoke-less/account/':isVape?'/vape-calculator/account/':'/account/'
  const returnTo=safeReturnTo(new URLSearchParams(window.location.search).get('returnTo'))
  const backHref=returnTo ?? (isSmoke?'/smoke-less/':isVape?'/vape-calculator/':'/')
  const [mode,setMode]=useState<Mode>('login')
  const [email,setEmail]=useState(''),[password,setPassword]=useState('')
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false)
  useEffect(()=>{document.title=isSmoke?tr('Mitt konto – Smoke Less','My account – Smoke Less'):isVape?tr('Mitt konto – Vape Calculator','My account – Vape Calculator'):tr('Mitt konto – Wolfyslayer','My account – Wolfyslayer');document.documentElement.lang=language},[language,tr,isSmoke,isVape])
  const pick=(value:Mode)=>{setMode(value);setPassword('');setMessage('');setFailed(false)}
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    if(busy)return
    if(mode==='signup'&&!strong(password)){
      setFailed(true);setMessage(tr('Minst 8 tecken, stor och liten bokstav, siffra och specialtecken.','At least 8 characters including uppercase, lowercase, a number and a symbol.'));return
    }
    setBusy(true);setMessage('');setFailed(false)
    try{
      try{sessionStorage.setItem('wolfyslayer:auth-account-home',accountHome)}catch{}
      if(mode==='forgot'){
        const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/recoverpassword/'})
        if(error)throw error
        setMessage(tr('Om adressen finns registrerad får du ett mejl. Kontrollera även skräppost.','If the address is registered, you will receive an email. Check your spam folder too.'))
      }else if(mode==='signup'){
        if(returnTo){try{sessionStorage.setItem('wolfyslayer:auth-return-to',returnTo)}catch{}}
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/confirmemail/'}})
        if(error)throw error
        setPassword('')
        if(data.session&&returnTo)window.location.assign(returnTo)
        setMessage(data.session?tr('Kontot har skapats.','Your account is ready.'):tr('Kontrollera e-posten och bekräfta ditt konto.','Check your email to confirm your account.'))
      }else{
        const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password})
        if(error)throw error
        setPassword('')
        if(data.user&&returnTo)window.location.assign(returnTo)
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
  return <div className={isSmoke?"wolf-account wolf-account--smoke":isVape?"wolf-account wolf-account--vape":"wolf-account"}>
    <a className="wolf-auth-skip" href="#auth-main">{tr('Hoppa till innehållet','Skip to content')}</a>
    <SiteNavigation section={section}/>
    <main id="auth-main" className="wolf-auth-wrap">
      <a className="wolf-auth-back" href={backHref}>{returnTo?tr('← Tillbaka till föregående sida','← Back to previous page'):isSmoke?tr('← Till Smoke Less','← Back to Smoke Less'):isVape?tr('← Till Vape Calculator','← Back to Vape Calculator'):tr('← Tillbaka till projekten','← Back to projects')}</a>
      <div className="wolf-auth-heading"><span className="wolf-auth-eyebrow">{isSmoke?'SMOKE LESS · ACCOUNT':isVape?'VAPECALC · ACCOUNT':'WOLFYSLAYER · ACCOUNT'}</span><h1>{isSmoke?tr('Ditt Smoke Less-konto','Your Smoke Less account'):isVape?tr('Ditt Vape Calculator-konto','Your Vape Calculator account'):tr('Ditt konto, på ditt sätt.','Your account, your way.')}</h1><p>{isSmoke?tr('Samma Wolfyslayer-konto används för alla webbplatser. Här ser du också din Smoke Less-betastatus.','Your Wolfyslayer account is shared across all websites. Your Smoke Less beta status appears here.'):isVape?tr('Logga in med ditt gemensamma konto och hantera dina privata recept i Vape Calculator.','Use your shared account to manage private recipes in Vape Calculator.'):tr('Logga in eller skapa ett konto för att spara dina Vape Calculator-recept privat i Supabase.','Sign in or create an account to save your Vape Calculator recipes privately in Supabase.')}</p></div>
      <section className="wolf-auth-card" aria-label={tr('Mitt konto','My account')}>
      {loading?<p role="status">{tr('Kontrollerar inloggning…','Checking your session…')}</p>:user?<>
        <span className="wolf-auth-status"><span aria-hidden="true"/> {tr('Inloggad','Signed in')}</span>
        <h2>{tr('Välkommen tillbaka','Welcome back')}</h2>
        <div className="wolf-auth-identity"><span>{tr('E-postadress','Email address')}</span><strong>{user.email??'—'}</strong></div>
        <p className="wolf-auth-note">{tr('Recept som du sparar när du är inloggad tillhör ditt konto. Lokala gästrecept överförs endast om du själv väljer det.','Recipes saved while signed in belong to your account. Local guest recipes are only transferred if you choose to import them.')}</p>
        {!isSmoke&&<a className="wolf-auth-link" href="/vape-calculator/#/recipes">{tr('Mina recept i Vape Calculator →','My Vape Calculator recipes →')}</a>}
        {returnTo&&<a className="wolf-auth-link" href={returnTo}>{tr('Fortsätt där jag var →','Continue where I left off →')}</a>}
        {isSmoke&&<BetaAccountStatus/>}
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
      <p className="wolf-auth-disclaimer">{tr('Ett gemensamt webbplatskonto fungerar för Wolfyslayer, Smoke Less och Vape Calculator. Android-appens Firebase-konto är fortfarande separat. Adminrättigheter och betaåtkomst kontrolleras separat i Supabase.','One shared website account works for Wolfyslayer, Smoke Less and Vape Calculator. The Android app Firebase account remains separate. Administrator and beta access are checked separately in Supabase.')}</p>
    </main>
  </div>
}
