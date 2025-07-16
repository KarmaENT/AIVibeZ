import { supabase } from '../lib/supabaseClient';
import { CodeFile, SubscriptionTier, ChatMessage } from '../types';

// NOTE FOR DEVELOPER: 
// The following functions now call Supabase Edge Functions. You must create
// these functions in your Supabase project. The Edge Functions will be responsible
// for securely calling the Gemini API with your secret API key.

/**
 * Generates application code by calling the 'generate-app-code' Supabase Edge Function.
 * @param {string} prompt - The user's prompt for code generation.
 * @param {SubscriptionTier} tier - The user's subscription tier.
 * @returns {Promise<CodeFile[]>} - A promise that resolves to an array of generated code files.
 */
export const generateAppCode = async (prompt: string, tier: SubscriptionTier): Promise<CodeFile[]> => {
  console.log(`Invoking 'generate-app-code' function for prompt: "${prompt}" with tier: ${tier}`);

  try {
    const { data, error } = await supabase.functions.invoke('generate-app-code', {
      body: { prompt, tier },
    });

    if (error) {
      throw error;
    }
    
    // The Edge Function is expected to return the JSON array of CodeFile objects.
    if (!Array.isArray(data)) {
        console.error("Invalid response from 'generate-app-code' function:", data);
        throw new Error("The server returned an unexpected data format.");
    }

    return data as CodeFile[];
  } catch (error: any) {
    console.error("Error invoking 'generate-app-code' function:", error);
    const errorMessage = error.context?.message || error.message || 'An unknown error occurred while communicating with the server.';
    throw new Error(`Failed to generate code. ${errorMessage}`);
  }
};


/**
 * The 'chatInstance' is no longer managed on the client.
 * Chat history is sent with each request to the backend function.
 */
// This variable is no longer used but kept to avoid breaking imports if needed elsewhere.
let chatInstance: null = null; 

/**
 * Starts or continues a chat conversation by streaming the response from the
 * 'chat-with-assistant' Supabase Edge Function.
 * @param {ChatMessage[]} messages - The history of the chat conversation.
 * @param {CodeFile[]} fileContext - The current file context of the generated code.
 * @returns {AsyncGenerator<{ text: string }>} - An async generator that yields text chunks from the model.
 */
export const startOrContinueChat = async function* (messages: ChatMessage[], fileContext: CodeFile[]): AsyncGenerator<{ text: string }> {
    console.log("Invoking 'chat-with-assistant' stream function.");
    try {
        const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
            body: { messages, fileContext },
        });

        if (error) {
            throw error;
        }

        if (!(data instanceof ReadableStream)) {
            console.error("Invalid response from 'chat-with-assistant' function:", data);
            throw new Error('Expected a ReadableStream response from the function.');
        }

        const reader = data.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const decodedChunk = decoder.decode(value, { stream: true });
            // The frontend component expects an object with a 'text' property.
            yield { text: decodedChunk };
        }

    } catch (e: any) {
        console.error("Error streaming from 'chat-with-assistant' function:", e);
        // Yield a final error message to be displayed in the chat.
        const errorMessage = e.context?.message || e.message || 'Could not connect to the assistant.';
        yield { text: `\n\n[Error: ${errorMessage}]` };
    }
};

/**
 * Resets the chat state. Since chat is stateless (history is sent with each call),
 * this function doesn't need to do anything on the client.
 */
export const resetChat = () => {
    // No client-side state to reset.
    console.log("Chat reset.");
};
