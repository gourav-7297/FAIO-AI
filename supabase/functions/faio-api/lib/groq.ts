/**
 * Groq AI client — server-side only.
 * Uses Deno.env to access the secret key (never exposed to the browser).
 */

import OpenAI from 'https://esm.sh/openai@4.56.0';

let client: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  if (!client) {
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) throw new Error('GROQ_API_KEY is not set in Supabase Secrets');
    client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return client;
}

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
export const VISION_MODEL = 'llama-3.2-90b-vision-preview';
