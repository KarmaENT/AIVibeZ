import { createClient } from '@supabase/supabase-js';

// Define a type for our global config object for type safety
interface AppConfig {
  SUPABASE_PROJECT_URL: string;
  SUPABASE_ANON_KEY: string;
  STRIPE_PRO_PLAN_PRICE_ID: string;
}

// Extend the Window interface to inform TypeScript about our custom property
declare global {
  interface Window {
    APP_CONFIG: AppConfig;
  }
}

const supabaseUrl = window.APP_CONFIG?.SUPABASE_PROJECT_URL;
const supabaseAnonKey = window.APP_CONFIG?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const errorDiv = document.getElementById('root');
    if (errorDiv) {
        errorDiv.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: white; font-family: sans-serif;">
                <h1>Configuration Error</h1>
                <p>App configuration (APP_CONFIG) is missing from the window object.</p>
                <p>Please ensure the configuration script in index.html is present and correct.</p>
            </div>
        `;
    }
    throw new Error('Supabase URL and Anon Key must be provided via window.APP_CONFIG.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);