import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './responsive-header.css'

type Language = 'sv' | 'en'
const items = [
  { to: '/', sv: 'Hem', en: 'Home' },
  { to: '/download', sv: 'Ladda ner', en: 'Download' },
  { to: '/support', sv: 'Support', en: 'Support' },
  { to: '/privacy', sv: 'Integritet', en: 'Privacy' },
  { to: '/changelog', sv: 'Versioner', en: 'Changelog' },
]
const readLanguage = (): Language => {
  try { return localStorage.getItem('wolfyslayer-language') === 'en' ? 'en' : 'sv' }
  catch { return 'sv' }
}

export default function ResponsiveHeader({ location }: { location: string }) {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [language, setLanguage] = useState<Language>(readLanguage)
  const dropdown = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const drawer = useRef<HTMLElement>(null)
  const previousOpen = useRef(false)

  useEffect(() => { setOpen(false); setLangOpen(false) }, [location])
  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem('wolfyslayer-language', language) } catch { /* Private browsing */ }
  }, [language])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setLangOpen(false) }
    }
    const onClick = (event: MouseEvent) => {
      if (dropdown.current && !dropdown.current.contains(event.target as Node)) setLangOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onClick) }
  }, [])
  useEffect(() => {
    if (previousOpen.current && !open && drawer.current?.contains(document.activeElement)) menuButton.current?.focus()
    previousOpen.current = open
  }, [open])

  const setLang = (next: Language) => { setLanguage(next); setLangOpen(false) }
  const labels = language === 'sv'
    ? { menu: 'Öppna meny', close: 'Stäng meny', language: 'Välj språk', nav: 'Huvudmeny' }
    : { menu: 'Open menu', close: 'Close menu', language: 'Choose language', nav: 'Main menu' }
  const links = items.map(item => <NavLink key={item.to} end={item.to === '/'} to={item.to} onClick={() => setOpen(false)}
    className={({ isActive }) => isActive ? 'active' : ''}>{item[language]}</NavLink>)
  return <>
    <header className="site-header wrap responsive-site-header">
      <Link className="brand" to="/" onClick={() => setOpen(false)} aria-label="Smoke Less">
        <span className="brand-mark" aria-hidden="true">◉</span> Smoke Less
      </Link>
      <nav className="desktop-nav" aria-label={labels.nav}>{links}</nav>
      <div className="header-controls">
        <div className="language-dropdown" ref={dropdown}>
          <button type="button" className="language-trigger" aria-label={labels.language}
            aria-haspopup="true" aria-expanded={langOpen} onClick={() => setLangOpen(!langOpen)}>
            <span aria-hidden="true">◎</span> {language.toUpperCase()} <span className="language-chevron" aria-hidden="true">⌄</span>
          </button>
          {langOpen && <div className="language-options" role="group" aria-label={labels.language}>
            <button type="button" lang="sv" aria-pressed={language === 'sv'} onClick={() => setLang('sv')}>🇸🇪 Svenska {language === 'sv' && '✓'}</button>
            <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => setLang('en')}>🇬🇧 English {language === 'en' && '✓'}</button>
          </div>}
        </div>
        <button ref={menuButton} type="button" className="menu-toggle" aria-label={open ? labels.close : labels.menu}
          aria-controls="smoke-mobile-nav" aria-expanded={open} onClick={() => { setOpen(!open); setLangOpen(false) }}>
          <span className="hamburger-lines" aria-hidden="true"><i/><i/><i/></span>
        </button>
      </div>
    </header>
    <div className={'mobile-nav-backdrop' + (open ? ' visible' : '')} aria-hidden="true" onClick={() => setOpen(false)} />
    <nav id="smoke-mobile-nav" ref={drawer} className={'mobile-drawer' + (open ? ' open' : '')}
      aria-label={labels.nav} aria-hidden={!open} inert={!open}>
      <div className="drawer-heading"><strong>Smoke Less</strong><button type="button" onClick={() => setOpen(false)} aria-label={labels.close}>✕</button></div>
      <div className="drawer-links">{links}</div>
      <p className="drawer-caption">Wolfyslayer.online</p>
    </nav>
  </>
}
