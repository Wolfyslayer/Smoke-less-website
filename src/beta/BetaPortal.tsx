import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './client'

type Mode = 'closed' | 'beta' | 'release'
type Status = 'pending' | 'approved' | 'rejected' | 'revoked'
type Application = { user_id: string; status: Status; message: string; created_at: string }
type Settings = { mode: Mode; public_release_approved: boolean; active_artifact_id: string | null }
type Artifact = { id: string; version: string; version_code: number; status: string; sha256: string }
const safeError = 'Det gick inte att slutföra åtgärden. Försök igen senare.'

export default function BetaPortal({ adminOnly = false }: { adminOnly?: boolean }) {
  const [user, setUser] = useState<User | null>(null)
  const [mode, setMode] = useState<Mode>('closed')
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authAction, setAuthAction] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [application, setApplication] = useState<Application | null>(null)
  const [admin, setAdmin] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [busy, setBusy] = useState(false)

  async function load(account: User | null) {
    setLoading(true)
    setMessage('')
    setUser(account)
    setMode('closed')
    setApplication(null)
    setAdmin(false)
    setApplications([])
    setSettings(null)
    setArtifacts([])
    try {
      const { data: publicMode, error: modeError } = await supabase.from('beta_public_mode').select('mode').single()
      if (modeError) throw modeError
      if (publicMode?.mode === 'beta' || publicMode?.mode === 'release') setMode(publicMode.mode)
      if (account) {
        const [{ data: own, error: ownError }, { data: role, error: roleError }] = await Promise.all([
          supabase.from('beta_applications').select('user_id,status,message,created_at').eq('user_id', account.id).maybeSingle(),
          supabase.from('beta_admins').select('user_id').eq('user_id', account.id).maybeSingle(),
        ])
        if (ownError || roleError) throw ownError || roleError
        setApplication(own as Application | null)
        if (role) {
          setAdmin(true)
          const [apps, config, releases] = await Promise.all([
            supabase.from('beta_applications').select('user_id,status,message,created_at').order('created_at', { ascending: false }),
            supabase.from('beta_settings').select('mode,public_release_approved,active_artifact_id').eq('singleton', true).single(),
            supabase.from('beta_artifacts').select('id,version,version_code,status,sha256').order('version_code', { ascending: false }),
          ])
          if (apps.error || config.error || releases.error) throw apps.error || config.error || releases.error
          setApplications((apps.data || []) as Application[])
          setSettings(config.data as Settings)
          setArtifacts((releases.data || []) as Artifact[])
        }
      }
    } catch {
      setMode('closed')
      setMessage('Betaportalen är inte färdigkonfigurerad eller kan inte nås just nu. Ingen nedladdning är tillgänglig.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data }) => { if (active) void load(data.user) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Schedule a refresh outside the auth callback to avoid Supabase auth-lock deadlocks.
      if (active) window.setTimeout(() => { if (active) void load(session?.user ?? null) }, 0)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  const strongPassword = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    if (authAction === 'signup' && !strongPassword) { setMessage('Lösenordet måste innehålla minst 8 tecken, stora och små bokstäver, siffror och specialtecken.'); return }
    setBusy(true); setMessage('')
    try {
      if (authAction === 'signup' && !adminOnly && mode === 'beta') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: window.location.origin + '/#/beta' },
        })
        if (error) throw error
        setMessage(data.session ? 'Kontot är skapat. Du kan nu ansöka.' : 'Kontrollera din e-post och bekräfta kontot innan du loggar in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      }
    } catch {
      setMessage(authAction === 'signup' ? 'Kontot kunde inte skapas. Kontrollera uppgifterna och försök igen.' : 'Inloggningen misslyckades. Kontrollera e-post och lösenord.')
    } finally { setBusy(false) }
  }

  async function apply() {
    if (!user || busy || mode !== 'beta') return
    setBusy(true); setMessage('')
    const { error } = await supabase.from('beta_applications').insert({ user_id: user.id, status: 'pending' })
    setBusy(false)
    if (error) setMessage(safeError)
    else void load(user)
  }

  async function review(applicantId: string, status: Status) {
    if (!admin || !user || busy) return
    setBusy(true); setMessage('')
    const { error } = await supabase.from('beta_applications')
      .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('user_id', applicantId)
    setBusy(false)
    if (error) setMessage(safeError)
    else void load(user)
  }

  async function changeMode(next: Mode) {
    if (!admin || !user || busy || !settings || next === 'release') return
    // Public release remains locked until independent server-side attestation exists.
    setBusy(true); setMessage('')
    const { error } = await supabase.from('beta_settings')
      .update({ mode: next, updated_at: new Date().toISOString() }).eq('singleton', true)
    setBusy(false)
    if (error) setMessage(safeError)
    else void load(user)
  }

  return <main id="main-content" className="content wrap">
    <span className="eyebrow">SMOKE LESS · {adminOnly ? 'ADMINISTRATION' : 'BETAPROGRAM'}</span>
    <h1>{adminOnly ? 'Betaportalen – admin' : 'Testa Smoke Less'}</h1>
    <p className="lead">Betatestning är endast tillgänglig efter godkännande. En ansökan ger inte automatiskt tillgång till appen.</p>
    {loading ? <p role="status">Hämtar status…</p> : <>
      {!adminOnly && <div className="panel"><h2>Aktuellt läge</h2><p role="status">{mode === 'beta' ? 'Ansökningar till betatestning' : mode === 'release' ? 'Offentlig release' : 'Stängt för nedladdning'}</p></div>}
      {!user ? <section className="panel beta-auth-card">
        <h2>{authAction === 'signup' && !adminOnly ? 'Skapa testkonto' : 'Logga in'}</h2>
        <p>{adminOnly ? 'Logga in med ditt administratörskonto.' : 'Använd e-post och lösenord för att hantera din ansökan.'}</p>
        <form className="beta-form" onSubmit={submitCredentials}>
          <div className="beta-field"><label htmlFor="beta-email">E-postadress</label><input id="beta-email" type="email" required autoComplete="email" placeholder="namn@exempel.se" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="beta-field"><label htmlFor="beta-password">Lösenord</label><input id="beta-password" type="password" required minLength={authAction === 'signup' ? 8 : undefined} aria-describedby={authAction === 'signup' ? 'beta-password-rules' : undefined} autoComplete={authAction === 'signup' ? 'new-password' : 'current-password'} placeholder="Ange ditt lösenord" value={password} onChange={e => setPassword(e.target.value)} />{authAction === 'signup' && <p id="beta-password-rules" className="fineprint">Minst 8 tecken, en stor bokstav, en liten bokstav, en siffra och ett specialtecken.</p>}</div>
          <button className="button primary" type="submit" disabled={busy}>{busy ? 'Vänta…' : authAction === 'signup' && !adminOnly ? 'Skapa konto' : 'Logga in'}</button>
        </form>
        {!adminOnly && mode === 'beta' && <button className="beta-text-button" type="button" onClick={() => { setAuthAction(v => v === 'login' ? 'signup' : 'login'); setMessage('') }}>{authAction === 'login' ? 'Ny testare? Skapa konto' : 'Har du redan ett konto? Logga in'}</button>}
      </section> : <>
        <div className="panel"><p>Inloggad som <strong>{user.email}</strong></p><button className="button outline" type="button" onClick={() => void supabase.auth.signOut()}>Logga ut</button></div>
        {!adminOnly && mode === 'beta' && <section className="panel"><h2>Din betaansökan</h2>
          {application ? <p role="status">Status: <strong>{application.status === 'pending' ? 'Väntar på godkännande' : application.status === 'approved' ? 'Godkänd' : application.status === 'rejected' ? 'Nekad' : 'Återkallad'}</strong></p> :
          <><p>Ansök om en plats i den privata betatestningen.</p><button className="button primary" type="button" onClick={() => void apply()} disabled={busy}>Skicka betaansökan</button></>}
          {application?.status === 'approved' && <p>Nedladdningen öppnas när en signerad APK och säker nedladdningsfunktion har verifierats. Ingen APK är publicerad här ännu.</p>}
        </section>}
      </>}
      {adminOnly && user && (admin ? <section className="panel">
        <h2>Administration</h2><p>Alla ändringar kontrolleras även av Supabases RLS-regler.</p>
        <h3>Webbplatsens läge</h3><p>Nuvarande läge: <strong>{settings?.mode || 'okänt'}</strong></p>
        <button className="button outline" disabled={busy || !settings} onClick={() => void changeMode('closed')}>Stängd</button>{' '}
        <button className="button outline" disabled={busy || !settings} onClick={() => void changeMode('beta')}>Betatestning</button>
        <p className="fineprint">Offentlig release kan inte aktiveras förrän en separat säkerhets- och releasegrind finns.</p>
        <h3>Ansökningar ({applications.length})</h3>
        {applications.length === 0 ? <p>Inga ansökningar.</p> : applications.map(a => <div className="panel" key={a.user_id}>
          <p><strong>Testare:</strong> {a.user_id}</p><p>Status: {a.status}</p>
          <button className="button outline" disabled={busy} onClick={() => void review(a.user_id, 'approved')}>Godkänn</button>{' '}
          <button className="button outline" disabled={busy} onClick={() => void review(a.user_id, 'rejected')}>Neka</button>{' '}
          <button className="button outline" disabled={busy} onClick={() => void review(a.user_id, 'revoked')}>Återkalla</button>
        </div>)}
        <h3>APK-kandidater ({artifacts.length})</h3>
        <p>Uppladdning och säker nedladdning införs i W4. Inga filer kan hämtas här ännu.</p>
        {artifacts.map(a => <p key={a.id}>{a.version} · versionCode {a.version_code} · {a.status}</p>)}
      </section> : <div className="panel"><p>Du saknar administratörsbehörighet.</p></div>)}
    </>}
    {message && <p role="status">{message}</p>}
  </main>
}
