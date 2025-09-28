import { supabase } from '../lib/supabase';

export async function signup(email, password, profile = {}) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Optionally insert profile row after signup
  if (data?.user && profile) {
    await supabase.from('profiles').insert([{ id: data.user.id, ...profile }]);
  }
  return data?.user;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data?.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getSession() {
  return supabase.auth.getSession();
}
