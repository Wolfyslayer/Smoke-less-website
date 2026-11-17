import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './client'

type Purpose = 'signup' | 'recovery'
export default function EmailCallback({ purpose }: { purpose: Purpose }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Verifierar länken…')
  useEffect(() => {
    let active = true
    async function verify() {
      const token_hash = params.get('token_hash')
      const type = params.get('type')
      if (!token_hash || type !== purpose) {
        if (active) setStatus('Länken är ofullständig eller ogiltig. Begär en ny länk.')
        return
      }
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: purpose })
      if (!active) return
      // Never leave a single-use credential in the address bar or browser history.
      window.history.replaceState(window.history.state, '', window.location.pathname)
      if (error) {
        setStatus('Länken är ogiltig eller har gått ut. Begär en ny länk.')
      } else if (purpose === 'recovery') {
        navigate('/resetpassword', { replace: true, state: { verifiedRecovery: true } })
      } else {
        navigate('/beta', { replace: true })
      }
    }
    void verify()
    return () => { active = false }
  }, [params, purpose, navigate])
  return <main id="main-content" className="content wrap">
    <span className="eyebrow">SMOKE LESS · KONTO</span>
    <h1>{purpose === 'recovery' ? 'Återställ lösenord' : 'Bekräfta e-postadress'}</h1>
    <section className="panel beta-auth-card"><p role="status">{status}</p>
      <Link to="/beta" className="button outline">Till betaportalen</Link>
    </section>
  </main>
}
