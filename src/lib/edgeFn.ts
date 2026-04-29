/**
 * Edge Function client — shared helper for calling the faio-api Edge Function.
 * All frontend services that previously used API keys should use this instead.
 */

import { supabase } from './supabase';

const FUNCTION_NAME = 'faio-api';

interface EdgeFnOptions {
  method?: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}

/**
 * Calls the faio-api Edge Function.
 *
 * For GET requests, query params are appended to the URL.
 * For POST requests, the body is sent as JSON.
 *
 * The Supabase client automatically attaches the user's JWT token.
 */
export async function callEdgeFn<T = unknown>(options: EdgeFnOptions): Promise<T> {
  const { method = 'POST', path, body, query } = options;

  // Build the full path with query params for GET requests
  let fullPath = path;
  if (query) {
    const params = new URLSearchParams(query);
    fullPath += `?${params.toString()}`;
  }

  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    method,
    body: method === 'POST' ? { ...body, _path: fullPath } : undefined,
    headers: {
      'x-edge-path': fullPath,
    },
  });

  if (error) {
    console.error(`Edge Function error (${path}):`, error);
    throw error;
  }

  return data as T;
}

/**
 * Direct fetch to the Edge Function URL (for cases where supabase.functions.invoke
 * doesn't support the method/routing we need).
 */
export async function fetchEdgeFn<T = unknown>(options: EdgeFnOptions): Promise<T> {
  const { method = 'GET', path, body, query } = options;

  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  // Get the session token for Authorization
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // Build the full URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let url = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}${path}`;
  if (query) {
    const params = new URLSearchParams(query);
    url += `?${params.toString()}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': anonKey,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Edge Function error ${response.status}: ${errBody}`);
  }

  return response.json();
}
