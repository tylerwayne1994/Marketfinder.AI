import { supabase } from '../lib/supabase';

export const checkFeatureAccess = async (userId, feature) => {
  // Get user's subscription plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status')
    .eq('id', userId)
    .single();

  if (profile.subscription_status !== 'active') {
    return { allowed: false, reason: 'Subscription not active' };
  }

  // Get plan limits
  const { data: limits } = await supabase
    .from('subscription_limits')
    .select('*')
    .eq('plan_name', profile.subscription_plan)
    .single();

  switch (feature) {
    case 'ai_parsing':
      return { 
        allowed: limits.ai_parsing_access,
        reason: limits.ai_parsing_access ? null : 'AI parsing not included in plan'
      };
    
    case 'underwriting':
      return { allowed: true }; // All plans have this
    
    default:
      return { allowed: false, reason: 'Unknown feature' };
  }
};