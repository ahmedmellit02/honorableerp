import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://obdygjagclnxrnwhsfrq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZHlnamFnY2xueHJud2hzZnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTI1NzAsImV4cCI6MjA1MDM2ODU3MH0.JuOO5SXMkJp4RQWJKJoqGZ7n4BReFKlgdTp6J1xYKWM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)