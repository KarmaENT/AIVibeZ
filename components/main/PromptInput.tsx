
import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';
import { Icon } from '../ui/Icon';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading, error }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt && !isLoading) {
      onGenerate(prompt);
    }
  };

  const suggestions = [
      "A simple to-do list app with a clean interface.",
      "A weather dashboard that shows the 5-day forecast.",
      "An image gallery with a search bar.",
      "A personal blog layout with a sidebar for recent posts."
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-on-surface sm:text-5xl">Bring Your Idea to Life</h2>
        <p className="mt-4 text-lg text-on-surface-secondary">
          Describe the web application you want to build. Our AI will generate the foundational code for you.
        </p>
        
        <form onSubmit={handleSubmit} className="mt-10">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A pomodoro timer with start, stop, and reset buttons."
            className="w-full h-32 p-4 text-base bg-surface border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt || isLoading}
            className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover focus:ring-offset-background"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating...
              </>
            ) : (
                <>
                    <Icon name="wand-sparkles" size={20} className="mr-2"/>
                    Generate App
                </>
            )}
          </button>
        </form>

        {error && <p className="mt-4 text-red-400">{error}</p>}

        <div className="mt-16 text-left">
            <h3 className="text-lg font-semibold text-on-surface">Not sure where to start? Try one of these:</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setPrompt(s)} className="p-4 bg-surface rounded-lg text-left hover:bg-border transition-colors text-on-surface-secondary">
                        {s}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};