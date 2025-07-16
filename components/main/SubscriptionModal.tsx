import React from 'react';
import { SubscriptionTier } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../constants';
import { Icon } from '../ui/Icon';

interface SubscriptionModalProps {
  currentTier: SubscriptionTier;
  onClose: () => void;
  onUpgrade: () => void;
  isUpgrading: boolean;
  upgradeError: string | null;
}

const PlanCard: React.FC<{
    plan: { name: string; price: string; features: string[] };
    tier: SubscriptionTier;
    isCurrent: boolean;
    onSelect: () => void;
    isUpgrading: boolean;
}> = ({ plan, tier, isCurrent, onSelect, isUpgrading }) => {
    const isPro = tier === SubscriptionTier.Pro;

    return (
        <div className={`rounded-xl border ${isPro ? 'border-primary' : 'border-border'} p-6 bg-surface flex flex-col`}>
             {isPro && <div className="text-xs font-bold text-primary uppercase self-start mb-2 bg-primary/20 px-2 py-0.5 rounded-full">Most Popular</div>}
            <h3 className="text-2xl font-bold text-on-surface">{plan.name}</h3>
            <p className="mt-2 text-on-surface-secondary">{plan.price}</p>
            <ul className="mt-6 space-y-3 text-on-surface-secondary flex-grow">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <Icon name="check-circle" size={16} className="text-green-500" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button 
                onClick={onSelect}
                disabled={isCurrent || (isPro && isUpgrading)}
                className={`mt-8 w-full py-3 font-semibold rounded-lg transition-colors flex items-center justify-center ${
                    isCurrent 
                        ? 'bg-border text-on-surface-secondary cursor-default' 
                        : isPro
                        ? 'bg-primary text-white hover:bg-primary-hover'
                        : 'bg-on-surface text-background hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isPro && isUpgrading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Redirecting...
                    </>
                ) : isCurrent ? 'Current Plan' : tier === SubscriptionTier.Enterprise ? 'Contact Sales' : 'Upgrade'}
            </button>
        </div>
    );
};


export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ currentTier, onClose, onUpgrade, isUpgrading, upgradeError }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-4xl p-8 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-secondary hover:text-on-surface">
            <Icon name="x" size={24}/>
        </button>
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-on-surface">Choose Your Plan</h2>
            <p className="mt-2 text-on-surface-secondary">Unlock more features and power up your development workflow.</p>
        </div>

        {upgradeError && <p className="mt-4 text-center text-red-400">{upgradeError}</p>}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <PlanCard 
                plan={SUBSCRIPTION_PLANS.Free}
                tier={SubscriptionTier.Free}
                isCurrent={currentTier === SubscriptionTier.Free}
                onSelect={() => {}}
                isUpgrading={isUpgrading}
            />
             <PlanCard 
                plan={SUBSCRIPTION_PLANS.Pro}
                tier={SubscriptionTier.Pro}
                isCurrent={currentTier === SubscriptionTier.Pro}
                onSelect={onUpgrade}
                isUpgrading={isUpgrading}
            />
             <PlanCard 
                plan={SUBSCRIPTION_PLANS.Enterprise}
                tier={SubscriptionTier.Enterprise}
                isCurrent={currentTier === SubscriptionTier.Enterprise}
                onSelect={() => { alert('Please contact our sales team for enterprise solutions.'); }}
                isUpgrading={isUpgrading}
            />
        </div>
      </div>
    </div>
  );
};