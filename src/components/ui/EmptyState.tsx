import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    emoji?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className, emoji }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}
        >
            {/* Animated icon circle */}
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-action/10 rounded-full blur-2xl scale-150" />
                <div className="relative w-20 h-20 rounded-full bg-surface/80 border border-white/10 flex items-center justify-center">
                    {emoji ? (
                        <span className="text-3xl">{emoji}</span>
                    ) : (
                        <Icon className="w-8 h-8 text-secondary/40" />
                    )}
                </div>
            </motion.div>

            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-secondary max-w-xs leading-relaxed">{description}</p>

            {actionLabel && onAction && (
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onAction}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-action to-purple-500 text-white text-sm font-bold shadow-lg shadow-action/20"
                >
                    {actionLabel}
                </motion.button>
            )}

            {/* Decorative dots */}
            <div className="flex gap-1 mt-8">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        className="w-1.5 h-1.5 rounded-full bg-secondary/30"
                    />
                ))}
            </div>
        </motion.div>
    );
}
