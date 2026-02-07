import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { generateTripWithAI, chatWithAI, isAIConfigured } from '../services/openRouterService';

// Agent Types
export type AgentType = 'itinerary' | 'liveUpdate' | 'localSecrets' | 'budget' | 'safety' | 'sustainability';
export type AgentStatus = 'idle' | 'thinking' | 'responding' | 'complete';

interface AgentInfo {
    id: AgentType;
    name: string;
    emoji: string;
    color: string;
    description: string;
}

export const AGENTS: Record<AgentType, AgentInfo> = {
    itinerary: {
        id: 'itinerary',
        name: 'Itinerary Agent',
        emoji: '🗓️',
        color: '#3B82F6',
        description: 'Creates day-wise travel plans'
    },
    liveUpdate: {
        id: 'liveUpdate',
        name: 'Live Update Agent',
        emoji: '⚡',
        color: '#F59E0B',
        description: 'Adjusts plan in real time'
    },
    localSecrets: {
        id: 'localSecrets',
        name: 'Local Secrets Agent',
        emoji: '🔮',
        color: '#8B5CF6',
        description: 'Suggests hidden local spots'
    },
    budget: {
        id: 'budget',
        name: 'Budget Agent',
        emoji: '💰',
        color: '#10B981',
        description: 'Estimates trip costs'
    },
    safety: {
        id: 'safety',
        name: 'Safety Agent',
        emoji: '🛡️',
        color: '#EF4444',
        description: 'Provides safety alerts'
    },
    sustainability: {
        id: 'sustainability',
        name: 'Sustainability Agent',
        emoji: '🌱',
        color: '#06B6D4',
        description: 'Shows carbon footprint'
    }
};

interface TripData {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    styles: string[];
    itinerary: ItineraryDay[];
    totalCost: number;
    carbonFootprint: number;
    safetyScore: number;
    packingList?: string[];
    safetyTips?: string[];
    localSecrets?: string[];
    overview?: string;
    topPlaces?: { name: string; type: string; description: string; bestTime: string }[];
    dining?: { name: string; cuisine: string; price: string; description: string; specialty: string }[];
}

interface ItineraryDay {
    day: number;
    date: string;
    activities: Activity[];
}

interface Activity {
    id: string;
    time: string;
    title: string;
    type: string;
    duration: string;
    cost: number;
    travelTime?: string;
    isOutdoor?: boolean;
    backup?: string;
    isSecret?: boolean;
    carbonImpact?: number;
    safetyNote?: string;
}

interface AgentMessage {
    agent: AgentType;
    message: string;
    timestamp: number;
}

interface AIAgentContextType {
    // Agent States
    agentStatuses: Record<AgentType, AgentStatus>;
    activeAgent: AgentType | null;
    agentMessages: AgentMessage[];

    // Trip Data
    tripData: TripData | null;

    // Actions
    setAgentStatus: (agent: AgentType, status: AgentStatus) => void;
    addAgentMessage: (agent: AgentType, message: string) => void;
    generateTrip: (destination: string, dates: { start: string; end: string }, budget: number, styles: string[]) => Promise<TripData>;
    clearTrip: () => void;

    // AI Chat
    chatMessages: ChatMessage[];
    sendChatMessage: (message: string) => Promise<void>;
    isAITyping: boolean;

    // AI Status
    isAIConfigured: boolean;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agent?: AgentType;
    timestamp: number;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

// Mock itinerary generation
const generateMockItinerary = (destination: string, styles: string[]): ItineraryDay[] => {
    const activities: Activity[] = [
        { id: '1', time: '08:00', title: 'Breakfast at Local Café', type: 'food', duration: '1h', cost: 15, carbonImpact: 2 },
        { id: '2', time: '10:00', title: `${destination} Heritage Walk`, type: 'culture', duration: '2h', cost: 0, travelTime: '15 min', isOutdoor: true, backup: 'Museum Visit', carbonImpact: 5 },
        { id: '3', time: '13:00', title: 'Hidden Gem Restaurant', type: 'food', duration: '1.5h', cost: 25, travelTime: '10 min', isSecret: true, carbonImpact: 3 },
        { id: '4', time: '15:00', title: styles.includes('adventure') ? 'Adventure Activity' : 'Scenic Viewpoint', type: styles.includes('adventure') ? 'adventure' : 'nature', duration: '2h', cost: 45, travelTime: '20 min', isOutdoor: true, backup: 'Indoor Activity Center', carbonImpact: 15 },
        { id: '5', time: '18:00', title: 'Sunset Spot', type: 'view', duration: '1h', cost: 0, travelTime: '15 min', isOutdoor: true, isSecret: true, carbonImpact: 5 },
        { id: '6', time: '20:00', title: styles.includes('nightlife') ? 'Nightlife District' : 'Cozy Dinner', type: styles.includes('nightlife') ? 'nightlife' : 'food', duration: '2h', cost: 40, travelTime: '10 min', carbonImpact: 8 },
    ];

    return [
        { day: 1, date: 'Day 1', activities: activities.slice(0, 4) },
        { day: 2, date: 'Day 2', activities },
        { day: 3, date: 'Day 3', activities: activities.slice(0, 5) },
    ];
};

export function AIAgentProvider({ children }: { children: ReactNode }) {
    const [agentStatuses, setAgentStatuses] = useState<Record<AgentType, AgentStatus>>({
        itinerary: 'idle',
        liveUpdate: 'idle',
        localSecrets: 'idle',
        budget: 'idle',
        safety: 'idle',
        sustainability: 'idle',
    });
    const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
    const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
    const [tripData, setTripData] = useState<TripData | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isAITyping, setIsAITyping] = useState(false);

    const setAgentStatus = useCallback((agent: AgentType, status: AgentStatus) => {
        setAgentStatuses(prev => ({ ...prev, [agent]: status }));
        if (status === 'thinking' || status === 'responding') {
            setActiveAgent(agent);
        } else if (status === 'complete' || status === 'idle') {
            setActiveAgent(null);
        }
    }, []);

    const addAgentMessage = useCallback((agent: AgentType, message: string) => {
        setAgentMessages(prev => [...prev, { agent, message, timestamp: Date.now() }]);
    }, []);

    const generateTrip = useCallback(async (
        destination: string,
        dates: { start: string; end: string },
        budget: number,
        styles: string[]
    ): Promise<TripData> => {
        // Show multi-agent processing animation
        const agents: AgentType[] = ['itinerary', 'localSecrets', 'budget', 'safety', 'sustainability'];

        // Start all agents thinking
        for (const agent of agents) {
            setAgentStatus(agent, 'thinking');
            addAgentMessage(agent, `${AGENTS[agent].emoji} ${AGENTS[agent].name} analyzing...`);
        }

        // Call real Gemini AI
        const aiTrip = await generateTripWithAI({
            destination,
            startDate: dates.start,
            endDate: dates.end,
            budget,
            travelStyles: styles,
        });

        // Animate agent completion one by one
        for (const agent of agents) {
            setAgentStatus(agent, 'responding');
            await new Promise(r => setTimeout(r, 300));

            const agentMessages: Record<AgentType, string> = {
                itinerary: aiTrip ? `Created ${aiTrip.totalDays}-day optimized itinerary for ${destination}` : 'Itinerary generated',
                localSecrets: aiTrip?.localSecrets ? `Found ${aiTrip.localSecrets.length} hidden gems` : 'Found local secrets',
                budget: aiTrip ? `Estimated total: $${aiTrip.totalCost.toFixed(0)}` : 'Budget calculated',
                safety: aiTrip?.safetyTips ? `${aiTrip.safetyTips.length} safety tips compiled` : 'Safety assessed',
                sustainability: aiTrip ? `Carbon footprint: ${aiTrip.carbonFootprint.toFixed(0)}kg CO2` : 'Sustainability scored',
                liveUpdate: 'Monitoring conditions...'
            };

            addAgentMessage(agent, agentMessages[agent]);
            setAgentStatus(agent, 'complete');
        }

        // Convert AI response to TripData format
        const itinerary: ItineraryDay[] = aiTrip?.days.map((day, index) => ({
            day: index + 1,
            date: day.date,
            activities: day.activities.map(act => ({
                id: act.id,
                time: act.time,
                title: act.name,
                type: 'activity',
                duration: act.duration,
                cost: act.cost,
                backup: act.backupOption,
                isSecret: false,
                carbonImpact: act.carbonKg,
            }))
        })) || generateMockItinerary(destination, styles);

        const newTripData: TripData = {
            destination,
            startDate: dates.start,
            endDate: dates.end,
            budget,
            styles,
            itinerary,
            totalCost: aiTrip?.totalCost || budget * 0.85,
            carbonFootprint: aiTrip?.carbonFootprint || 420,
            safetyScore: aiTrip?.sustainabilityScore ? aiTrip.sustainabilityScore / 10 : 8.5,
            packingList: aiTrip?.packingList,
            safetyTips: aiTrip?.safetyTips,
            localSecrets: aiTrip?.localSecrets,
            // New Detailed Sections
            overview: aiTrip?.overview,
            topPlaces: aiTrip?.topPlaces,
            dining: aiTrip?.dining,
        };

        setTripData(newTripData);

        // Activate live update agent
        setAgentStatus('liveUpdate', 'idle');
        addAgentMessage('liveUpdate', '⚡ Live Update Agent now monitoring your trip');

        return newTripData;
    }, [setAgentStatus, addAgentMessage]);

    const clearTrip = useCallback(() => {
        setTripData(null);
        setAgentMessages([]);
        Object.keys(agentStatuses).forEach(agent => {
            setAgentStatus(agent as AgentType, 'idle');
        });
    }, [agentStatuses, setAgentStatus]);

    const sendChatMessage = useCallback(async (message: string) => {
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: Date.now(),
        };
        setChatMessages(prev => [...prev, userMessage]);
        setIsAITyping(true);

        // Call real Gemini AI for chat
        const chatHistory = chatMessages.map(m => ({
            role: m.role,
            content: m.content,
        }));

        const aiResponse = await chatWithAI(chatHistory, message);

        // Determine which agent should respond based on message content
        const lowerMessage = message.toLowerCase();
        let responseAgent: AgentType = 'itinerary';
        if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant')) {
            responseAgent = 'localSecrets';
        } else if (lowerMessage.includes('safe') || lowerMessage.includes('danger')) {
            responseAgent = 'safety';
        } else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('money')) {
            responseAgent = 'budget';
        } else if (lowerMessage.includes('eco') || lowerMessage.includes('green') || lowerMessage.includes('carbon')) {
            responseAgent = 'sustainability';
        }

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            agent: responseAgent,
            timestamp: Date.now(),
        };

        setChatMessages(prev => [...prev, aiMessage]);
        setIsAITyping(false);
    }, [chatMessages]);

    return (
        <AIAgentContext.Provider value={{
            agentStatuses,
            activeAgent,
            agentMessages,
            tripData,
            setAgentStatus,
            addAgentMessage,
            generateTrip,
            clearTrip,
            chatMessages,
            sendChatMessage,
            isAITyping,
            isAIConfigured: isAIConfigured(),
        }}>
            {children}
        </AIAgentContext.Provider>
    );
}

export function useAIAgents() {
    const context = useContext(AIAgentContext);
    if (context === undefined) {
        throw new Error('useAIAgents must be used within an AIAgentProvider');
    }
    return context;
}

