import React, { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { X, Check, CreditCard, Clock, Star } from 'lucide-react'
import { stripePromise, stripeConfig } from '../services/stripeClient'
import { subscriptionService } from '../services/subscriptionService'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../App'

const SubscriptionModal = ({ isOpen, onClose, selectedPlan = 'professional' }) => {
  const { currentTheme, currentAccent } = useTheme()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const plans = {
    starter: {
      name: 'Starter',
      price: '$49',
      priceId: stripeConfig.priceIds.starter,
      description: 'Perfect for individual investors',
      features: [
        'Up to 5 property tracking',
        '10 property analyses per month',
        'Basic market heat map',
        '5 document generations per month',
        'Email support'
      ],
      popular: false
    },
    professional: {
      name: 'Professional',
      price: '$149',
      priceId: stripeConfig.priceIds.professional,
      description: 'For serious real estate investors',
      features: [
        'Up to 50 property tracking',
        'Unlimited property analyses',
        'Advanced market heat map',
        'Property scraping tools',
        'Unlimited document generation',
        'Priority support',
        'API access'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: '$499',
      priceId: stripeConfig.priceIds.enterprise,
      description: 'For investment firms and teams',
      features: [
        'Unlimited property tracking',
        'All Professional features',
        'Team collaboration tools',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        'Custom training sessions'
      ],
      popular: false
    }
  }

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    },
    modal: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '0',
      width: '100%',
      maxWidth: '900px',
      maxHeight: '90vh',
      overflow: 'hidden',
      border: `1px solid ${currentTheme.borderColor}`,
      position: 'relative'
    },
    header: {
      padding: '32px 48px 24px',
      borderBottom: `1px solid ${currentTheme.borderColor}`,
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '24px',
      right: '24px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: currentTheme.textSecondary,
      padding: '8px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '8px'
    },
    subtitle: {
      color: currentTheme.textSecondary
    },
    content: {
      padding: '32px 48px',
      overflowY: 'auto',
      maxHeight: 'calc(90vh - 200px)'
    },
    planGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    planCard: {
      background: currentTheme.background,
      border: `2px solid ${currentTheme.borderColor}`,
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    planCardSelected: {
      borderColor: currentAccent.primary,
      boxShadow: `0 0 0 3px rgba(${currentAccent.primary.match(/\d+/g).slice(0,3).join(',')}, 0.1)`
    },
    popularBadge: {
      position: 'absolute',
      top: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    planName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: currentTheme.textPrimary,
      marginBottom: '4px'
    },
    planPrice: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '8px'
    },
    planDescription: {
      color: currentTheme.textSecondary,
      fontSize: '0.875rem',
      marginBottom: '16px'
    },
    featuresList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
      color: currentTheme.textPrimary
    },
    trialBanner: {
      background: `linear-gradient(135deg, ${currentAccent.primary}15, ${currentAccent.secondary}15)`,
      border: `1px solid ${currentAccent.primary}30`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    trialText: {
      color: currentTheme.textPrimary,
      fontSize: '0.875rem'
    },
    checkoutButton: {
      width: '100%',
      padding: '16px',
      borderRadius: '8px',
      border: 'none',
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      opacity: loading ? 0.6 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    errorMessage: {
      background: '#fee2e2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '0.875rem'
    }
  }

  const handleSelectPlan = async (planKey) => {
    const plan = plans[planKey]
    if (!plan || !user) return

    setLoading(true)
    setError('')

    try {
      // Create checkout session
      const { sessionId, error } = await subscriptionService.createCheckoutSession({
        priceId: plan.priceId,
        userId: user.id,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`
      })

      if (error) {
        setError(error.message || 'Failed to create checkout session')
        return
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })

      if (stripeError) {
        setError(stripeError.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
          
          <h2 style={styles.title}>Choose Your Plan</h2>
          <p style={styles.subtitle}>
            Upgrade your account to unlock powerful features and scale your real estate investments
          </p>
        </div>

        <div style={styles.content}>
          {/* Trial Banner */}
          <div style={styles.trialBanner}>
            <Clock size={20} color={currentAccent.primary} />
            <div style={styles.trialText}>
              <strong>3-Day Free Trial</strong> • No credit card required • Cancel anytime during trial
            </div>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Plan Selection */}
          <div style={styles.planGrid}>
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                style={{
                  ...styles.planCard,
                  ...(selectedPlan === key ? styles.planCardSelected : {})
                }}
                onClick={() => !loading && handleSelectPlan(key)}
              >
                {plan.popular && (
                  <div style={styles.popularBadge}>
                    <Star size={12} />
                    Most Popular
                  </div>
                )}
                
                <h3 style={styles.planName}>{plan.name}</h3>
                <div style={styles.planPrice}>{plan.price}<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span></div>
                <p style={styles.planDescription}>{plan.description}</p>

                <div style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <div key={index} style={styles.feature}>
                      <Check size={14} color={currentAccent.primary} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Button */}
          <button
            style={styles.checkoutButton}
            onClick={() => handleSelectPlan(selectedPlan)}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <CreditCard size={20} />
            {loading ? 'Processing...' : 'Start 3-Day Free Trial'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: currentTheme.textSecondary }}>
            Secure payment powered by Stripe • Cancel anytime
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal