// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Expect these to be set in your environment (local .env and your host dashboard)
// CRA/Vercel-style prefix:
const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Fail fast, surfaces misconfig during build/runtime
  // (You can remove this throw once you've verified envs are set)
  throw new Error('Missing Supabase env vars: REACT_APP_SUPABASE_URL and/or REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,   // keep session in local storage
    autoRefreshToken: true, // refresh JWT automatically
    detectSessionInUrl: true,
  },
});
