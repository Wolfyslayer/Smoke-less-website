import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './client'

type AuthContextValue = { user: User | null; loading: boolean }
const Context = createContext<AuthContextValue>({user:null,loading:true})

export function SiteAuthProvider({children}:{children:ReactNode}) {
  const [user,setUser] = useState<User|null>(null)
  const [loading,setLoading] = useState(true)
  useEffect(()=>{
    let active=true
    // No awaited Supabase calls within the auth-state callback.
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(active){setUser(session?.user??null);setLoading(false)}
    })
    void supabase.auth.getUser().then(({data,error})=>{
      if(active){setUser(error?null:(data.user??null));setLoading(false)}
    }).catch(()=>{if(active){setUser(null);setLoading(false)}})
    return()=>{active=false;subscription.unsubscribe()}
  },[])
  return <Context.Provider value={{user,loading}}>{children}</Context.Provider>
}
export function useSiteAuth(){return useContext(Context)}
