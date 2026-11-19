import { useSiteAuth } from '../auth/SiteAuthProvider'
import { useSiteLocale } from '../SiteLocale'
import { useBetaAccess } from './useBetaAccess'
import './beta.css'

export default function BetaAccountStatus() {
  const {user,loading:authLoading}=useSiteAuth()
  const {tr}=useSiteLocale()
  const access=useBetaAccess(user?.id)
  if (authLoading || !user) return null
  const labels={
    pending: tr('Väntar på godkännande','Pending review'),
    approved: tr('Godkänd betatestare','Approved beta tester'),
    rejected: tr('Ansökan nekad','Application declined'),
    revoked: tr('Åtkomst återkallad','Access revoked')
  }
  return <section className="wolf-beta-account" aria-labelledby="beta-account-title">
    <span className="wolf-beta-kicker">SMOKE LESS · BETA</span>
    <h2 id="beta-account-title">{tr('Din betastatus','Your beta status')}</h2>
    {access.loading?<p role="status">{tr('Kontrollerar åtkomst…','Checking access…')}</p>:
      !access.configured?<p role="status">{tr('Betastatus är inte tillgänglig just nu. Ingen nedladdning är aktiverad.','Beta status is unavailable. Downloads remain disabled.')}</p>:
      <p role="status">{access.application?
        <><strong>{labels[access.application.status]}</strong>{access.application.status==='approved'&&<span> · {tr('Privat nedladdning öppnas först när den är verifierad.','Private downloads will open only after verification.')}</span>}</>:
        tr('Ingen ansökan registrerad.','No beta application yet.')}</p>}
    <div className="wolf-beta-actions">
      <a className="wolf-auth-link" href="/smoke-less/beta/">{tr('Öppna betaprogrammet →','Open beta programme →')}</a>
      {access.configured&&access.admin&&<a className="wolf-auth-link" href="/smoke-less/admin/">{tr('Öppna administration →','Open administration →')}</a>}
    </div>
  </section>
}
