import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X } from 'lucide-react';
import { useAIAgents, AGENTS, type AgentType } from '../context/AIAgentContext';
import { cn } from '../lib/utils';

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    placeholder?: string;
}

export function AIChat({ isOpen, onClose, placeholder = "Ask FAIO anything..." }: AIChatProps) {
    const { chatMessages, sendChatMessage, isAITyping } = useAIAgents();
    const [input, setInput] = useState('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isAITyping) return;

        const message = input;
        setInput('');
        await sendChatMessage(message);
    };

    const suggestions = [
        "Plan a 3-day trip to Tokyo",
        "Find hidden cafes nearby",
        "What's the weather like?",
        "Show eco-friendly options"
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
                                        <p className="text-[10px] text-secondary">6 AI agents at your service</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-secondary" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="h-64 overflow-y-auto p-4 space-y-3">
                                {chatMessages.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-action" />
                                        </div>
                                        <h4 className="font-bold mb-2">How can I help?</h4>
                                        <p className="text-sm text-secondary mb-4">Ask me anything about your trip</p>

                                        {/* Suggestion chips */}
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {suggestions.map((suggestion, i) => (
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
                                            <ChatBubble key={msg.id} message={msg} />
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
                                        placeholder={placeholder}
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
        role: 'user' | 'assistant';
        content: string;
        agent?: AgentType;
    };
}

// Simple Markdown Parser
function FormattedText({ text }: { text: string }) {
    if (!text) return null;

    // Split by newlines to handle paragraphs and lists
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    let currentList: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        // Handle Bullet Points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
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

            // Handle Empty Lines (Paragraph breaks)
            if (line.trim() === '') {
                if (i < lines.length - 1) { // Avoid trailing empty space
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

function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === 'user';
    const agent = message.agent ? AGENTS[message.agent] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-2",
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
