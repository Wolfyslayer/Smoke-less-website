import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Language = 'sv' | 'en'
export type Theme = 'dark' | 'light'
type Preferences = { lang: Language; setLang: (next: Language) => void; theme: Theme; toggleTheme: () => void }
const PreferencesContext = createContext<Preferences | null>(null)
const getSetting = (key: string) => { try { return localStorage.getItem(key) } catch { return null } }

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => getSetting('wolfyslayer-language') === 'en' ? 'en' : 'sv')
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = getSetting('wolfyslayer-theme')
    return saved === 'light' ? 'light' : 'dark'
  })
  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem('wolfyslayer-language', lang) } catch { /* storage optional */ }
  }, [lang])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('wolfyslayer-theme', theme) } catch { /* storage optional */ }
  }, [theme])
  return <PreferencesContext.Provider value={{ lang, setLang, theme, toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark') }}>{children}</PreferencesContext.Provider>
}
export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('PreferencesProvider missing')
  return context
}
export function useTranslate() {
  const { lang } = usePreferences()
  return (sv: string, en: string) => lang === 'sv' ? sv : en
}
