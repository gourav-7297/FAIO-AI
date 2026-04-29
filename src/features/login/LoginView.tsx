import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Plane, Globe, MapPin, Sparkles, Shield, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Mode = 'signin' | 'signup';

const FEATURES = [
    { emoji: '🗺️', title: 'AI Trip Planning', desc: 'Smart itineraries crafted by AI in seconds', icon: Compass, color: 'from-blue-500 to-cyan-500' },
    { emoji: '🔮', title: 'Local Secrets', desc: 'Hidden gems only locals know about', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { emoji: '🛡️', title: 'Travel Safety', desc: 'SOS, fake calls & real-time safety alerts', icon: Shield, color: 'from-emerald-500 to-teal-500' },
];

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
    const [featureIndex, setFeatureIndex] = useState(0);

    // Auto-rotate features
    useEffect(() => {
        const timer = setInterval(() => setFeatureIndex(i => (i + 1) % FEATURES.length), 3500);
        return () => clearInterval(timer);
    }, []);

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
                errorMessage = 'Network error: Unable to connect. Please check your internet connection.';
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
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-32 -left-32 w-96 h-96 bg-stone-200/40 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, -30, 20, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.1, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-sand/30 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, 20, -10, 0], y: [0, -20, 30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-stone-100/50 rounded-full blur-[80px]"
                />

                {/* Floating travel icons */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[12%] right-[10%] text-stone-200/20"
                >
                    <Plane className="w-16 h-16" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-[15%] left-[8%] text-stone-200/20"
                >
                    <Globe className="w-20 h-20" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute top-[35%] left-[5%] text-stone-200/20"
                >
                    <MapPin className="w-12 h-12" />
                </motion.div>

                {/* Animated dots grid */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-4"
                >
                    <h1 className="text-5xl font-bold faio-logo mb-1">FAIO</h1>
                    <p className="text-secondary text-sm">Your AI-powered travel companion</p>
                </motion.div>

                {/* Feature Carousel */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                >
                    <div className="relative h-16 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={featureIndex}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${FEATURES[featureIndex].color} flex items-center justify-center`}>
                                    <span className="text-lg">{FEATURES[featureIndex].emoji}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-800">{FEATURES[featureIndex].title}</p>
                                    <p className="text-xs text-stone-500">{FEATURES[featureIndex].desc}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    {/* Carousel dots */}
                    <div className="flex justify-center gap-1.5 mt-1">
                        {FEATURES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-500 ${i === featureIndex ? 'w-5 bg-stone-800' : 'w-1.5 bg-stone-200'}`}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Glass card */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-stone-200 shadow-2xl shadow-stone-200/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-50/50 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

                    <div className="relative z-10 p-7">
                        {/* Mode switcher */}
                        <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
                            {(['signin', 'signup'] as Mode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => { setMode(m); setError(''); }}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === m
                                        ? 'bg-stone-800 text-white shadow-lg shadow-stone-200'
                                        : 'text-stone-400 hover:text-stone-800'
                                        }`}
                                >
                                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                                </button>
                            ))}
                        </div>

                        {/* Google */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-white" />
                            ) : (
                                <>
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
                        <div className="flex items-center gap-4 my-5">
                            <div className="flex-1 h-px bg-stone-100" />
                            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">or with email</span>
                            <div className="flex-1 h-px bg-stone-100" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3">
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
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Username (optional)"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-800 transition-all duration-200 text-sm"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-800 transition-all duration-200 text-sm"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400 group-focus-within:text-stone-800 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-800 transition-all duration-200 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 rounded-2xl bg-stone-800 text-white font-bold text-sm shadow-lg shadow-stone-200 hover:bg-stone-900 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Toggle mode */}
                        <p className="text-center mt-5 text-xs text-secondary">
                            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                            <button onClick={toggleMode} className="text-action hover:text-action-hover font-semibold transition-colors">
                                {mode === 'signin' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>

                        {/* Guest */}
                        <div className="mt-6 pt-5 border-t border-white/10 text-center">
                            <button
                                onClick={loginAsGuest}
                                className="text-xs font-medium text-secondary hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
                            >
                                <span>Continue as Guest</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <p className="text-[10px] text-secondary/40 mt-2">No account needed • Limited features</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-5"
                >
                    <p className="text-[10px] text-secondary/40">
                        By continuing, you agree to FAIO's Terms of Service & Privacy Policy
                    </p>
                    <p className="text-[10px] text-secondary/30 mt-1 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" /> Powered by AI • Made with ❤️
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
