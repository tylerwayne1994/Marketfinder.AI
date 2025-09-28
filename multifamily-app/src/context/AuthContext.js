import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginService, signup as signupService, signOut, getSession } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    const user = await loginService(email, password);
    setUser(user);
    return user;
  };

  const signup = async (email, password, profile) => {
    const user = await signupService(email, password, profile);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}