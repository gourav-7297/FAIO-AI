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
    // Subtle warm tint backgrounds
    const gradients = {
        blue: 'bg-sky-50/40',
        purple: 'bg-stone-50',
        green: 'bg-emerald-50/40',
        orange: 'bg-amber-50/40',
        pink: 'bg-rose-50/40',
        none: 'bg-white',
    };

    return (
        <motion.div
            whileHover={hover ? { y: -1 } : undefined}
            whileTap={onClick ? { scale: 0.99 } : undefined}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-2xl",
                gradients[gradient],
                "border border-stone-200/60",
                "shadow-card",
                hover && "transition-all duration-200 cursor-pointer hover:shadow-card-hover",
                className
            )}
        >
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
        primary: 'bg-primary hover:bg-primary-dark text-white shadow-card',
        secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800',
        ghost: 'bg-transparent hover:bg-stone-50 text-stone-700',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "rounded-xl font-semibold transition-all duration-200",
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
