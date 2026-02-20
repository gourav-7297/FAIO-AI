import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';
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
        if (!isSupabaseAvailable || !supabase) return null;
        try {
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
        } catch (err) {
            console.warn('Supabase fetch profile failed:', err);
            return null;
        }
    }, []);

    // Create profile for new user
    const createProfile = useCallback(async (userId: string, username?: string) => {
        if (!isSupabaseAvailable || !supabase) return null;
        try {
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
        } catch (err) {
            console.warn('Supabase create profile failed:', err);
            return null;
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        if (!isSupabaseAvailable || !supabase) {
            // Supabase not available — skip auth init, just stop loading
            setIsLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile);
            }
            setIsLoading(false);
        }).catch((err) => {
            console.warn('Supabase getSession failed:', err);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    setIsGuest(false);
                    const existingProfile = await fetchProfile(session.user.id);
                    if (existingProfile) {
                        setProfile(existingProfile);
                    } else if (event === 'SIGNED_IN') {
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

    // Sign up (Supabase email/password)
    const signUp = async (email: string, password: string, username?: string) => {
        if (!isSupabaseAvailable || !supabase) {
            return { error: new Error('Supabase is not configured. Please use Google sign-in or guest mode.') };
        }
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                return { error };
            }

            if (data.user) {
                await createProfile(data.user.id, username);
            }

            return { error: null };
        } catch (err: any) {
            return { error: new Error(err.message || 'Sign up failed. Please try again.') };
        }
    };

    // Sign in (Supabase email/password)
    const signIn = async (email: string, password: string) => {
        if (!isSupabaseAvailable || !supabase) {
            return { error: new Error('Supabase is not configured. Please use Google sign-in or guest mode.') };
        }
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        } catch (err: any) {
            return { error: new Error(err.message || 'Sign in failed. Please try again.') };
        }
    };

    // Sign in with Google (Firebase only — no Supabase dependency)
    const signInWithGoogle = async () => {
        try {
            const { signInWithPopup } = await import('firebase/auth');
            const { auth: firebaseAuth, googleProvider } = await import('../lib/firebase');
            const result = await signInWithPopup(firebaseAuth, googleProvider);

            const firebaseUser = result.user;
            console.log('Firebase Google sign-in successful:', firebaseUser.email);

            // Set user info from Firebase
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
        // Sign out of Supabase if available
        if (isSupabaseAvailable && supabase) {
            try {
                await supabase.auth.signOut();
            } catch (err) {
                console.warn('Supabase sign-out failed:', err);
            }
        }
        // Sign out of Firebase if user was logged in via Google
        try {
            const { signOut: firebaseSignOut } = await import('firebase/auth');
            const { auth: firebaseAuth } = await import('../lib/firebase');
            await firebaseSignOut(firebaseAuth);
        } catch (err) {
            // Firebase sign-out failed or wasn't needed
        }
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
        if (!isSupabaseAvailable || !supabase) {
            // Just update local state
            setProfile(prev => prev ? { ...prev, ...updates } : null);
            return { error: null };
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates as any)
                .eq('id', user.id);

            if (!error) {
                setProfile(prev => prev ? { ...prev, ...updates } : null);
            }

            return { error };
        } catch (err: any) {
            return { error: new Error(err.message || 'Profile update failed') };
        }
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
