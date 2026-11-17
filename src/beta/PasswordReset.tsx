import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from './client'

export default function PasswordReset() {
  const location = useLocation()
  const verified = Boolean((location.state as { verifiedRecovery?: boolean } | null)?.verifiedRecovery)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const valid = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    if (verified && !valid) { setMessage('Använd minst 8 tecken, stora och små bokstäver, en siffra och ett specialtecken.'); return }
    setBusy(true); setMessage('')
    try {
      if (verified) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        await supabase.auth.signOut()
        setPassword('')
        setMessage('Lösenordet är uppdaterat. Logga in med ditt nya lösenord.')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + '/resetpassword',
        })
        if (error) throw error
        setMessage('Om adressen finns registrerad får du ett mejl med instruktioner.')
      }
    } catch { setMessage('Det gick inte att slutföra åtgärden. Försök igen eller begär en ny länk.') }
    finally { setBusy(false) }
  }
  return <main id="main-content" className="content wrap">
    <span className="eyebrow">SMOKE LESS · KONTO</span><h1>Återställ lösenord</h1>
    <section className="panel beta-auth-card">
      <p>{verified ? 'Välj ett nytt lösenord till ditt konto.' : 'Ange din e-postadress för att få en återställningslänk.'}</p>
      <form className="beta-form" onSubmit={submit}>
        {verified ? <div className="beta-field"><label htmlFor="new-password">Nytt lösenord</label><input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} /><p className="fineprint">Minst 8 tecken, stor och liten bokstav, siffra och specialtecken.</p></div>
        : <div className="beta-field"><label htmlFor="reset-email">E-postadress</label><input id="reset-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>}
        <button className="button primary" disabled={busy} type="submit">{busy ? 'Vänta…' : verified ? 'Spara nytt lösenord' : 'Skicka återställningslänk'}</button>
      </form>
      {message && <p role="status">{message}</p>}
      <p><Link to="/beta">Till betaportalen</Link></p>
    </section>
  </main>
}
