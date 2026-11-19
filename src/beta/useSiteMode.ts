import { useEffect, useState } from 'react'
import { supabase } from './client'

export type SiteMode = 'closed' | 'beta' | 'release'
// Errors and missing tables must never enable beta or release access.
export function useSiteMode() {
  const [mode, setMode] = useState<SiteMode>('closed')
  useEffect(() => {
    let active = true
    void supabase.from('beta_public_mode').select('mode').single().then(({data,error}) => {
      if (!active) return
      if (error) {setMode('closed'); return}
      setMode(data?.mode === 'beta' || data?.mode === 'release' ? data.mode : 'closed')
    }).catch(() => {if (active) setMode('closed')})
    return () => {active = false}
  }, [])
  return mode
}
