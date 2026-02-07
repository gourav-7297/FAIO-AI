import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface HapticFeedbackProps {
    type: 'success' | 'error' | 'warning' | 'tap' | 'impact';
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}

// Visual haptic feedback patterns
const FEEDBACK_PATTERNS = {
    success: {
        scale: [1, 1.05, 1],
        backgroundColor: ['transparent', 'rgba(16, 185, 129, 0.2)', 'transparent'],
    },
    error: {
        x: [0, -5, 5, -5, 5, 0],
        backgroundColor: ['transparent', 'rgba(239, 68, 68, 0.2)', 'transparent'],
    },
    warning: {
        scale: [1, 1.02, 1, 1.02, 1],
        backgroundColor: ['transparent', 'rgba(245, 158, 11, 0.2)', 'transparent'],
    },
    tap: {
        scale: [1, 0.95, 1],
    },
    impact: {
        scale: [1, 0.9, 1.05, 1],
    },
};

const FEEDBACK_TRANSITIONS = {
    success: { duration: 0.3 },
    error: { duration: 0.4 },
    warning: { duration: 0.5 },
    tap: { duration: 0.15 },
    impact: { duration: 0.25 },
};

export function HapticButton({
    type,
    children,
    className,
    disabled,
    onClick
}: HapticFeedbackProps) {
    return (
        <motion.button
            whileTap={FEEDBACK_PATTERNS[type]}
            transition={FEEDBACK_TRANSITIONS[type]}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative overflow-hidden",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {children}
        </motion.button>
    );
}

// Ripple effect component
interface RippleButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    rippleColor?: string;
}

export function RippleButton({
    children,
    className,
    onClick,
    rippleColor = 'rgba(255, 255, 255, 0.3)'
}: RippleButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn("relative overflow-hidden", className)}
        >
            <motion.div
                initial={{ scale: 0, opacity: 1 }}
                whileTap={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ backgroundColor: rippleColor }}
                className="absolute inset-0 rounded-full pointer-events-none"
            />
            {children}
        </motion.button>
    );
}

// Pulse indicator for notifications
interface PulseIndicatorProps {
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function PulseIndicator({
    color = 'bg-action',
    size = 'md',
    className
}: PulseIndicatorProps) {
    const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    return (
        <span className={cn("relative flex", className)}>
            <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={cn("absolute inline-flex rounded-full", sizes[size], color)}
            />
            <span className={cn("relative inline-flex rounded-full", sizes[size], color)} />
        </span>
    );
}

// Shake animation wrapper
interface ShakeWrapperProps {
    children: React.ReactNode;
    shake: boolean;
    className?: string;
}

export function ShakeWrapper({ children, shake, className }: ShakeWrapperProps) {
    return (
        <motion.div
            animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Success checkmark animation
export function SuccessCheckmark({ className }: { className?: string }) {
    return (
        <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={cn("w-16 h-16 text-emerald-500", className)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <motion.circle
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
                cx="12"
                cy="12"
                r="10"
            />
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                d="M8 12l2 2 4-4"
            />
        </motion.svg>
    );
}

// Loading spinner with haptic feel
export function LoadingSpinner({
    size = 24,
    color = 'text-action',
    className
}: {
    size?: number;
    color?: string;
    className?: string;
}) {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={cn(color, className)}
            style={{ width: size, height: size }}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                <motion.path
                    d="M12 2a10 10 0 0 1 10 10"
                    strokeLinecap="round"
                />
            </svg>
        </motion.div>
    );
}

// Bounce notification badge
interface BounceBadgeProps {
    count: number;
    className?: string;
}

export function BounceBadge({ count, className }: BounceBadgeProps) {
    if (count <= 0) return null;

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={cn(
                "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
                "bg-red-500 text-white text-xs font-bold rounded-full",
                "flex items-center justify-center",
                className
            )}
        >
            {count > 99 ? '99+' : count}
        </motion.span>
    );
}

// Press and hold indicator
interface PressHoldIndicatorProps {
    progress: number; // 0-100
    size?: number;
    className?: string;
}

export function PressHoldIndicator({ progress, size = 60, className }: PressHoldIndicatorProps) {
    const circumference = 2 * Math.PI * ((size - 4) / 2);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg
            width={size}
            height={size}
            className={cn("transform -rotate-90", className)}
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={(size - 4) / 2}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={3}
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={(size - 4) / 2}
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.1 }}
            />
        </svg>
    );
}
