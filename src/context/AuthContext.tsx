import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabaseUntyped as supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    isGuest: boolean;
    signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    loginAsGuest: () => void;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Guest mode
    const [isGuest, setIsGuest] = useState(false);

    // Fetch user profile
    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    }, []);

    // Create profile for new user
    const createProfile = useCallback(async (userId: string, username?: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                username: username || `traveler_${userId.slice(0, 8)}`,
                preferences: {},
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            return null;
        }
        return data;
    }, []);

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile);
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    setIsGuest(false); // Disable guest mode if user logs in
                    const existingProfile = await fetchProfile(session.user.id);
                    if (existingProfile) {
                        setProfile(existingProfile);
                    } else if (event === 'SIGNED_IN') {
                        // Create profile for new users
                        const newProfile = await createProfile(session.user.id);
                        setProfile(newProfile);
                    }
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile, createProfile]);

    // Sign up
    const signUp = async (email: string, password: string, username?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return { error };
        }

        // Create profile after signup
        if (data.user) {
            await createProfile(data.user.id, username);
        }

        return { error: null };
    };

    // Sign in
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    // Sign in with Google (Firebase)
    const signInWithGoogle = async () => {
        try {
            const { signInWithPopup } = await import('firebase/auth');
            const { auth: firebaseAuth, googleProvider } = await import('../lib/firebase');
            const result = await signInWithPopup(firebaseAuth, googleProvider);

            // User signed in successfully via Firebase
            const firebaseUser = result.user;
            console.log('Firebase Google sign-in successful:', firebaseUser.email);

            // Also try to sign the user into Supabase for profile/data consistency
            // If you only want Firebase auth, you can remove this block
            if (firebaseUser.email) {
                try {
                    // Try signing in with Supabase using email (best-effort)
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: window.location.origin,
                            skipBrowserRedirect: true,
                        },
                    });
                } catch (supabaseErr) {
                    console.warn('Supabase sync skipped:', supabaseErr);
                }
            }

            // Set user info from Firebase as a fallback
            setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                app_metadata: {},
                user_metadata: {
                    full_name: firebaseUser.displayName,
                    avatar_url: firebaseUser.photoURL,
                },
                aud: 'authenticated',
                created_at: firebaseUser.metadata.creationTime || '',
            } as any);
            setIsGuest(false);

            return { error: null };
        } catch (err: any) {
            console.error('Firebase Google sign-in error:', err);
            return { error: err instanceof Error ? err : new Error(err.message || 'Google sign-in failed') };
        }
    };

    // Sign as Guest
    const loginAsGuest = () => {
        setIsGuest(true);
    };

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsGuest(false);
    };

    // Update profile
    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) {
            return { error: new Error('Not authenticated') };
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates as any)
            .eq('id', user.id);

        if (!error) {
            setProfile(prev => prev ? { ...prev, ...updates } : null);
        }

        return { error };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                isGuest,
                signUp,
                signIn,
                signInWithGoogle,
                loginAsGuest,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
