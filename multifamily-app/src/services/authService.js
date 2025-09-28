import { supabase } from '../lib/supabase';

export async function signUp({ email, password, ...profile }) {
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Optionally insert profile row after signup
  if (user && profile) {
    await supabase.from('profiles').insert([{ id: user.id, ...profile }]);
  }
  return user;
}

export async function signIn({ email, password }) {
  const { user, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getSession() {
  return supabase.auth.getSession();
}
