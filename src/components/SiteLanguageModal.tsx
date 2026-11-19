import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSiteLocale } from '../SiteLocale'
import './site-language-modal.css'

export default function SiteLanguageModal({section,theme='dark'}:{section:'hub'|'smoke';theme?:'dark'|'light'}) {
  const {language,setLanguage,tr}=useSiteLocale()
  const [open,setOpen]=useState(false)
  const titleId=useId()
  const trigger=useRef<HTMLButtonElement>(null)
  const panel=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if(!open)return
    const previous=document.activeElement as HTMLElement|null
    const originalOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    panel.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus()
    function keyDown(event:KeyboardEvent) {
      if(event.key==='Escape'){event.preventDefault();setOpen(false);return}
      if(event.key!=='Tab')return
      const all=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled])')??[])
      if(!all.length)return
      const first=all[0],last=all[all.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    document.addEventListener('keydown',keyDown)
    return()=>{
      document.body.style.overflow=originalOverflow
      document.removeEventListener('keydown',keyDown)
      if(previous?.isConnected)previous.focus()
      else trigger.current?.focus()
    }
  },[open])

  const choose=(next:'sv'|'en')=>{setLanguage(next);setOpen(false)}
  return <>
    <button ref={trigger} type="button" className="site-language-trigger" aria-haspopup="dialog"
      aria-expanded={open} onClick={()=>setOpen(true)} aria-label={tr('Välj språk','Choose language')}>
      <span aria-hidden="true">{language==='sv'?'🇸🇪':'🇬🇧'}</span>
      <span className="site-language-code">{language.toUpperCase()}</span>
      <span aria-hidden="true">⌄</span>
    </button>
    {open&&createPortal(
      <div className={'site-language-overlay site-language-'+section+(theme==='light'?' light':'')}
        onPointerDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
        <div ref={panel} className="site-language-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <div className="site-language-header"><div><span className="site-language-overline">WOLFYSLAYER / LANGUAGE</span><h2 id={titleId}>{tr('Välj språk','Choose language')}</h2></div>
            <button className="site-language-close" type="button" aria-label={tr('Stäng','Close')} onClick={()=>setOpen(false)}>✕</button></div>
          <p>{tr('Vilket språk vill du använda?','Which language would you like to use?')}</p>
          <div className="site-language-options">
            <button type="button" lang="sv" aria-pressed={language==='sv'} onClick={()=>choose('sv')}><span className="site-language-flag">🇸🇪</span><span><strong>Svenska</strong><small>Swedish</small></span><span className="site-language-check">{language==='sv'?'✓':''}</span></button>
            <button type="button" lang="en" aria-pressed={language==='en'} onClick={()=>choose('en')}><span className="site-language-flag">🇬🇧</span><span><strong>English</strong><small>Engelska</small></span><span className="site-language-check">{language==='en'?'✓':''}</span></button>
          </div>
          <span className="site-language-note">{tr('Ditt språkval sparas på denna enhet.','Your choice is saved on this device.')}</span>
        </div>
      </div>,document.body)}
  </>
}
