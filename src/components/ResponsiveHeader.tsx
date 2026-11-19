import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { usePreferences } from '../i18n'
import './responsive-header.css'

const items = [
  { to: '/', sv: 'Hem', en: 'Home' },
  { to: '/download', sv: 'Ladda ner', en: 'Download' },
  { to: '/support', sv: 'Support', en: 'Support' },
  { to: '/privacy', sv: 'Integritet', en: 'Privacy' },
  { to: '/changelog', sv: 'Versioner', en: 'Changelog' },
]

export default function ResponsiveHeader({ location }: { location: string }) {
  const { lang, setLang, theme, toggleTheme } = usePreferences()
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const dropdown = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const drawer = useRef<HTMLElement>(null)

  useEffect(() => { setOpen(false); setLangOpen(false) }, [location])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setLangOpen(false) }
      if (event.key === 'Tab' && open) {
        const focusables = Array.from(drawer.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? [])
        const first = focusables[0], last = focusables[focusables.length - 1]
        if (!first || !last) return
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    const onPointer = (event: PointerEvent) => {
      if (dropdown.current && !dropdown.current.contains(event.target as Node)) setLangOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer) }
  }, [open])
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const scroll = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawer.current?.querySelector<HTMLButtonElement>('.drawer-close')?.focus()
    return () => {
      document.body.style.overflow = scroll
      if (previous?.isConnected) previous.focus()
      else menuButton.current?.focus()
    }
  }, [open])
  const labels = lang === 'sv'
    ? { menu: 'Öppna meny', close: 'Stäng meny', language: 'Välj språk', nav: 'Huvudmeny', theme: 'Byt färgtema', portal: 'Alla projekt' }
    : { menu: 'Open menu', close: 'Close menu', language: 'Choose language', nav: 'Main menu', theme: 'Toggle color theme', portal: 'All projects' }
  const links = (mobile: boolean) => items.map(item =>
    <NavLink key={item.to} end={item.to === '/'} to={item.to} onClick={mobile ? () => setOpen(false) : undefined}
      className={({ isActive }) => isActive ? 'active' : ''}>{item[lang]}</NavLink>
  )
  return <>
    <header className="site-header wrap responsive-site-header">
      <Link className="brand" to="/" onClick={() => setOpen(false)} aria-label="Smoke Less"><span className="brand-mark" aria-hidden="true">◉</span> Smoke Less</Link>
      <nav className="desktop-nav" aria-label={labels.nav}>{links(false)}</nav>
      <div className="header-controls">
        <div className="language-dropdown" ref={dropdown}>
          <button type="button" className="language-trigger" aria-label={labels.language} aria-haspopup="true"
            aria-expanded={langOpen} onClick={() => setLangOpen(value => !value)}>
            <span aria-hidden="true">{lang === 'sv' ? '🇸🇪' : '🇬🇧'}</span> {lang.toUpperCase()} <span className="language-chevron" aria-hidden="true">⌄</span>
          </button>
          {langOpen && <div className="language-options" role="group" aria-label={labels.language}>
            <button type="button" lang="sv" aria-pressed={lang === 'sv'} onClick={() => { setLang('sv'); setLangOpen(false) }}>🇸🇪 Svenska {lang === 'sv' && '✓'}</button>
            <button type="button" lang="en" aria-pressed={lang === 'en'} onClick={() => { setLang('en'); setLangOpen(false) }}>🇬🇧 English {lang === 'en' && '✓'}</button>
          </div>}
        </div>
        <button className="language-trigger theme-toggle" type="button" onClick={toggleTheme} aria-label={labels.theme} title={labels.theme}>{theme === 'dark' ? '☀' : '☾'}</button>
        <button ref={menuButton} type="button" className="menu-toggle" aria-label={open ? labels.close : labels.menu}
          aria-controls="smoke-mobile-nav" aria-expanded={open} onClick={() => { setOpen(value => !value); setLangOpen(false) }}>
          <span className="hamburger-lines" aria-hidden="true"><i/><i/><i/></span>
        </button>
      </div>
    </header>
    <div className={'mobile-nav-backdrop' + (open ? ' visible' : '')} aria-hidden="true" onClick={() => setOpen(false)} />
    <nav id="smoke-mobile-nav" ref={drawer} className={'mobile-drawer' + (open ? ' open' : '')}
      aria-label={labels.nav} aria-hidden={!open} inert={!open}>
      <div className="drawer-heading"><strong>Smoke Less</strong><button type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label={labels.close}>✕</button></div>
      <div className="drawer-links">{links(true)}<a href="/" onClick={() => setOpen(false)}>← {labels.portal}</a></div>
      <p className="drawer-caption">wolfyslayer.online</p>
    </nav>
  </>
}
