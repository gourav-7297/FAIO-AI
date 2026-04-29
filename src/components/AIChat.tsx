import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Trash2, MapPin, Utensils, ShieldCheck, Wallet, Compass, Copy, Check, ChevronRight, MessageSquare, Zap, Target } from 'lucide-react';
import { useAIAgents, AGENTS, type AgentType } from '../context/AIAgentContext';
import { cn } from '../lib/utils';

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    placeholder?: string;
}

const CHAT_STORAGE_KEY = 'faio_chat_history';

function saveChatHistory(messages: { role: 'user' | 'assistant'; content: string; agent?: AgentType }[]) {
    try {
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

    const suggestions = tripData ? [
        `What should I do in ${tripData.destination} today?`,
        `Best restaurants in ${tripData.destination}`,
        `Safety tips for ${tripData.destination}`,
        "Suggest an eco-friendly activity",
    ] : [
        "Plan a 3-day trip to Tokyo",
        "Find hidden cafes nearby",
        "Show eco-friendly destinations",
        "Budget tips for Europe",
    ];

    const quickActions = [
        { icon: MapPin, label: 'PLACES', query: tripData ? `Top places in ${tripData.destination}` : 'Suggest amazing travel destinations' },
        { icon: Utensils, label: 'GASTRO', query: tripData ? `Best local food in ${tripData.destination}` : 'Best food destinations worldwide' },
        { icon: Target, label: 'SAFETY', query: tripData ? `Safety advice for ${tripData.destination}` : 'General travel safety tips' },
        { icon: Zap, label: 'BUDGET', query: tripData ? `Budget tips for ${tripData.destination}` : 'How to travel on a budget' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-stone-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        className="bg-white w-full max-w-xl rounded-t-[48px] sm:rounded-[48px] shadow-2xl relative z-10 flex flex-col h-[85vh] sm:h-[700px] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-stone-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-stone-900 tracking-tight">FAIO Intelligence</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">NEURAL LINK ACTIVE</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {chatMessages.length > 0 && (
                                    <button
                                        onClick={() => localStorage.removeItem(CHAT_STORAGE_KEY)}
                                        className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-stone-50/50">
                            {chatMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                    <div className="w-20 h-20 rounded-[32px] bg-white shadow-soft border border-stone-100 flex items-center justify-center mb-6">
                                        <MessageSquare className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-black text-stone-900 tracking-tighter mb-4">Neural Command Interface</h2>
                                    <p className="text-stone-400 text-sm font-medium max-w-xs mb-10 leading-relaxed">Initialized and ready for tactical travel inquiries. Choose a preset or initialize custom query.</p>
                                    
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setInput(s)}
                                                className="p-4 bg-white border border-stone-100 rounded-2xl text-left hover:border-primary hover:shadow-lg transition-all group"
                                            >
                                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">QUERY {i+1}</p>
                                                <p className="text-sm font-black text-stone-900 line-clamp-2">{s}</p>
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
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">PROCESSING DATA...</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Tactical Actions */}
                        <div className="px-8 py-4 bg-white border-t border-stone-50">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendChatMessage(action.query)}
                                        className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-100 rounded-full whitespace-nowrap hover:bg-stone-900 hover:text-white transition-all group"
                                    >
                                        <action.icon className="w-3 h-3 text-primary group-hover:text-white" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Command Center */}
                        <div className="p-8 pt-0 bg-white">
                            <form onSubmit={handleSubmit} className="relative group">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full h-16 bg-stone-50 border border-stone-100 rounded-[24px] pl-6 pr-20 text-sm font-black text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isAITyping}
                                    className={cn(
                                        "absolute right-2 top-2 h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                                        input.trim() && !isAITyping
                                            ? "bg-stone-800 text-white shadow-xl hover:bg-stone-900"
                                            : "bg-stone-200 text-stone-400"
                                    )}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function FormattedText({ text }: { text: string }) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        if (/^\d+\.\s/.test(line.trim()) || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().replace(/^(\d+\.\s|[-*]\s)/, '');
            currentList.push(
                <li key={i} className="mb-2 pl-2">
                    {parseBold(content)}
                </li>
            );
        } else {
            if (currentList.length > 0) {
                elements.push(<ul key={`list-${i}`} className="list-disc ml-4 mb-4 text-sm font-medium">{currentList}</ul>);
                currentList = [];
            }
            if (line.trim().startsWith('### ')) {
                elements.push(<h4 key={i} className="text-xs font-black text-primary uppercase tracking-widest mt-6 mb-3">{line.trim().substring(4)}</h4>);
            } else if (line.trim() === '') {
                elements.push(<div key={i} className="h-4" />);
            } else {
                elements.push(<p key={i} className="mb-4 leading-relaxed text-sm font-medium text-stone-600">{parseBold(line)}</p>);
            }
        }
    });
    if (currentList.length > 0) elements.push(<ul key="end-list" className="list-disc ml-4 mb-4 text-sm font-medium">{currentList}</ul>);
    return <div>{elements}</div>;
}

function parseBold(text: string): React.ReactNode {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-black text-stone-900">{part.slice(2, -2)}</strong>;
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
            className={cn("flex gap-4", isUser ? "flex-row-reverse" : "flex-row")}
        >
            <div className={cn(
                "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg shadow-sm border border-stone-100",
                isUser ? "bg-white" : "bg-stone-50"
            )}>
                {isUser ? '👤' : agent?.emoji || '🤖'}
            </div>
            
            <div className={cn("max-w-[80%] relative group", isUser ? "text-right" : "text-left")}>
                {!isUser && agent && (
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">{agent.name} AGENT</p>
                )}
                
                <div className={cn(
                    "p-6 rounded-[32px] shadow-sm border",
                    isUser 
                        ? "bg-white border-stone-100 rounded-tr-sm" 
                        : "bg-stone-50 border-stone-100 rounded-tl-sm text-stone-800"
                )}>
                    {isUser ? (
                        <p className="text-sm font-black text-stone-900 leading-relaxed">{message.content}</p>
                    ) : (
                        <div className="text-stone-800">
                            <FormattedText text={message.content} />
                        </div>
                    )}
                </div>

                {!isUser && (
                    <button
                        onClick={onCopy}
                        className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-stone-400 uppercase tracking-widest hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {isCopied ? 'COPIED' : 'COPY INTEL'}
                    </button>
                )}
            </div>
        </motion.div>
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

export function AIFloatingButton({ onClick, hasUnread }: { onClick: () => void; hasUnread?: boolean }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="fixed bottom-24 right-6 w-16 h-16 bg-white border border-stone-200 rounded-[24px] flex items-center justify-center shadow-2xl z-40 group"
        >
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity rounded-[24px]" />
            <Sparkles className="w-7 h-7 text-primary" />
            {hasUnread && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-4 border-white shadow-lg" />
            )}
        </motion.button>
    );
}

