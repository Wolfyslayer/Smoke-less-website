import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import Hub from './Hub'
import AccountPage from './auth/AccountPage'
import AuthCallbackPage from './auth/AuthCallbackPage'
import BetaPortal from './beta/BetaPortal'
import { SiteAuthProvider } from './auth/SiteAuthProvider'
import { SiteLocaleProvider } from './SiteLocale'
import './styles.css'
import './app-inspired.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const legacy = path === '/admin' ? '/smoke-less/admin/' :
  path === '/beta' ? '/smoke-less/beta/' :
  path === '/resetpassword' ? '/recoverpassword/' : null
if (legacy) {
  window.location.replace(legacy + window.location.search + window.location.hash)
} else if (path === '/' && /^#\/(download|support|privacy|changelog)(\/|$)/.test(window.location.hash)) {
  // Preserve legacy Smoke Less bookmark links after the move.
  window.location.replace('/smoke-less/' + window.location.hash)
} else {
  const smokePage = path === '/smoke-less'
  const account = path === '/account'
  const smokeAccount = path === '/smoke-less/account'
  const vapeAccount = path === '/vape-calculator/account'
  const betaPage = path === '/smoke-less/beta'
  const adminPage = path === '/smoke-less/admin'
  const signupCallback = path === '/confirmemail'
  const recoveryCallback = path === '/recoverpassword'
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SiteLocaleProvider>
        <SiteAuthProvider>
          {smokePage ? <HashRouter><App /></HashRouter> :
            smokeAccount ? <AccountPage section="smoke" /> :
            vapeAccount ? <AccountPage section="vape" /> :
            betaPage ? <BetaPortal/> :
            adminPage ? <BetaPortal adminOnly/> :
            account ? <AccountPage /> :
            signupCallback ? <AuthCallbackPage purpose="signup"/> :
            recoveryCallback ? <AuthCallbackPage purpose="recovery"/> :
            <Hub />}
        </SiteAuthProvider>
      </SiteLocaleProvider>
    </React.StrictMode>
  )
}
