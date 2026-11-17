import { createClient } from '@supabase/supabase-js'

// Publishable key is intended for browsers. Authorization MUST come from RLS.
export const supabase = createClient(
  'https://twbwxvtazortlxzxdvtt.supabase.co',
  'sb_publishable_oJgeQX7oAbsrK3v71KKEsQ_wlHrOHtz',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
)
