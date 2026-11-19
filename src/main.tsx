import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import Hub from './Hub'
import { SiteLocaleProvider } from './SiteLocale'
import './styles.css'
import './app-inspired.css'

if (window.location.pathname === '/' && /^#\/(download|support|privacy|changelog)(\/|$)/.test(window.location.hash)) {
  // Preserve existing bookmarked Smoke Less URLs after moving it to /smoke-less/.
  window.location.replace('/smoke-less/' + window.location.hash)
} else {
  const smokePage = window.location.pathname === '/smoke-less' || window.location.pathname.startsWith('/smoke-less/')
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SiteLocaleProvider>
        {smokePage ? <HashRouter><App /></HashRouter> : <Hub />}
      </SiteLocaleProvider>
    </React.StrictMode>
  )
}
