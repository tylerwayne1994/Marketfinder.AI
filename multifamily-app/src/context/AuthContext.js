import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

// Create Auth Context
const AuthContext = createContext({})

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    authService.getCurrentSession().then(({ session }) => {
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load user profile data
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await authService.getProfile(userId)
      if (data) {
        setProfile(data)
      } else if (error) {
        console.error('Error loading profile:', error)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sign up function
  const signUp = async (userData) => {
    setLoading(true)
    try {
      const result = await authService.signUp(userData)
      return result
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (credentials) => {
    setLoading(true)
    try {
      const result = await authService.signIn(credentials)
      return result
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    setLoading(true)
    try {
      const result = await authService.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      return result
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' }
    
    try {
      const result = await authService.updateProfile(user.id, updates)
      if (result.data) {
        setProfile(result.data)
      }
      return result
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error }
    }
  }

  // Check trial status
  const checkTrialStatus = async () => {
    if (!user) return { error: 'No user logged in' }
    
    try {
      const result = await authService.checkTrialStatus(user.id)
      return result
    } catch (error) {
      console.error('Error checking trial status:', error)
      return { error }
    }
  }

  // Context value
  const value = {
    // State
    user,
    profile,
    session,
    loading,
    
    // Auth functions
    signUp,
    signIn,
    signOut,
    updateProfile,
    checkTrialStatus,
    
    // Helper functions
    isAuthenticated: !!user,
    isLoading: loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}