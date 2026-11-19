import { createClient } from '@supabase/supabase-js'
// Same public project and auth storage key as the Wolfyslayer /account/ page.
// Supabase RLS, not this browser code, enforces ownership of stored recipes.
export const supabase=createClient(
  'https://twbwxvtazortlxzxdvtt.supabase.co',
  'sb_publishable_oJgeQX7oAbsrK3v71KKEsQ_wlHrOHtz',
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}
)
