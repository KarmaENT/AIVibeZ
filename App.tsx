
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { LoginScreen } from './components/auth/LoginScreen';
import { MainScreen } from './components/main/MainScreen';
import { User, SubscriptionTier } from './types';
import { Session } from '@supabase/supabase-js';

// The Profile interface is removed to avoid a "Type instantiation is excessively deep" error
// with Supabase's generics. The profile data will be inferred by the Supabase client and then
// validated against the SubscriptionTier enum.

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      // We will fetch the user profile in the next effect, so set loading false here.
      // The loading screen will show until either a user is fetched or the session is confirmed null.
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        setLoading(true);
        // By removing the explicit generic from `.single()`, we avoid the "Type instantiation is excessively deep" error.
        // Supabase will infer the return type, which we then validate.
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error.message);
          // This can happen if the profile creation trigger hasn't run yet for a new user.
          // Fallback to Free tier.
           setUser({
            id: session.user.id,
            email: session.user.email!,
            subscriptionTier: SubscriptionTier.Free,
          });
        } else if (profile) {
          // The value from the database is a string. We need to ensure it's a valid SubscriptionTier member.
          const tierValue = profile.subscription_tier;
          const subscriptionTier = Object.values(SubscriptionTier).find(t => t === tierValue) || SubscriptionTier.Free;

          setUser({
            id: session.user.id,
            email: session.user.email!,
            subscriptionTier: subscriptionTier,
          });
        }
         setLoading(false);
      } else {
        // No session, no user.
        setUser(null);
        setLoading(false);
      }
    };
      
    fetchUserProfile();
  }, [session]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-on-surface">Loading...</div>;
  }

  if (!session || !user) {
    return <LoginScreen />;
  }

  return <MainScreen user={user} onLogout={handleLogout} />;
};

export default App;
