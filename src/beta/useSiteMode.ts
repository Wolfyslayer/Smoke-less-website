import { useEffect, useState } from 'react'
import { supabase } from './client'

export type SiteMode = 'closed' | 'beta' | 'release'

// Safe default: no public or beta access until a verified mode is returned.
export function useSiteMode() {
  const [mode, setMode] = useState<SiteMode>('closed')
  useEffect(() => {
    let active = true
    async function refresh() {
      try {
        const { data, error } = await supabase.from('beta_public_mode').select('mode').single()
        if (!active) return
        if (error) throw error
        setMode(data?.mode === 'beta' || data?.mode === 'release' ? data.mode : 'closed')
      } catch { if (active) setMode('closed') }
    }
    void refresh()
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    const timer = window.setInterval(refresh, 30000)
    return () => { active = false; window.removeEventListener('focus', onFocus); window.clearInterval(timer) }
  }, [])
  return mode
}
