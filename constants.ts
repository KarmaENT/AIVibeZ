
import { SubscriptionTier } from './types';

export const SUBSCRIPTION_PLANS = {
  [SubscriptionTier.Free]: {
    name: 'Free',
    price: '$0/mo',
    features: ['10 prompts per day', 'Standard code generation', 'Community support'],
  },
  [SubscriptionTier.Pro]: {
    name: 'Pro',
    price: '$20/mo',
    features: ['Unlimited prompts', 'Advanced code generation', 'Priority support', 'Advanced AI models'],
  },
  [SubscriptionTier.Enterprise]: {
    name: 'Enterprise',
    price: 'Contact Us',
    features: ['All Pro features', 'Team collaboration', 'Dedicated infrastructure', 'Custom integrations'],
  },
};