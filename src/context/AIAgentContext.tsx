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

// ============================
// DATA TYPES
// ============================

export interface Activity {
    id: string;
    time: string;
    title: string;
    type: string;
    duration: string;
    cost: number;
    location?: string;
    description?: string;
    travelTime?: string;
    isOutdoor?: boolean;
    backup?: string;
    isSecret?: boolean;
    carbonImpact?: number;
    safetyNote?: string;
    isEcoFriendly?: boolean;
}

export interface ItineraryDay {
    day: number;
    date: string;
    theme?: string;
    activities: Activity[];
}

export interface TripData {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    styles: string[];
    travelers?: number;
    itinerary: ItineraryDay[];
    totalCost: number;
    carbonFootprint: number;
    sustainabilityScore: number;
    packingList?: string[];
    safetyTips?: string[];
    localSecrets?: string[];
    overview?: string;
    bestTimeToVisit?: string;
    currency?: string;
    language?: string;
    topPlaces?: { name: string; type: string; description: string; bestTime: string; estimatedCost?: string; rating?: number }[];
    dining?: { name: string; cuisine: string; price: string; description: string; specialty: string; rating?: number; neighborhood?: string }[];
    transportTips?: string[];
}

interface AgentMessage {
    agent: AgentType;
    message: string;
    timestamp: number;
}

interface AIAgentContextType {
    agentStatuses: Record<AgentType, AgentStatus>;
    activeAgent: AgentType | null;
    agentMessages: AgentMessage[];
    tripData: TripData | null;
    setAgentStatus: (agent: AgentType, status: AgentStatus) => void;
    addAgentMessage: (agent: AgentType, message: string) => void;
    generateTrip: (destination: string, dates: { start: string; end: string }, budget: number, styles: string[], travelers?: number) => Promise<TripData>;
    clearTrip: () => void;
    chatMessages: ChatMessage[];
    sendChatMessage: (message: string) => Promise<void>;
    isAITyping: boolean;
    isAIConfigured: boolean;
    savedTrips: TripData[];
    saveCurrentTrip: () => void;
    loadTrip: (index: number) => void;
    deleteTrip: (index: number) => void;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agent?: AgentType;
    timestamp: number;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

// ============================
// TRIP PERSISTENCE
// ============================

const TRIPS_STORAGE_KEY = 'faio_saved_trips';

function loadSavedTrips(): TripData[] {
    try {
        const raw = localStorage.getItem(TRIPS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [];
}

function persistTrips(trips: TripData[]): void {
    try {
        localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    } catch { /* ignore */ }
}

// Mock itinerary generation
const generateMockItinerary = (destination: string, styles: string[]): ItineraryDay[] => {
    const activities: Activity[] = [
        { id: '1', time: '08:00', title: 'Breakfast at Local Café', type: 'food', duration: '1h', cost: 15, carbonImpact: 2, location: `${destination} Old Town`, description: 'Start the day with authentic local coffee and pastries.' },
        { id: '2', time: '10:00', title: `${destination} Heritage Walk`, type: 'culture', duration: '2h', cost: 0, travelTime: '15 min', isOutdoor: true, backup: 'Museum Visit', carbonImpact: 5, location: 'Historic District', description: 'Explore iconic landmarks and learn the city\'s rich history.' },
        { id: '3', time: '12:30', title: 'Street Food Lunch', type: 'food', duration: '1.5h', cost: 12, travelTime: '10 min', carbonImpact: 3, location: 'Central Market', description: 'Taste the best local street food — noodles, grilled meats, and more.' },
        { id: '4', time: '14:30', title: 'Hidden Gem Discovery', type: 'culture', duration: '1.5h', cost: 10, travelTime: '15 min', isSecret: true, carbonImpact: 2, location: 'Secret Garden', description: 'A hidden courtyard that most tourists never find.' },
        { id: '5', time: '16:30', title: styles.includes('adventure') ? 'Adventure Activity' : 'Scenic Viewpoint', type: styles.includes('adventure') ? 'adventure' : 'nature', duration: '2h', cost: 45, travelTime: '20 min', isOutdoor: true, backup: 'Indoor Activity Center', carbonImpact: 15, location: 'City Hilltop', description: 'Take in breathtaking panoramic views of the city.' },
        { id: '6', time: '19:00', title: 'Sunset & Dinner', type: 'food', duration: '2h', cost: 40, travelTime: '10 min', carbonImpact: 8, location: 'Waterfront', description: 'Enjoy an incredible dinner with sunset views at a top-rated restaurant.' },
    ];

    return [
        { day: 1, date: 'Day 1', theme: 'Cultural Immersion', activities: activities.slice(0, 5) },
        { day: 2, date: 'Day 2', theme: 'Adventure & Discovery', activities },
        { day: 3, date: 'Day 3', theme: 'Local Flavors', activities: activities.slice(0, 5) },
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
    const [savedTrips, setSavedTrips] = useState<TripData[]>(loadSavedTrips);

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
        styles: string[],
        travelers?: number
    ): Promise<TripData> => {
        const agents: AgentType[] = ['itinerary', 'localSecrets', 'budget', 'safety', 'sustainability'];

        for (const agent of agents) {
            setAgentStatus(agent, 'thinking');
            addAgentMessage(agent, `${AGENTS[agent].emoji} ${AGENTS[agent].name} analyzing...`);
        }

        const aiTrip = await generateTripWithAI({
            destination,
            startDate: dates.start,
            endDate: dates.end,
            budget,
            travelStyles: styles,
            travelers: travelers || 1,
        });

        // Animate agent completion
        for (const agent of agents) {
            setAgentStatus(agent, 'responding');
            await new Promise(r => setTimeout(r, 300));

            const msgs: Record<AgentType, string> = {
                itinerary: aiTrip ? `Created ${aiTrip.totalDays}-day detailed itinerary with ${aiTrip.days.reduce((sum, d) => sum + d.activities.length, 0)} activities` : 'Itinerary generated',
                localSecrets: aiTrip?.localSecrets ? `Discovered ${aiTrip.localSecrets.length} hidden gems & insider tips` : 'Found local secrets',
                budget: aiTrip ? `Total estimated: $${aiTrip.totalCost.toFixed(0)} across ${aiTrip.totalDays} days` : 'Budget calculated',
                safety: aiTrip?.safetyTips ? `${aiTrip.safetyTips.length} safety tips + ${aiTrip.transportTips?.length || 0} transport tips` : 'Safety assessed',
                sustainability: aiTrip ? `Carbon: ${aiTrip.carbonFootprint.toFixed(0)}kg CO2 | Score: ${aiTrip.sustainabilityScore}/100` : 'Sustainability scored',
                liveUpdate: 'Monitoring conditions...'
            };

            addAgentMessage(agent, msgs[agent]);
            setAgentStatus(agent, 'complete');
        }

        // Convert AI response to TripData format
        const itinerary: ItineraryDay[] = aiTrip?.days.map((day, index) => ({
            day: index + 1,
            date: day.date,
            theme: day.theme,
            activities: day.activities.map(act => ({
                id: act.id,
                time: act.time,
                title: act.name,
                type: act.type || 'activity',
                duration: act.duration,
                cost: act.cost,
                location: act.location,
                description: act.description,
                backup: act.backupOption,
                isOutdoor: act.isOutdoor,
                isSecret: false,
                isEcoFriendly: act.isEcoFriendly,
                carbonImpact: act.carbonKg,
            }))
        })) || generateMockItinerary(destination, styles);

        const newTripData: TripData = {
            destination,
            startDate: dates.start,
            endDate: dates.end,
            budget,
            styles,
            travelers,
            itinerary,
            totalCost: aiTrip?.totalCost || budget * 0.85,
            carbonFootprint: aiTrip?.carbonFootprint || 420,
            sustainabilityScore: aiTrip?.sustainabilityScore || 78,
            packingList: aiTrip?.packingList,
            safetyTips: aiTrip?.safetyTips,
            localSecrets: aiTrip?.localSecrets,
            overview: aiTrip?.overview,
            bestTimeToVisit: aiTrip?.bestTimeToVisit,
            currency: aiTrip?.currency,
            language: aiTrip?.language,
            topPlaces: aiTrip?.topPlaces,
            dining: aiTrip?.dining,
            transportTips: aiTrip?.transportTips,
        };

        setTripData(newTripData);

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

    const saveCurrentTrip = useCallback(() => {
        if (!tripData) return;
        const updated = [tripData, ...savedTrips].slice(0, 10); // max 10 trips
        setSavedTrips(updated);
        persistTrips(updated);
    }, [tripData, savedTrips]);

    const loadTrip = useCallback((index: number) => {
        if (savedTrips[index]) {
            setTripData(savedTrips[index]);
        }
    }, [savedTrips]);

    const deleteTrip = useCallback((index: number) => {
        const updated = savedTrips.filter((_, i) => i !== index);
        setSavedTrips(updated);
        persistTrips(updated);
    }, [savedTrips]);

    const sendChatMessage = useCallback(async (message: string) => {
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: Date.now(),
        };
        setChatMessages(prev => [...prev, userMessage]);
        setIsAITyping(true);

        const chatHistory = chatMessages.map(m => ({
            role: m.role,
            content: m.content,
        }));

        const aiResponse = await chatWithAI(chatHistory, message);

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
            savedTrips,
            saveCurrentTrip,
            loadTrip,
            deleteTrip,
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
