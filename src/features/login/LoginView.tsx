import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Plane, Globe, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Mode = 'signin' | 'signup';

export function LoginView() {
    const { signIn, signUp, signInWithGoogle, loginAsGuest } = useAuth();
    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                const { error } = await signUp(email, password, username || undefined);
                if (error) {
                    setError(error.message);
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error.message);
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            let errorMessage = err.message || 'Something went wrong';

            if (errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection or try again later.';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsGoogleLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                setError(error.message);
            }
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-5">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient orbs */}
                <motion.div
                    animate={{
                        x: [0, 30, -20, 0],
                        y: [0, -40, 20, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-32 -left-32 w-96 h-96 bg-action/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, -30, 20, 0],
                        y: [0, 30, -30, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, 20, -10, 0],
                        y: [0, -20, 30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]"
                />

                {/* Floating travel icons */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[15%] right-[10%] text-white/5"
                >
                    <Plane className="w-16 h-16" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-[20%] left-[8%] text-white/5"
                >
                    <Globe className="w-20 h-20" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute top-[40%] left-[5%] text-white/5"
                >
                    <MapPin className="w-12 h-12" />
                </motion.div>
            </div>

            {/* Login card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo / Branding */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-bold faio-logo mb-2">FAIO</h1>
                    <p className="text-secondary text-sm">Your AI-powered travel companion</p>
                </motion.div>

                {/* Glass card */}
                <div className="relative overflow-hidden rounded-3xl bg-surface/60 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/20">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-shimmer pointer-events-none" />

                    <div className="relative z-10 p-8">
                        {/* Mode switcher tabs */}
                        <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
                            {(['signin', 'signup'] as Mode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => { setMode(m); setError(''); }}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === m
                                        ? 'bg-gradient-to-r from-action to-purple-500 text-white shadow-lg shadow-action/30'
                                        : 'text-secondary hover:text-white'
                                        }`}
                                >
                                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                                </button>
                            ))}
                        </div>

                        {/* Google Sign In */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-white" />
                            ) : (
                                <>
                                    {/* Google "G" logo */}
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-sm font-semibold text-white/90 group-hover:text-white">
                                        Continue with Google
                                    </span>
                                </>
                            )}
                        </motion.button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="text-xs text-secondary font-medium">or continue with email</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        key="username"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-action transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Username (optional)"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-secondary/60 outline-none focus:border-action/50 focus:bg-white/[0.07] transition-all duration-200"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-action transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-secondary/60 outline-none focus:border-action/50 focus:bg-white/[0.07] transition-all duration-200"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-action transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-secondary/60 outline-none focus:border-action/50 focus:bg-white/[0.07] transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Error message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit button */}
                            <motion.button
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-action to-purple-500 text-white font-bold text-base shadow-lg shadow-action/30 hover:shadow-action/50 transition-shadow duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Switch mode */}
                        <p className="text-center mt-6 text-sm text-secondary">
                            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                            <button
                                onClick={toggleMode}
                                className="text-action hover:text-action-hover font-semibold transition-colors"
                            >
                                {mode === 'signin' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>

                        {/* Guest Mode */}
                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <button
                                onClick={loginAsGuest}
                                className="text-sm font-medium text-secondary hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
                            >
                                <span>Skip Login</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6 text-xs text-secondary/50"
                >
                    By continuing, you agree to FAIO's Terms of Service
                </motion.p>
            </motion.div>
        </div>
    );
}
