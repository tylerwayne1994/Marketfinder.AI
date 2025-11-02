// src/ResetPasswordPage.js
import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function ResetPasswordPage({ setCurrentPage }) {
  const [ready, setReady] = useState(false);   // show form only when session is valid
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    let unsub = supabase.auth.onAuthStateChange((event, session) => {
      // Supabase fires this when the user opens the email reset link
      if (event === 'PASSWORD_RECOVERY' || session) setReady(!!session);
    }).data.subscription;

    // Also handle refresh / direct load (session might already be present)
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));

    return () => unsub?.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!pw1 || pw1.length < 6) { setErr('Password must be at least 6 characters'); return; }
    if (pw1 !== pw2) { setErr('Passwords do not match'); return; }

    // Extra guard—make sure session exists
    const { data } = await supabase.auth.getSession();
    if (!data?.session) { setErr('Session missing. Open the password reset email link again.'); return; }

    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) { setErr(error.message); return; }

    setOk('Password updated. Redirecting to login…');
    
    // Clear recovery lock to prevent redirect loop
    localStorage.removeItem('terra_recovery_lock');
    
    setTimeout(() => setCurrentPage?.('login'), 1200);
  };

  if (!ready) {
    // If you see this after clicking the email link, your Supabase Redirect URLs are wrong.
    return (
      <div style={{display:'grid',placeItems:'center',minHeight:'100vh',background:'#fff',color:'#000'}}>
        <div>
          <h2>Reset Password</h2>
          <p>Open this page from the reset email link. If you already did and still see this, fix Supabase Redirect URLs.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:'grid',placeItems:'center',minHeight:'100vh',background:'#fff',color:'#000'}}>
      <form onSubmit={submit} style={{width:360, padding:24, border:'1px solid #eee', borderRadius:8}}>
        <h2 style={{marginBottom:16}}>Set a New Password</h2>
        <label>New password</label>
        <input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} minLength={6} required style={{width:'100%',margin:'6px 0 12px'}} />
        <label>Confirm password</label>
        <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} minLength={6} required style={{width:'100%',margin:'6px 0 12px'}} />
        {err && <div style={{color:'#b91c1c', marginBottom:8}}>{err}</div>}
        {ok && <div style={{color:'#065f46', marginBottom:8}}>{ok}</div>}
        <button type="submit" style={{width:'100%', padding:'10px 12px'}}>Update Password</button>
      </form>
    </div>
  );
}
