import React, { useState } from 'react';
import { User, CodeFile, SubscriptionTier } from '../../types';
import { generateAppCode, resetChat } from '../../services/geminiService';
import { supabase } from '../../lib/supabaseClient';
import { PromptInput } from './PromptInput';
import { StudioView } from './StudioView';
import { SubscriptionModal } from './SubscriptionModal';
import { Icon } from '../ui/Icon';

interface MainScreenProps {
  user: User;
  onLogout: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ user, onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<CodeFile[] | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  
  const handleGenerate = async (prompt: string) => {
    const isProFeature = /(^|\s)(advanced|complex|enterprise|multi-page)(\s|$)/i.test(prompt);
    if (isProFeature && user.subscriptionTier === SubscriptionTier.Free) {
        setError("This feature requires a Pro subscription. Please upgrade your plan to generate complex applications.");
        setSubscriptionModalOpen(true);
        return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPrompt(prompt);
    try {
      const code = await generateAppCode(prompt, user.subscriptionTier);
      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    setGeneratedCode(null);
    setCurrentPrompt('');
    setError(null);
    resetChat();
  };

  const handleUpgradeToPro = async () => {
      setIsUpgrading(true);
      setError(null);
      try {
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
              body: { 
                  priceId: window.APP_CONFIG.STRIPE_PRO_PLAN_PRICE_ID,
                  successUrl: window.location.href,
                  cancelUrl: window.location.href,
              },
          });

          if (error) throw error;
          
          if (data.url) {
              window.location.href = data.url;
          } else {
              throw new Error("Could not retrieve the Stripe checkout URL.");
          }
      } catch (e: any) {
          console.error("Stripe checkout error:", e);
          const errorMessage = e.context?.message || e.message || "Could not initiate subscription upgrade. Please contact support.";
          setError(errorMessage);
          // Keep the modal open to show the error
      } finally {
        setIsUpgrading(false);
      }
  };


  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
            <Icon name="box" className="text-primary" size={28}/>
            <h1 className="text-xl font-bold">AI Studio</h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setSubscriptionModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-on-surface-secondary hover:text-on-surface transition-colors">
                <Icon name="gem" size={16} className={user.subscriptionTier === SubscriptionTier.Pro ? 'text-yellow-400' : ''}/>
                <span>{user.subscriptionTier} Plan</span>
            </button>
            <span className="text-sm text-on-surface-secondary hidden sm:inline">{user.email}</span>
            <button onClick={onLogout} className="text-sm text-on-surface-secondary hover:text-on-surface">
                <Icon name="log-out" size={20}/>
            </button>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto">
        {generatedCode ? (
          <StudioView 
            prompt={currentPrompt} 
            files={generatedCode} 
            onNewProject={handleNewProject} 
            userTier={user.subscriptionTier}
            onOpenUpgrade={() => setSubscriptionModalOpen(true)}
          />
        ) : (
          <PromptInput 
            onGenerate={handleGenerate} 
            isLoading={isLoading}
            error={error}
          />
        )}
      </main>

      {isSubscriptionModalOpen && (
          <SubscriptionModal
              currentTier={user.subscriptionTier}
              onClose={() => setSubscriptionModalOpen(false)}
              onUpgrade={handleUpgradeToPro}
              isUpgrading={isUpgrading}
              upgradeError={error}
          />
      )}
    </div>
  );
};