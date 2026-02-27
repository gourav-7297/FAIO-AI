import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Trash2, MapPin, Utensils, ShieldCheck, Wallet, Compass, Copy, Check } from 'lucide-react';
import { useAIAgents, AGENTS, type AgentType } from '../context/AIAgentContext';
import { cn } from '../lib/utils';

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    placeholder?: string;
}

// Chat history persistence
const CHAT_STORAGE_KEY = 'faio_chat_history';



function saveChatHistory(messages: { role: 'user' | 'assistant'; content: string; agent?: AgentType }[]) {
    try {
        // Keep last 50 messages
        const recent = messages.slice(-50);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(recent));
    } catch { /* ignore quota errors */ }
}

export function AIChat({ isOpen, onClose, placeholder = "Ask FAIO anything..." }: AIChatProps) {
    const { chatMessages, sendChatMessage, isAITyping, tripData } = useAIAgents();
    const [input, setInput] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Save chat history when messages change
    useEffect(() => {
        if (chatMessages.length > 0) {
            saveChatHistory(chatMessages.map(m => ({ role: m.role, content: m.content, agent: m.agent })));
        }
    }, [chatMessages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isAITyping) return;

        const message = input;
        setInput('');
        await sendChatMessage(message);
    };

    const handleCopyMessage = useCallback((id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    // Context-aware suggestions based on trip status
    const suggestions = tripData ? [
        `What should I do in ${tripData.destination} today?`,
        `Best restaurants in ${tripData.destination}`,
        `Safety tips for ${tripData.destination}`,
        "How's my budget looking?",
        "Suggest an eco-friendly activity",
        "What should I pack?"
    ] : [
        "Plan a 3-day trip to Tokyo",
        "Find hidden cafes nearby",
        "What's the safest city for solo travel?",
        "Show eco-friendly destinations",
        "Budget tips for Europe",
        "Best time to visit Bali"
    ];

    // Quick action buttons
    const quickActions = [
        { icon: MapPin, label: 'Places', query: tripData ? `Top places in ${tripData.destination}` : 'Suggest amazing travel destinations' },
        { icon: Utensils, label: 'Food', query: tripData ? `Best local food in ${tripData.destination}` : 'Best food destinations worldwide' },
        { icon: ShieldCheck, label: 'Safety', query: tripData ? `Safety advice for ${tripData.destination}` : 'General travel safety tips' },
        { icon: Wallet, label: 'Budget', query: tripData ? `Budget tips for ${tripData.destination}` : 'How to travel on a budget' },
        { icon: Compass, label: 'Explore', query: tripData ? `Hidden gems in ${tripData.destination}` : 'Undiscovered travel destinations' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed inset-x-0 bottom-0 z-50 p-4 pb-safe"
                >
                    <div className="max-w-md mx-auto">
                        <div className="bg-surface/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-action to-purple-500 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">FAIO Assistant</h3>
                                        <p className="text-[10px] text-secondary">
                                            {tripData ? (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-2.5 h-2.5 text-action" />
                                                    {tripData.destination} trip loaded
                                                </span>
                                            ) : (
                                                '6 AI agents at your service'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {chatMessages.length > 0 && (
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem(CHAT_STORAGE_KEY);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Clear chat"
                                        >
                                            <Trash2 className="w-4 h-4 text-secondary" />
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-secondary" />
                                    </button>
                                </div>
                            </div>

                            {/* Trip Context Banner */}
                            {tripData && chatMessages.length === 0 && (
                                <div className="mx-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-action/10 to-purple-500/10 border border-action/20 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-action flex-shrink-0" />
                                    <p className="text-xs text-white/80">
                                        I know you're planning <strong>{tripData.destination}</strong> ({tripData.itinerary.length} days). Ask me anything about it!
                                    </p>
                                </div>
                            )}

                            {/* Quick Actions Bar */}
                            <div className="flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={async () => {
                                            await sendChatMessage(action.query);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface/80 border border-slate-700/50 rounded-full text-[11px] whitespace-nowrap hover:bg-white/10 transition-colors flex-shrink-0"
                                    >
                                        <action.icon className="w-3 h-3 text-action" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>

                            {/* Messages */}
                            <div className="h-64 overflow-y-auto p-4 space-y-3">
                                {chatMessages.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-action" />
                                        </div>
                                        <h4 className="font-bold mb-2">How can I help?</h4>
                                        <p className="text-sm text-secondary mb-4">
                                            {tripData ? `Ask me about ${tripData.destination}` : 'Ask me anything about travel'}
                                        </p>

                                        {/* Suggestion chips */}
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {suggestions.slice(0, 4).map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setInput(suggestion)}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-slate-700 rounded-full text-xs transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {chatMessages.map((msg) => (
                                            <ChatBubble
                                                key={msg.id}
                                                message={msg}
                                                onCopy={() => handleCopyMessage(msg.id, msg.content)}
                                                isCopied={copiedId === msg.id}
                                            />
                                        ))}
                                        {isAITyping && (
                                            <div className="flex items-center gap-2 text-secondary text-sm">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-action rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 bg-action rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 bg-action rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                                <span>FAIO is thinking...</span>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800">
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={tripData ? `Ask about ${tripData.destination}...` : placeholder}
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-action transition-colors placeholder:text-slate-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isAITyping}
                                        className={cn(
                                            "p-3 rounded-xl transition-all",
                                            input.trim() && !isAITyping
                                                ? "bg-action text-white shadow-lg shadow-action/30"
                                                : "bg-slate-800 text-slate-500"
                                        )}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface ChatBubbleProps {
    message: {
        id: string;
        role: 'user' | 'assistant';
        content: string;
        agent?: AgentType;
    };
    onCopy: () => void;
    isCopied: boolean;
}

// Simple Markdown Parser
function FormattedText({ text }: { text: string }) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        // Handle Numbered Lists
        if (/^\d+\.\s/.test(line.trim())) {
            const content = line.trim().replace(/^\d+\.\s/, '');
            currentList.push(
                <li key={`oli-${i}`} className="ml-4 mb-1">
                    {parseBold(content)}
                </li>
            );
        }
        // Handle Bullet Points
        else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            currentList.push(
                <li key={`li-${i}`} className="ml-4 mb-1">
                    {parseBold(content)}
                </li>
            );
        } else {
            // Flush list if exists
            if (currentList.length > 0) {
                elements.push(
                    <ul key={`ul-${i}`} className="list-disc mb-2 space-y-1">
                        {currentList}
                    </ul>
                );
                currentList = [];
            }

            // Handle Headers (### or ##)
            if (line.trim().startsWith('### ')) {
                elements.push(
                    <h4 key={`h4-${i}`} className="font-bold text-sm mt-2 mb-1 text-action/90">
                        {line.trim().substring(4)}
                    </h4>
                );
            } else if (line.trim().startsWith('## ')) {
                elements.push(
                    <h3 key={`h3-${i}`} className="font-bold mt-2 mb-1 text-action">
                        {line.trim().substring(3)}
                    </h3>
                );
            }
            // Handle Empty Lines
            else if (line.trim() === '') {
                if (i < lines.length - 1) {
                    elements.push(<div key={`br-${i}`} className="h-2" />);
                }
            } else {
                elements.push(
                    <p key={`p-${i}`} className="mb-1 last:mb-0 leading-relaxed">
                        {parseBold(line)}
                    </p>
                );
            }
        }
    });

    // Flush remaining list
    if (currentList.length > 0) {
        elements.push(
            <ul key="ul-end" className="list-disc mb-2 space-y-1">
                {currentList}
            </ul>
        );
    }

    return <div>{elements}</div>;
}

// Helper to parse **bold** text
function parseBold(text: string): React.ReactNode {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-action/90 filter brightness-110">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

function ChatBubble({ message, onCopy, isCopied }: ChatBubbleProps) {
    const isUser = message.role === 'user';
    const agent = message.agent ? AGENTS[message.agent] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-2 group",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && agent && (
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${agent.color}20` }}
                >
                    <span className="text-xs">{agent.emoji}</span>
                </div>
            )}
            <div className="relative">
                <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm",
                    isUser
                        ? "bg-action text-white rounded-br-sm"
                        : "bg-slate-800/90 border border-slate-700/50 text-slate-100 rounded-bl-sm"
                )}>
                    {!isUser && agent && (
                        <p className="text-[10px] font-bold mb-1 opacity-80" style={{ color: agent.color }}>
                            {agent.name}
                        </p>
                    )}

                    {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <FormattedText text={message.content} />
                    )}
                </div>

                {/* Copy button for AI messages */}
                {!isUser && (
                    <button
                        onClick={onCopy}
                        className="absolute -bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-800 border border-slate-700 rounded-md"
                        title="Copy message"
                    >
                        {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                            <Copy className="w-3 h-3 text-secondary" />
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Floating AI Button
interface AIFloatingButtonProps {
    onClick: () => void;
    hasUnread?: boolean;
}

export function AIFloatingButton({ onClick, hasUnread }: AIFloatingButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-action to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-action/40 z-40"
        >
            <Sparkles className="w-6 h-6 text-white" />
            {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
            )}
        </motion.button>
    );
}
