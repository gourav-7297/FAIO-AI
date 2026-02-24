import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWA_DISMISSED_KEY = 'faio_pwa_dismissed';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(PWA_DISMISSED_KEY);
        if (dismissed) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after 30s delay for better UX
            setTimeout(() => setShow(true), 30000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShow(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 80 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="fixed bottom-20 left-4 right-4 z-[90] max-w-md mx-auto"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-surface/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 p-4">
                        {/* Shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-action/5 to-transparent animate-shimmer pointer-events-none" />

                        <div className="relative flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-action to-purple-500 flex items-center justify-center flex-shrink-0">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-white">Install FAIO</p>
                                <p className="text-xs text-secondary mt-0.5">Add to home screen for the best experience — works offline!</p>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleInstall}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-action to-purple-500 text-white text-xs font-bold shadow-lg shadow-action/30"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Install
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:text-white transition-colors"
                                    >
                                        Not now
                                    </button>
                                </div>
                            </div>
                            <button onClick={handleDismiss} className="text-secondary hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
