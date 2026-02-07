import { motion } from 'framer-motion';
import { AGENTS, type AgentType, type AgentStatus } from '../../context/AIAgentContext';
import { cn } from '../../lib/utils';

interface AgentAvatarProps {
    agent: AgentType;
    status?: AgentStatus;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export function AgentAvatar({
    agent,
    status = 'idle',
    size = 'md',
    showLabel = false,
    className
}: AgentAvatarProps) {
    const agentInfo = AGENTS[agent];

    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-xl',
        lg: 'w-16 h-16 text-2xl',
    };

    const ringColors = {
        idle: 'ring-slate-700',
        thinking: 'ring-action animate-pulse',
        responding: 'ring-emerald-500',
        complete: 'ring-emerald-500',
    };

    return (
        <div className={cn("flex flex-col items-center gap-1", className)}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                    "rounded-full flex items-center justify-center ring-2 transition-all duration-300",
                    sizes[size],
                    ringColors[status],
                )}
                style={{ backgroundColor: `${agentInfo.color}20` }}
            >
                {status === 'thinking' ? (
                    <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                        {agentInfo.emoji}
                    </motion.span>
                ) : (
                    <span>{agentInfo.emoji}</span>
                )}

                {/* Status indicator */}
                {status !== 'idle' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                            status === 'thinking' && "bg-amber-500 animate-pulse",
                            status === 'responding' && "bg-emerald-500",
                            status === 'complete' && "bg-emerald-500"
                        )}
                    />
                )}
            </motion.div>

            {showLabel && (
                <span className="text-xs text-secondary font-medium truncate max-w-[80px]">
                    {agentInfo.name.replace(' Agent', '')}
                </span>
            )}
        </div>
    );
}

interface AgentStatusBarProps {
    statuses: Record<AgentType, AgentStatus>;
    activeAgent: AgentType | null;
    className?: string;
}

export function AgentStatusBar({ statuses, activeAgent, className }: AgentStatusBarProps) {
    const agents: AgentType[] = ['itinerary', 'localSecrets', 'budget', 'safety', 'sustainability', 'liveUpdate'];

    return (
        <div className={cn("flex items-center gap-2 overflow-x-auto no-scrollbar py-2", className)}>
            {agents.map((agent) => (
                <motion.div
                    key={agent}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300",
                        activeAgent === agent
                            ? "bg-white/10 ring-1 ring-white/20"
                            : "bg-surface/50"
                    )}
                >
                    <AgentAvatar agent={agent} status={statuses[agent]} size="sm" />
                    <span className={cn(
                        "text-xs font-medium whitespace-nowrap transition-colors",
                        activeAgent === agent ? "text-white" : "text-secondary"
                    )}>
                        {AGENTS[agent].name.replace(' Agent', '')}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

interface AgentMessageProps {
    agent: AgentType;
    message: string;
    className?: string;
}

export function AgentMessage({ agent, message, className }: AgentMessageProps) {
    const agentInfo = AGENTS[agent];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-slate-800",
                className
            )}
        >
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${agentInfo.color}20` }}
            >
                <span className="text-sm">{agentInfo.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold mb-0.5" style={{ color: agentInfo.color }}>
                    {agentInfo.name}
                </p>
                <p className="text-sm text-secondary">{message}</p>
            </div>
        </motion.div>
    );
}
