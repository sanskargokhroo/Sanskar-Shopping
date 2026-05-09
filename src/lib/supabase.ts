import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubhrlhhadagfphcgzgvi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaHJsaGhhZGFnZnBoY2d6Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTEyMjksImV4cCI6MjA5Mzg2NzIyOX0.7nLaD6hzfvN91DR1ng9abU-riZIoa-Xytl4i7dIihIc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
