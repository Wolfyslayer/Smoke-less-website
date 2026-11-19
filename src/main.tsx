import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import Hub from './Hub'
import AccountPage from './auth/AccountPage'
import AuthCallbackPage from './auth/AuthCallbackPage'
import { SiteAuthProvider } from './auth/SiteAuthProvider'
import { SiteLocaleProvider } from './SiteLocale'
import './styles.css'
import './app-inspired.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
if (path === '/' && /^#\/(download|support|privacy|changelog)(\/|$)/.test(window.location.hash)) {
  // Preserve legacy Smoke Less bookmark links after the move.
  window.location.replace('/smoke-less/' + window.location.hash)
} else {
  const smokePage = path === '/smoke-less'
  const account = path === '/account'
  const signupCallback = path === '/confirmemail'
  const recoveryCallback = path === '/recoverpassword'
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SiteLocaleProvider>
        <SiteAuthProvider>
          {smokePage ? <HashRouter><App /></HashRouter> :
            account ? <AccountPage /> :
            signupCallback ? <AuthCallbackPage purpose="signup"/> :
            recoveryCallback ? <AuthCallbackPage purpose="recovery"/> :
            <Hub />}
        </SiteAuthProvider>
      </SiteLocaleProvider>
    </React.StrictMode>
  )
}
