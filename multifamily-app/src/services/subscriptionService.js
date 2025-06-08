import { supabase } from './supabaseClient'
import { stripeConfig } from './stripeClient'

export const subscriptionService = {
  // Create Stripe Customer and Checkout Session
  async createCheckoutSession({ priceId, userId, successUrl, cancelUrl }) {
    try {
      // Call your backend API to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl,
          cancelUrl
        })
      })

      const { sessionId, error } = await response.json()
      
      if (error) throw new Error(error)
      
      return { sessionId, error: null }
    } catch (error) {
      console.error('Create checkout session error:', error)
      return { sessionId: null, error }
    }
  },

  // Get user's current subscription
  async getCurrentSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      
      return { data: data || null, error: null }
    } catch (error) {
      console.error('Get subscription error:', error)
      return { data: null, error }
    }
  },

  // Get user's plan limits and features
  async getUserPlanLimits(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_plan_limits', { user_uuid: userId })
        .single()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Get plan limits error:', error)
      return { data: null, error }
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      })

      const { success, error } = await response.json()
      
      if (error) throw new Error(error)
      
      return { success, error: null }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return { success: false, error }
    }
  },

  // Resume subscription
  async resumeSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      })

      const { success, error } = await response.json()
      
      if (error) throw new Error(error)
      
      return { success, error: null }
    } catch (error) {
      console.error('Resume subscription error:', error)
      return { success: false, error }
    }
  },

  // Change subscription plan
  async changeSubscriptionPlan(subscriptionId, newPriceId) {
    try {
      const response = await fetch('/api/change-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscriptionId, 
          newPriceId 
        })
      })

      const { success, error } = await response.json()
      
      if (error) throw new Error(error)
      
      return { success, error: null }
    } catch (error) {
      console.error('Change subscription error:', error)
      return { success: false, error }
    }
  },

  // Get payment history
  async getPaymentHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Get payment history error:', error)
      return { data: null, error }
    }
  },

  // Check if user has access to feature
  async checkFeatureAccess(userId, feature) {
    try {
      const { data: limits, error } = await this.getUserPlanLimits(userId)
      
      if (error) throw error
      
      switch (feature) {
        case 'property_scraper':
          return limits.has_property_scraper
        case 'market_heatmap':
          return limits.has_market_heatmap
        case 'api_access':
          return limits.has_api_access
        default:
          return false
      }
    } catch (error) {
      console.error('Check feature access error:', error)
      return false
    }
  },

  // Check usage limits
  async checkUsageLimit(userId, limitType) {
    try {
      const { data: limits, error } = await this.getUserPlanLimits(userId)
      
      if (error) throw error
      
      // Get current usage from database
      let currentUsage = 0
      
      switch (limitType) {
        case 'properties':
          const { count: propCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
          currentUsage = propCount || 0
          return {
            limit: limits.max_properties,
            current: currentUsage,
            canUse: limits.max_properties === -1 || currentUsage < limits.max_properties
          }
          
        case 'analyses':
          // Get analyses this month
          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)
          
          const { count: analysisCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString())
          
          currentUsage = analysisCount || 0
          return {
            limit: limits.max_analyses_per_month,
            current: currentUsage,
            canUse: limits.max_analyses_per_month === -1 || currentUsage < limits.max_analyses_per_month
          }
          
        case 'documents':
          // Get documents this month
          const monthStart = new Date()
          monthStart.setDate(1)
          monthStart.setHours(0, 0, 0, 0)
          
          const { count: docCount } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', monthStart.toISOString())
          
          currentUsage = docCount || 0
          return {
            limit: limits.max_documents_per_month,
            current: currentUsage,
            canUse: limits.max_documents_per_month === -1 || currentUsage < limits.max_documents_per_month
          }
          
        default:
          return { limit: 0, current: 0, canUse: false }
      }
    } catch (error) {
      console.error('Check usage limit error:', error)
      return { limit: 0, current: 0, canUse: false }
    }
  },

  // Get plan details by price ID
  getPlanDetails(priceId) {
    const plans = {
      [stripeConfig.priceIds.starter]: {
        name: 'Starter',
        price: 49,
        features: ['Up to 5 properties', '10 analyses/month', 'Basic support']
      },
      [stripeConfig.priceIds.professional]: {
        name: 'Professional', 
        price: 149,
        features: ['Up to 50 properties', 'Unlimited analyses', 'Property scraper', 'Priority support']
      },
      [stripeConfig.priceIds.enterprise]: {
        name: 'Enterprise',
        price: 499,
        features: ['Unlimited properties', 'All features', 'Team tools', 'Dedicated support']
      }
    }
    
    return plans[priceId] || null
  }
}