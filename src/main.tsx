import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import Portal from './Portal'
import { PreferencesProvider } from './i18n'
import './styles.css'
import './app-inspired.css'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
if (path === '/' && /^#\/(download|support|privacy|changelog)(?:\/|$)/.test(window.location.hash)) {
  window.location.replace('/smoke-less/' + window.location.hash)
} else {
  const isSmokeLess = path === '/smoke-less'
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <PreferencesProvider>{isSmokeLess ? <HashRouter><App/></HashRouter> : <Portal/>}</PreferencesProvider>
    </React.StrictMode>
  )
}
