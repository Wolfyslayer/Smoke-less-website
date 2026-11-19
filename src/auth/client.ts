import { createClient } from '@supabase/supabase-js'

// Public browser credentials from the existing Supabase beta portal.
// No service-role key or privileged credential is ever used in the browser.
export const supabase = createClient(
  'https://twbwxvtazortlxzxdvtt.supabase.co',
  'sb_publishable_oJgeQX7oAbsrK3v71KKEsQ_wlHrOHtz',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } },
)
