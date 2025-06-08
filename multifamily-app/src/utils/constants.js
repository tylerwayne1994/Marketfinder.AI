// Subscription plans
export const SUBSCRIPTION_PLANS = {
  TRIAL: 'trial',
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
}

// Subscription status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due'
}

// Trial duration (in days)
export const TRIAL_DURATION_DAYS = 3

// App routes
export const ROUTES = {
  LANDING: 'landing',
  HOME: 'home',
  DASHBOARD: 'dashboard',
  UNDERWRITE: 'underwrite',
  PROPERTY_SCRAPER: 'propertyScrape',
  MARKET_HEAT_MAP: 'marketHeatMap',
  DOCUMENT_GENERATOR: 'documentGenerator',
  SETTINGS: 'settings'
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  SIGNUP_FAILED: 'Failed to create account. Please try again.',
  SIGNIN_FAILED: 'Invalid email or password.',
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.'
}