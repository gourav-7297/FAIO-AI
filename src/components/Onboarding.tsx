import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, MapPin, Globe, Star } from 'lucide-react';

const ONBOARDING_KEY = 'faio_onboarding_complete';

const SLIDES = [
    {
        emoji: '✨',
        title: 'AI-Powered Planning',
        description: 'Tell FAIO where you want to go and get a complete itinerary with activities, dining, and local tips — powered by AI.',
        gradient: 'from-action to-purple-500',
        icon: Sparkles,
    },
    {
        emoji: '🔮',
        title: 'Hidden Gems & Secrets',
        description: 'Discover places that guidebooks miss. Local secrets, hidden cafés, and off-the-beaten-path experiences curated just for you.',
        gradient: 'from-emerald-500 to-teal-500',
        icon: MapPin,
    },
    {
        emoji: '🛡️',
        title: 'Smart Safety Features',
        description: 'SOS alerts, fake call feature, safety checklist, and live location sharing — travel confidently wherever you go.',
        gradient: 'from-red-500 to-rose-500',
        icon: Shield,
    },
    {
        emoji: '🌍',
        title: 'Community & Guides',
        description: 'Connect with travelers worldwide, join group trips, book trusted local guides, and share your stories.',
        gradient: 'from-blue-500 to-cyan-500',
        icon: Globe,
    },
    {
        emoji: '🌟',
        title: 'Ready to Explore?',
        description: 'Your adventure starts now. Plan trips, track budgets, find hotels — all in one beautiful app.',
        gradient: 'from-amber-500 to-orange-500',
        icon: Star,
    },
];

export function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
            setShow(true);
        }
    }, []);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => handleComplete();

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setShow(false);
        onComplete();
    };

    if (!show) return null;

    const slide = SLIDES[currentSlide];
    const isLast = currentSlide === SLIDES.length - 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
            >
                <div className="w-full max-w-sm">
                    {/* Animated icon */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="text-center"
                        >
                            {/* Glow circle */}
                            <div className="relative mx-auto mb-8 w-28 h-28">
                                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} rounded-full blur-2xl opacity-30`} />
                                <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-xl`}>
                                    <span className="text-5xl">{slide.emoji}</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-3">{slide.title}</h2>
                            <p className="text-secondary text-sm leading-relaxed max-w-xs mx-auto">{slide.description}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-10 mb-8">
                        {SLIDES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-400 ${i === currentSlide ? 'w-8 bg-action' : i < currentSlide ? 'w-1.5 bg-action/40' : 'w-1.5 bg-white/15'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {!isLast && (
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-secondary hover:text-white transition-colors border border-white/10"
                            >
                                Skip
                            </button>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleNext}
                            className={`${isLast ? 'w-full' : 'flex-1'} py-3.5 rounded-2xl bg-gradient-to-r from-action to-purple-500 text-white font-bold text-sm shadow-lg shadow-action/30 flex items-center justify-center gap-2`}
                        >
                            {isLast ? "Let's Go!" : 'Next'}
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export function useOnboardingComplete() {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
}
