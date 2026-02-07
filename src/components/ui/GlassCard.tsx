import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'none';
    glow?: boolean;
    hover?: boolean;
    onClick?: () => void;
}

export function GlassCard({
    children,
    className,
    gradient = 'none',
    glow = false,
    hover = true,
    onClick
}: GlassCardProps) {
    const gradients = {
        blue: 'from-blue-500/10 to-cyan-500/5',
        purple: 'from-purple-500/10 to-pink-500/5',
        green: 'from-emerald-500/10 to-teal-500/5',
        orange: 'from-orange-500/10 to-amber-500/5',
        pink: 'from-pink-500/10 to-rose-500/5',
        none: '',
    };

    const glowColors = {
        blue: 'shadow-blue-500/20',
        purple: 'shadow-purple-500/20',
        green: 'shadow-emerald-500/20',
        orange: 'shadow-orange-500/20',
        pink: 'shadow-pink-500/20',
        none: '',
    };

    return (
        <motion.div
            whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-2xl",
                "bg-gradient-to-br",
                gradients[gradient],
                "backdrop-blur-xl",
                "border border-white/10",
                "bg-surface/80",
                glow && `shadow-lg ${glowColors[gradient]}`,
                hover && "transition-all duration-300 cursor-pointer",
                className
            )}
        >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

interface GlassButtonProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onClick?: () => void;
}

export function GlassButton({
    children,
    className,
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick
}: GlassButtonProps) {
    const variants = {
        primary: 'bg-action hover:bg-action-hover text-white shadow-lg shadow-action/30',
        secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
        ghost: 'bg-transparent hover:bg-white/10 text-white',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "rounded-xl font-bold transition-all duration-200",
                "backdrop-blur-sm",
                variants[variant],
                sizes[size],
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {children}
        </motion.button>
    );
}
