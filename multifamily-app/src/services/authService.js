import { supabase } from './supabaseClient'

export const authService = {
  // Sign up new user with profile creation
  async signUp({ email, password, firstName, lastName, phone, address }) {
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            address
          }
        }
      })
      
      if (authError) throw authError

      // If user was created, create profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              phone,
              address,
              subscription_plan: 'trial',
              subscription_status: 'active'
            }
          ])
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw here - user account was created successfully
        }
      }
      
      return { data: authData, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
  },

  // Sign in existing user
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { data: null, error }
    }
  },

  // Sign out current user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Signout error:', error)
      return { error }
    }
  },

  // Get current user profile
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get profile error:', error)
      return { data: null, error }
    }
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session, error: null }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error }
    }
  },

  // Check if user's trial has expired
  async checkTrialStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('trial_end_date, subscription_status')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      const now = new Date()
      const trialEnd = new Date(data.trial_end_date)
      const isTrialExpired = now > trialEnd
      
      return { 
        data: {
          ...data,
          isTrialExpired,
          daysLeft: Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)))
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Check trial status error:', error)
      return { data: null, error }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser()
  }
}