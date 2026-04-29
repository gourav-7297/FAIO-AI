/**
 * Auth middleware — verifies the Supabase JWT from the Authorization header.
 * Returns the authenticated user or null for guest access.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthUser {
  id: string;
  email?: string;
}

/**
 * Extracts and verifies the user from the Authorization header.
 * Returns null if no valid token is provided (guest mode).
 */
export async function getUser(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return { id: user.id, email: user.email };
}
