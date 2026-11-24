import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type SiteLanguage = 'sv' | 'en'
type SiteLanguageContext = { language: SiteLanguage; setLanguage: (language: SiteLanguage) => void; tr: (sv: string, en: string) => string }
const Context = createContext<SiteLanguageContext>({language:'sv',setLanguage:()=>{},tr:(sv)=>sv})

export function SiteLocaleProvider({children}:{children:ReactNode}){
  const [language,setState] = useState<SiteLanguage>(() => {
    try {return window.localStorage.getItem('wolfyslayer:language') === 'sv' ? 'sv' : 'en'} catch {return 'sv'}
  })
  useEffect(() => { document.documentElement.lang = language }, [language])
  const setLanguage = (next:SiteLanguage) => {
    setState(next)
    try {window.localStorage.setItem('wolfyslayer:language',next)} catch {}
    document.documentElement.lang = next
  }
  const value = useMemo(() => ({language,setLanguage,tr:(sv:string,en:string)=>language==='en'?en:sv}),[language])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export const useSiteLocale = () => useContext(Context)
