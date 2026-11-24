import { useEffect, useRef, useState } from 'react'
import { useSiteLocale } from './SiteLocale'
import { FlaskConical, Moon, Sun, UserRound } from 'lucide-react'
import { useSiteAuth } from './auth/SiteAuthProvider'
import SiteLanguageModal from './components/SiteLanguageModal'
import './site-navigation.css'

type NavItem = { labelSv:string; labelEn:string; href:string; internal?:boolean }
const smokeItems: NavItem[] = [
  {labelSv:'Hem',labelEn:'Home',href:'/',internal:true},
  {labelSv:'Ladda ner',labelEn:'Download',href:'/download',internal:true},
  {labelSv:'Support',labelEn:'Support',href:'/support',internal:true},
  {labelSv:'Integritet',labelEn:'Privacy',href:'/privacy',internal:true},
  {labelSv:'Versioner',labelEn:'Changelog',href:'/changelog',internal:true},
  {labelSv:'Betaprogram',labelEn:'Beta programme',href:'/smoke-less/beta/'},
  {labelSv:'Mitt konto',labelEn:'My account',href:'/smoke-less/account/'}
]
const hubItems:NavItem[] = [
  {labelSv:'Startsida',labelEn:'Home',href:'/'},
  {labelSv:'Smoke Less',labelEn:'Smoke Less',href:'/smoke-less/'},
  {labelSv:'Vape Calculator',labelEn:'Vape Calculator',href:'/vape-calculator/'},
  {labelSv:'ShadowSlayers',labelEn:'ShadowSlayers',href:'/shadow-slayers/'},
  {labelSv:'Mitt konto',labelEn:'My account',href:'/account/'}
]
const vapeItems:NavItem[] = [
  {labelSv:'Översikt',labelEn:'Overview',href:'/vape-calculator/#/'},
  {labelSv:'Nikotinstyrka',labelEn:'Nicotine strength',href:'/vape-calculator/#/strength'},
  {labelSv:'Shotplanerare',labelEn:'Shot planner',href:'/vape-calculator/#/shots'},
  {labelSv:'DIY-studio',labelEn:'DIY studio',href:'/vape-calculator/#/diy'},
  {labelSv:'Mina recept',labelEn:'My recipes',href:'/vape-calculator/#/recipes'},
  {labelSv:'Guide',labelEn:'Guide',href:'/vape-calculator/#/guide'},
  {labelSv:'Mitt konto',labelEn:'My account',href:'/vape-calculator/account/'}
]
export function SiteNavigation({section,onInternalNavigate,currentPath,theme='dark',onThemeChange}:{section:'smoke'|'hub'|'vape';onInternalNavigate?:(path:string)=>void;currentPath?:string;theme?:'dark'|'light';onThemeChange?:()=>void}){
  const {tr} = useSiteLocale()
  const {user,loading}=useSiteAuth()
  const [open,setOpen] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const links = section === 'smoke' ? smokeItems : section === 'vape' ? vapeItems : hubItems
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event:KeyboardEvent) => {
      if (event.key === 'Escape'){
        // A language dialog is a separate focus-trapped layer above the drawer.
        if (document.querySelector('.site-language-overlay')) return
        setOpen(false);return
      }
      if (event.key !== 'Tab') return
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], select:not([disabled])')
      if (!focusables?.length) return
      const first = focusables[0], last = focusables[focusables.length-1]
      if (event.shiftKey && document.activeElement === first){event.preventDefault();last.focus()}
      else if (!event.shiftKey && document.activeElement === last){event.preventDefault();first.focus()}
    }
    document.addEventListener('keydown',handleKey)
    drawerRef.current?.querySelector<HTMLButtonElement>('.wolf-drawer-close')?.focus()
    return () => {document.body.style.overflow = previousOverflow;document.removeEventListener('keydown',handleKey);triggerRef.current?.focus()}
  },[open])
  const choose = (item:NavItem) => {
    setOpen(false)
    if (item.internal && onInternalNavigate)onInternalNavigate(item.href)
  }
  return <>
    <header className={'wolf-nav wolf-nav-'+section}>
      <div className="wolf-nav-inner">
        <div className="wolf-nav-start">
          <button ref={triggerRef} className="wolf-icon-btn" type="button" aria-expanded={open} aria-controls="wolf-navigation-drawer" aria-label={tr('Öppna menyn','Open menu')} onClick={()=>setOpen(o=>!o)}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <a className="wolf-site-brand" href={section==='hub'?'/':section==='smoke'?'/smoke-less/':'/vape-calculator/'}><span className="wolf-site-mark" aria-hidden="true">{section==='smoke'?'◎':section==='vape'?<FlaskConical size={22} strokeWidth={2}/>: 'W'}</span><span><strong>{section==='vape'?<>Vape<span className="wolf-site-accent">Calc</span></>:section==='hub'?'WOLFYSLAYER':'Smoke Less'}</strong><small>{section==='smoke'?tr('Din resa, i din takt','Your journey, your pace'):section==='vape'?tr('Beräkna och spara recept','Calculate and save recipes'):tr('DIGITALA PROJEKT','DIGITAL PROJECTS')}</small></span></a>
        </div>
        <div className="wolf-nav-actions">
          <a className="wolf-account-nav" href={section==='smoke'?'/smoke-less/account/':section==='vape'?'/vape-calculator/account/':'/account/'} aria-label={user?tr('Mitt konto','My account'):tr('Logga in','Sign in')}><span className="wolf-account-nav-icon" aria-hidden="true"><UserRound size={22} strokeWidth={2} /></span><span>{loading?'…':user?tr('Mitt konto','My account'):tr('Logga in','Sign in')}</span></a>
          {section==='vape'&&onThemeChange&&<button type="button" className="wolf-icon-btn wolf-nav-theme-toggle" onClick={onThemeChange} aria-label={theme==='dark'?tr('Byt till ljust tema','Switch to light theme'):tr('Byt till mörkt tema','Switch to dark theme')} title={theme==='dark'?tr('Ljust tema','Light theme'):tr('Mörkt tema','Dark theme')}>{theme==='dark'?<Sun size={21}/>:<Moon size={21}/>}</button>}
        </div>
      </div>
    </header>
    <div className={'wolf-nav-shade'+(open?' open':'')} aria-hidden="true" onClick={()=>setOpen(false)}/>
    <aside id="wolf-navigation-drawer" ref={drawerRef} className={'wolf-nav-drawer'+(open?' open':'')} aria-label={tr('Navigering','Navigation')} aria-hidden={!open} inert={!open}>
      <div className="wolf-drawer-top"><span><b>{section==='hub'?'WOLFYSLAYER':section==='smoke'?'Smoke Less':'VapeCalc'}</b><small>{tr('Navigering','Navigation')}</small></span><button type="button" className="wolf-icon-btn wolf-drawer-close" aria-label={tr('Stäng menyn','Close menu')} onClick={()=>setOpen(false)}>✕</button></div>
      <nav aria-label={tr('Huvudmeny','Main menu')} className="wolf-drawer-items">
        {links.map(item=>{
          const active = section==='smoke' ? (item.internal ? currentPath===item.href : window.location.pathname===item.href) : section==='vape' ? window.location.pathname===item.href : (item.href==='/' && window.location.pathname==='/')
          return item.internal && onInternalNavigate ? <button type="button" key={item.href} onClick={()=>choose(item)} aria-current={active?'page':undefined} className={'wolf-drawer-link'+(active?' active':'')}>{tr(item.labelSv,item.labelEn)}<span className="wolf-link-arrow">›</span></button>
            : <a key={item.href} href={item.internal?'/smoke-less/#'+item.href:item.href} onClick={()=>setOpen(false)} aria-current={active?'page':undefined} className={'wolf-drawer-link'+(active?' active':'')}>{tr(item.labelSv,item.labelEn)}<span className="wolf-link-arrow">›</span></a>
        })}
      </nav>
      <div className="wolf-drawer-foot">
        <div className="wolf-drawer-language"><span>{tr('Språk','Language')}</span><SiteLanguageModal section={section} theme={theme}/></div>
        <a className="wolf-drawer-projects" href="/">{tr('Alla projekt','All projects')} <span aria-hidden="true">↗</span></a>
      </div>
    </aside>
  </>
}
