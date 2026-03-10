import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseServiceKey) {
  throw new Error('Missing VITE_SUPABASE_SERVICE_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})
