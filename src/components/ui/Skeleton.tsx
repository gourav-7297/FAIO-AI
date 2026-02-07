import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
    animation = 'wave'
}: SkeletonProps) {
    const baseClasses = cn(
        "bg-slate-800 relative overflow-hidden",
        variant === 'circular' && "rounded-full",
        variant === 'rounded' && "rounded-xl",
        variant === 'rectangular' && "rounded-md",
        variant === 'text' && "rounded h-4",
        className
    );

    const style: React.CSSProperties = {
        width: width,
        height: height,
    };

    if (animation === 'none') {
        return <div className={baseClasses} style={style} />;
    }

    if (animation === 'pulse') {
        return (
            <motion.div
                className={baseClasses}
                style={style}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
        );
    }

    // Wave animation (shimmer)
    return (
        <div className={baseClasses} style={style}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

// Card skeleton for loading states
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("p-4 bg-surface/50 rounded-2xl border border-slate-800 space-y-3", className)}>
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="40%" height={12} />
                </div>
            </div>
            <Skeleton variant="rounded" height={80} />
            <div className="flex gap-2">
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={80} height={24} />
            </div>
        </div>
    );
}

// Place card skeleton for explore view
export function PlaceCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("overflow-hidden rounded-2xl border border-slate-800 bg-surface/50", className)}>
            <Skeleton variant="rectangular" height={180} />
            <div className="p-3 space-y-2">
                <Skeleton variant="text" width="70%" height={20} />
                <div className="flex gap-2">
                    <Skeleton variant="rounded" width={50} height={20} />
                    <Skeleton variant="rounded" width={60} height={20} />
                </div>
            </div>
        </div>
    );
}

// Itinerary day skeleton
export function ItineraryDaySkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("p-4 bg-surface/50 rounded-2xl border border-slate-800", className)}>
            <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="rounded" width={40} height={40} />
                <div className="space-y-1">
                    <Skeleton variant="text" width={100} height={16} />
                    <Skeleton variant="text" width={60} height={12} />
                </div>
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton variant="text" width={50} height={14} />
                            <Skeleton variant="rounded" width={40} height={18} />
                        </div>
                        <Skeleton variant="text" width="80%" height={16} />
                        <Skeleton variant="text" width="50%" height={12} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Stats row skeleton
export function StatsRowSkeleton({ count = 3, className }: { count?: number; className?: string }) {
    return (
        <div className={cn("grid gap-3", className)} style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-3 bg-surface/50 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={50} height={20} />
                    <Skeleton variant="text" width={40} height={10} />
                </div>
            ))}
        </div>
    );
}

// Chat message skeleton
export function ChatMessageSkeleton({ isAI = true, className }: { isAI?: boolean; className?: string }) {
    return (
        <div className={cn("flex gap-2", isAI ? "justify-start" : "justify-end", className)}>
            {isAI && <Skeleton variant="circular" width={32} height={32} />}
            <div className={cn(
                "max-w-[75%] p-3 rounded-2xl",
                isAI ? "bg-slate-800" : "bg-action/20"
            )}>
                <Skeleton variant="text" width={180} height={14} className="mb-1" />
                <Skeleton variant="text" width={120} height={14} />
            </div>
        </div>
    );
}

// Home hero skeleton
export function HomeHeroSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton variant="text" width={200} height={32} />
                    <Skeleton variant="text" width={150} height={16} />
                </div>
                <Skeleton variant="circular" width={44} height={44} />
            </div>

            {/* Search card */}
            <Skeleton variant="rounded" height={72} />

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton variant="rounded" width={56} height={56} />
                        <Skeleton variant="text" width={40} height={12} />
                    </div>
                ))}
            </div>

            {/* Conditions */}
            <Skeleton variant="rounded" height={100} />

            {/* Agents */}
            <div className="space-y-3">
                <Skeleton variant="text" width={100} height={20} />
                <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rounded" width={112} height={110} className="flex-shrink-0" />
                    ))}
                </div>
            </div>
        </div>
    );
}
