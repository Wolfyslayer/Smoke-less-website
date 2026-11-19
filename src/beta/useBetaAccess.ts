import { useEffect, useState } from 'react'
import { supabase } from './client'
import type { SiteMode } from './useSiteMode'

export type BetaStatus = 'pending' | 'approved' | 'rejected' | 'revoked'
export type BetaApplication = {
  user_id: string
  status: BetaStatus
  message: string
  created_at: string
}
type Access = {
  loading: boolean
  configured: boolean
  mode: SiteMode
  admin: boolean
  application: BetaApplication | null
}
const closed: Access = {loading:true,configured:false,mode:'closed',admin:false,application:null}

export function useBetaAccess(userId: string | null | undefined) {
  const [access,setAccess] = useState<Access>(closed)
  const [refreshKey,setRefreshKey] = useState(0)
  useEffect(() => {
    let active=true
    setAccess(closed)
    const fetchAccess=async () => {
      try {
        const modeResult=await supabase.from('beta_public_mode').select('mode').single()
        if (modeResult.error) throw modeResult.error
        const mode: SiteMode = modeResult.data?.mode === 'beta' || modeResult.data?.mode === 'release' ? modeResult.data.mode : 'closed'
        if (!userId) {
          if(active)setAccess({loading:false,configured:true,mode,admin:false,application:null})
          return
        }
        const [app,role]=await Promise.all([
          supabase.from('beta_applications').select('user_id,status,message,created_at').eq('user_id',userId).maybeSingle(),
          supabase.from('beta_admins').select('user_id').eq('user_id',userId).maybeSingle(),
        ])
        if(app.error||role.error)throw app.error||role.error
        if(active)setAccess({loading:false,configured:true,mode,admin:!!role.data,application:app.data as BetaApplication|null})
      } catch {
        // Missing migrations, denied rows and network errors all fail closed.
        if(active)setAccess({loading:false,configured:false,mode:'closed',admin:false,application:null})
      }
    }
    void fetchAccess()
    return()=>{active=false}
  },[userId,refreshKey])
  return {...access,refresh:()=>setRefreshKey(value=>value+1)}
}
