import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Sparkles, ArrowRight,
    CloudSun, Navigation, TrendingUp,
    Leaf, ChevronRight, Thermometer, Droplets, MessageCircle, Zap, Search, X,
    Clock, MapPin, Plane, Star, Users, Globe, Shield, Backpack, FileText, Car, BookOpen,
    Train, Bus, Building2
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';
import { useEnvironment, getWeatherEmoji } from '../../context/EnvironmentContext';

type TabType = 'home' | 'explore' | 'planner' | 'wallet' | 'safety' | 'profile' | 'guides' | 'cabs' | 'hotels' | 'flights' | 'trains' | 'buses' | 'visa' | 'packing' | 'documents';

interface HomeViewProps {
    onNavigate?: (tab: TabType) => void;
    onOpenChat?: () => void;
}

// AI-generated contextual tips based on time + weather
function getAITip(hour: number, isRaining: boolean, tripData: any): string {
    if (tripData) {
        const start = new Date(tripData.startDate);
        const now = new Date();
        const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 7) return `🎒 ${daysUntil} days to go! Start packing for ${tripData.destination}`;
        if (daysUntil <= 0) return `✈️ You're in ${tripData.destination}! Check today's itinerary`;
    }
    if (isRaining) return '🌧️ Rainy day — perfect for museums & cafés!';
    if (hour < 9) return '🌅 Early bird! Best time to beat the crowds at popular spots';
    if (hour < 12) return '☀️ Great morning for outdoor exploration & walking tours';
    if (hour < 14) return '🍜 Lunch time! Try the local street food scene';
    if (hour < 17) return '📸 Golden hour approaching — camera ready!';
    if (hour < 20) return '🌆 Sunset views & rooftop bars await';
    return '🌙 Night markets & local nightlife — stay safe!';
}

export function HomeView({ onNavigate, onOpenChat }: HomeViewProps) {
    const [greeting, setGreeting] = useState('Good Morning');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const { tripData, sendChatMessage, isAITyping, savedTrips } = useAIAgents();
    
    // Switcher and Search Console State
    const [bookingTab, setBookingTab] = useState<'flights' | 'hotels' | 'trains' | 'buses' | 'cabs' | 'planner'>('hotels');
    const [fromCity, setFromCity] = useState('Delhi (DEL)');
    const [toCity, setToCity] = useState('Mumbai (BOM)');
    const [destinationCity, setDestinationCity] = useState('Goa, India');
    const [departureDate, setDepartureDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow
    const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]); // 3 days later
    const [passengersCount, setPassengersCount] = useState(1);
    const [flightClass, setFlightClass] = useState('Economy');
    const [hotelRooms, setHotelRooms] = useState(1);
    const [hotelGuests, setHotelGuests] = useState(2);
    const [trainClass, setTrainClass] = useState('All Classes');
    const [cabTime, setCabTime] = useState('10:00');
    const [itineraryDays, setItineraryDays] = useState(5);
    const [tripStyle, setTripStyle] = useState('balanced');

    const { isRaining, isHighTraffic, weather, forecast, currentCity, setCity, weatherAlert } = useEnvironment();

    const [currentHour, setCurrentHour] = useState(new Date().getHours());

    useEffect(() => {
        const hour = new Date().getHours();
        setCurrentHour(hour);
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const aiTip = useMemo(() => getAITip(currentHour, isRaining, tripData), [currentHour, isRaining, tripData]);

    // Trip countdown
    const tripCountdown = useMemo(() => {
        if (!tripData) return null;
        const start = new Date(tripData.startDate);
        const now = new Date();
        const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { daysUntil, destination: tripData.destination };
    }, [tripData]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="p-5 pt-12 space-y-6 pb-32">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end mb-4"
            >
                <div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight leading-none">
                        {greeting},
                        <br />
                        <span className="text-primary">Explorer</span>
                    </h1>
                    <p className="text-stone-400 mt-2 text-[10px] font-black uppercase tracking-[0.2em]">FAIO Intelligence System</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAITyping && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-full border border-stone-100">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <span className="text-[9px] text-stone-900 font-black uppercase tracking-widest">Processing</span>
                        </div>
                    )}
                    <div className="w-14 h-14 rounded-[20px] bg-white flex items-center justify-center border border-stone-100 overflow-hidden shadow-premium p-1">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="w-full h-full rounded-[16px] object-cover"
                        />
                    </div>
                </div>
            </motion.header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-5"
            >
                {/* AI Contextual Tip */}
                <motion.div variants={item}>
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl" />
                        <div className="flex items-center gap-3 relative z-10">
                            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                            <p className="text-sm font-medium text-stone-700">{aiTip}</p>
                        </div>
                    </div>
                </motion.div>

                {/* MakeMyTrip-Style Multi-Vertical Booking Console */}
                <motion.div variants={item}>
                    <div className="bg-white rounded-[40px] border border-stone-100 shadow-premium p-6 relative overflow-hidden">
                        {/* Glow element */}
                        <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 transition-all duration-500 ${
                            bookingTab === 'flights' ? 'bg-blue-500' :
                            bookingTab === 'hotels' ? 'bg-rose-500' :
                            bookingTab === 'trains' ? 'bg-amber-500' :
                            bookingTab === 'buses' ? 'bg-emerald-500' :
                            bookingTab === 'cabs' ? 'bg-purple-500' : 'bg-primary'
                        }`} />

                        {/* Category switcher */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-4 mb-5 border-b border-stone-100">
                            {[
                                { id: 'hotels' as const, label: 'Stays', icon: Building2, emoji: '🏨' },
                                { id: 'flights' as const, label: 'Flights', icon: Plane, emoji: '✈️' },
                                { id: 'trains' as const, label: 'Trains', icon: Train, emoji: '🚆' },
                                { id: 'buses' as const, label: 'Buses', icon: Bus, emoji: '🚌' },
                                { id: 'cabs' as const, label: 'Cabs', icon: Car, emoji: '🚖' },
                                { id: 'planner' as const, label: 'AI Planner', icon: Sparkles, emoji: '🗺️' },
                            ].map((cat) => {
                                const Icon = cat.icon;
                                const isActive = bookingTab === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setBookingTab(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                            isActive
                                                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                                                : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200 hover:text-stone-700'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dynamic fields */}
                        {bookingTab === 'hotels' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-500" /> Destination City</p>
                                        <input type="text" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder="Where are you staying?" className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex gap-2">
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> Check In</p>
                                            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-[11px] text-stone-900" />
                                        </div>
                                        <div className="w-px bg-stone-200 self-stretch my-1" />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> Check Out</p>
                                            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-[11px] text-stone-900" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex gap-2">
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Users className="w-3 h-3 text-stone-400" /> Guests</p>
                                            <select value={hotelGuests} onChange={(e) => setHotelGuests(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900 appearance-none">
                                                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-px bg-stone-200 self-stretch my-1" />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Building2 className="w-3 h-3 text-stone-400" /> Rooms</p>
                                            <select value={hotelRooms} onChange={(e) => setHotelRooms(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900 appearance-none">
                                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
                                    localStorage.setItem('faio_pending_hotel_search', JSON.stringify({ city: destinationCity, checkIn: departureDate, checkOut: returnDate, guests: hotelGuests, rooms: hotelRooms }));
                                    onNavigate?.('hotels');
                                }} className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Search className="w-4 h-4 text-rose-400" /> Acquire Premium Stays
                                </motion.button>
                            </div>
                        )}

                        {bookingTab === 'flights' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Plane className="w-3 h-3 text-blue-500 rotate-45" /> Leaving From</p>
                                        <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="From city..." className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="flex items-center justify-center -my-2 md:my-0 md:-mx-2 z-10">
                                        <button onClick={() => { const tmp = fromCity; setFromCity(toCity); setToCity(tmp); }} className="w-9 h-9 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm transition-transform active:scale-95">
                                            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Plane className="w-3 h-3 text-blue-500 -rotate-45" /> Going To</p>
                                        <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="To city..." className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> Departure Date</p>
                                        <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-[11px] text-stone-900" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex gap-2">
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Users className="w-3 h-3 text-stone-400" /> Passengers</p>
                                            <select value={passengersCount} onChange={(e) => setPassengersCount(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900 appearance-none">
                                                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} traveler{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-px bg-stone-200 self-stretch my-1" />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Star className="w-3 h-3 text-stone-400" /> Cabin Class</p>
                                            <select value={flightClass} onChange={(e) => setFlightClass(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900 appearance-none">
                                                {['Economy', 'Premium Eco', 'Business', 'First'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
                                    localStorage.setItem('faio_pending_flight_search', JSON.stringify({ from: fromCity, to: toCity, date: departureDate, passengers: passengersCount, class: flightClass }));
                                    onNavigate?.('flights');
                                }} className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Search className="w-4 h-4 text-blue-400" /> Commence Flight Search
                                </motion.button>
                            </div>
                        )}

                        {bookingTab === 'trains' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> From Station</p>
                                        <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="Leaving station..." className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="flex items-center justify-center -my-2 md:my-0 md:-mx-2 z-10">
                                        <button onClick={() => { const tmp = fromCity; setFromCity(toCity); setToCity(tmp); }} className="w-9 h-9 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm transition-transform active:scale-95">
                                            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> To Station</p>
                                        <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="Arriving station..." className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> Travel Date</p>
                                        <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-[11px] text-stone-900" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Star className="w-3 h-3 text-stone-400" /> Journey Class</p>
                                        <select value={trainClass} onChange={(e) => setTrainClass(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900 appearance-none">
                                            {['All Classes', '1AC Executive', '2AC Tier', '3AC Sleeper', 'Sleeper Class', 'Second Sitting'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
                                    localStorage.setItem('faio_pending_train_search', JSON.stringify({ from: fromCity, to: toCity, date: departureDate, class: trainClass }));
                                    onNavigate?.('trains');
                                }} className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Search className="w-4 h-4 text-amber-400" /> Locate Express Trains
                                </motion.button>
                            </div>
                        )}

                        {bookingTab === 'buses' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> Leaving From</p>
                                        <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="From city..." className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="flex items-center justify-center -my-2 md:my-0 md:-mx-2 z-10">
                                        <button onClick={() => { const tmp = fromCity; setFromCity(toCity); setToCity(tmp); }} className="w-9 h-9 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm transition-transform active:scale-95">
                                            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> Going To</p>
                                        <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="To city..." className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> Transit Date</p>
                                        <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-[11px] text-stone-900" />
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
                                    localStorage.setItem('faio_pending_bus_search', JSON.stringify({ from: fromCity, to: toCity, date: departureDate }));
                                    onNavigate?.('buses');
                                }} className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Search className="w-4 h-4 text-emerald-400" /> Locate Fleet Transit
                                </motion.button>
                            </div>
                        )}

                        {bookingTab === 'cabs' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-500" /> Pick Up Location</p>
                                        <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="Where pickup?" className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="flex items-center justify-center -my-2 md:my-0 md:-mx-2 z-10">
                                        <button onClick={() => { const tmp = fromCity; setFromCity(toCity); setToCity(tmp); }} className="w-9 h-9 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm transition-transform active:scale-95">
                                            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-500" /> Drop Off Location</p>
                                        <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="Where dropoff?" className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex gap-2">
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> Pick Date</p>
                                            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-[11px] text-stone-900" />
                                        </div>
                                        <div className="w-px bg-stone-200 self-stretch my-1" />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3 text-stone-400" /> Pick Time</p>
                                            <input type="time" value={cabTime} onChange={(e) => setCabTime(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900" />
                                        </div>
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
                                    localStorage.setItem('faio_pending_cab_search', JSON.stringify({ from: fromCity, to: toCity, date: departureDate, time: cabTime }));
                                    onNavigate?.('cabs');
                                }} className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Car className="w-4 h-4 text-purple-400" /> Book Ground Operations
                                </motion.button>
                            </div>
                        )}

                        {bookingTab === 'planner' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> Target Destination</p>
                                        <input type="text" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder="Kyoto, Japan" className="w-full bg-transparent border-none outline-none font-black text-sm text-stone-900 placeholder:text-stone-300" />
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> Duration (Days)</p>
                                        <select value={itineraryDays} onChange={(e) => setItineraryDays(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900 appearance-none">
                                            {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Star className="w-3 h-3 text-stone-400" /> Travel Style</p>
                                        <select value={tripStyle} onChange={(e) => setTripStyle(e.target.value)} className="w-full bg-transparent border-none outline-none font-black text-xs text-stone-900 appearance-none">
                                            {['balanced', 'luxury', 'budget', 'eco-friendly'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={async () => {
                                    const prompt = `Plan a ${itineraryDays} days ${tripStyle} trip to ${destinationCity}`;
                                    await sendChatMessage(prompt);
                                    onNavigate?.('planner');
                                    onOpenChat?.();
                                }} className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Sparkles className="w-4 h-4 text-amber-400" /> Generate Neural Itinerary
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Travel Ecosystem */}
                <motion.div variants={item}>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                            <Shield className="w-3 h-3 text-stone-400" /> Utility Ecosystem
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'VISA PORTAL', icon: <Globe className="w-5 h-5" />, tab: 'visa' as TabType, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { label: 'SAFE PASSAGE', icon: <Shield className="w-5 h-5" />, tab: 'safety' as TabType, color: 'text-rose-500', bg: 'bg-rose-50' },
                            { label: 'UNIT PREP', icon: <Backpack className="w-5 h-5" />, tab: 'packing' as TabType, color: 'text-teal-500', bg: 'bg-teal-50' },
                            { label: 'DATA VAULT', icon: <FileText className="w-5 h-5" />, tab: 'documents' as TabType, color: 'text-sky-500', bg: 'bg-sky-50' },
                            { label: 'GROUND OPS', icon: <Car className="w-5 h-5" />, tab: 'cabs' as TabType, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { label: 'LOCAL KNOWLEDGE', icon: <BookOpen className="w-5 h-5" />, tab: 'guides' as TabType, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        ].map((opt, i) => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onNavigate?.(opt.tab)}
                                className="flex flex-col items-center gap-3 p-5 rounded-[28px] bg-white border border-stone-100 shadow-sm group hover:border-stone-200 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${opt.bg} flex items-center justify-center ${opt.color}`}>
                                    {opt.icon}
                                </div>
                                <span className="text-[9px] font-black text-stone-900 text-center leading-none uppercase tracking-widest">{opt.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Trip Countdown / Active Trip */}
                {tripData ? (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800 flex items-center gap-2">
                                <Plane className="w-4 h-4 text-primary" />
                                {tripCountdown && tripCountdown.daysUntil > 0 ? 'Upcoming Trip' : 'Active Trip'}
                            </h2>
                            <button
                                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                                onClick={() => onNavigate?.('planner')}
                            >
                                View details <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <GlassCard className="p-5 border border-stone-100 bg-white" glow>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                        {tripCountdown && tripCountdown.daysUntil > 0 ? `${tripCountdown.daysUntil} days to go` : 'Active'}
                                    </span>
                                    <h3 className="text-2xl font-black text-stone-900 mt-2">{tripData.destination}</h3>
                                    <div className="flex items-center gap-2 text-stone-500 font-medium text-sm mt-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{tripData.startDate} — {tripData.endDate}</span>
                                    </div>
                                    {tripData.travelers && (
                                        <div className="flex items-center gap-1 text-stone-500 font-medium text-xs mt-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{tripData.travelers} traveler{tripData.travelers > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Est. Cost</p>
                                    <p className="text-xl font-black text-emerald-600">${tripData.totalCost.toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Trip Stats */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <Clock className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.itinerary.length}d</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Duration</p>
                                </div>
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <MapPin className="w-4 h-4 mx-auto text-primary mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.itinerary.reduce((s: number, d: any) => s + d.activities.length, 0)}</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Activities</p>
                                </div>
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <Star className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.sustainabilityScore}</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Eco Score</p>
                                </div>
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <Leaf className="w-4 h-4 mx-auto text-teal-500 mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.carbonFootprint}kg</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">CO2</p>
                                </div>
                            </div>

                            {/* Today's First Activity */}
                            {tripData.itinerary[0]?.activities?.[0] && (
                                <div className="mt-4 p-3.5 bg-white border border-stone-100 rounded-xl flex items-center gap-3 shadow-sm">
                                    <div className="w-1.5 h-10 bg-primary rounded-full" />
                                    <div className="flex-1">
                                        <p className="text-[10px] text-stone-600 font-medium uppercase tracking-[0.2em] mb-4">Financial Pulse</p>
                                        <p className="font-bold text-sm text-stone-900">{tripData.itinerary[0].activities[0].title}</p>
                                        <p className="text-xs font-medium text-stone-500">{tripData.itinerary[0].activities[0].time} · {tripData.itinerary[0].activities[0].duration}</p>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800">Start Planning</h2>
                        </div>
                        <GlassCard className="p-5 cursor-pointer bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100" onClick={() => onNavigate?.('planner')}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center animate-float shadow-lg shadow-primary/30">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-stone-900">Let AI plan your trip</h3>
                                    <p className="text-stone-600 font-medium text-sm">6 agents collaborate for the perfect itinerary</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-primary" />
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Saved Trips Quick Access */}
                {savedTrips.length > 0 && !tripData && (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-purple-500" />
                                Recent Trips
                            </h2>
                            <span className="text-xs font-medium text-stone-500">{savedTrips.length} saved</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 no-scrollbar">
                            {savedTrips.slice(0, 5).map((trip, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="min-w-[160px] cursor-pointer"
                                    onClick={() => onNavigate?.('planner')}
                                >
                                    <GlassCard className="p-4 bg-white border-stone-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-stone-900 truncate max-w-[100px]">{trip.destination}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500">
                                            <span>{trip.itinerary.length}d</span>
                                            <span>·</span>
                                            <span className="text-emerald-600">${trip.totalCost.toFixed(0)}</span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Real Weather Widget */}
                <motion.div variants={item}>
                    <GlassCard className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {isEditingLocation ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (locationInput.trim()) {
                                                setCity(locationInput);
                                                setIsEditingLocation(false);
                                            }
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={locationInput}
                                            onChange={(e) => setLocationInput(e.target.value)}
                                            onBlur={() => {
                                                setTimeout(() => setIsEditingLocation(false), 200);
                                            }}
                                            className="bg-stone-100 border border-stone-200 rounded-full px-3 py-1 text-sm font-bold w-32 outline-none focus:border-primary text-stone-900"
                                            placeholder="City..."
                                        />
                                        <button type="submit" className="p-1 hover:bg-stone-100 rounded-full transition-colors">
                                            <Search className="w-4 h-4 text-primary" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingLocation(false)}
                                            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-stone-400" />
                                        </button>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setLocationInput(currentCity);
                                            setIsEditingLocation(true);
                                        }}
                                        className="flex items-center gap-2 group"
                                    >
                                        <h3 className="font-bold text-sm text-stone-900">Weather in {currentCity}</h3>
                                        <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-primary transition-colors" />
                                    </button>
                                )}
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black tracking-wider uppercase rounded-full">LIVE</span>
                            </div>
                        </div>

                        {weather ? (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-5xl drop-shadow-sm">{getWeatherEmoji(weather.icon)}</span>
                                        <div>
                                            <p className="text-3xl font-black text-stone-900">{weather.temperature}°C</p>
                                            <p className="text-sm font-bold text-stone-500 capitalize">{weather.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
                                            <Thermometer className="w-4 h-4 text-rose-400" />
                                            <span>Feels {weather.feelsLike}°</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-stone-500 mt-1">
                                            <Droplets className="w-4 h-4 text-blue-400" />
                                            <span>{weather.humidity}% hum</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Forecast */}
                                {forecast.length > 0 && (
                                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                                        {forecast.slice(0, 5).map((day, i) => (
                                            <div key={i} className="flex-shrink-0 text-center p-2.5 bg-stone-50 border border-stone-100 rounded-2xl min-w-[60px]">
                                                <p className="text-[10px] font-bold text-stone-400 uppercase">{day.dayName}</p>
                                                <span className="text-2xl block my-1">{getWeatherEmoji(day.icon)}</span>
                                                <p className="text-sm font-black text-stone-800">{day.tempMax}°</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Weather Alert */}
                                {weatherAlert && (
                                    <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${weatherAlert.severity === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                                        weatherAlert.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                            'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>
                                        <CloudSun className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm font-bold">{weatherAlert.description}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-4 rounded-2xl border ${isRaining ? 'bg-blue-50 border-blue-100' : 'bg-stone-50 border-stone-100'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CloudSun className={`w-5 h-5 ${isRaining ? 'text-blue-500' : 'text-stone-400'}`} />
                                        <span className="text-xs font-bold text-stone-500">Weather</span>
                                    </div>
                                    <p className={`font-black text-lg ${isRaining ? 'text-blue-700' : 'text-stone-900'}`}>
                                        {isRaining ? 'Rainy' : 'Clear'}
                                    </p>
                                </div>
                                <div className={`p-4 rounded-2xl border ${isHighTraffic ? 'bg-amber-50 border-amber-100' : 'bg-stone-50 border-stone-100'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Navigation className={`w-5 h-5 ${isHighTraffic ? 'text-amber-500' : 'text-stone-400'}`} />
                                        <span className="text-xs font-bold text-stone-500">Traffic</span>
                                    </div>
                                    <p className={`font-black text-lg ${isHighTraffic ? 'text-amber-700' : 'text-stone-900'}`}>
                                        {isHighTraffic ? 'Heavy' : 'Light'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>

                {/* FAIO AI Assistant */}
                <motion.div variants={item}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-stone-800 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            FAIO AI
                        </h2>
                        <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 uppercase tracking-wider">
                            <Zap className="w-3 h-3 text-amber-500" /> Powered by Groq
                        </span>
                    </div>
                    <GlassCard className="p-5" onClick={() => onOpenChat?.()}>
                        <div className="flex items-center gap-4 mb-5 cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-stone-900 text-lg">Chat with FAIO</h3>
                                <p className="text-sm font-medium text-stone-500">Your personal AI travel companion</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-stone-400" />
                        </div>

                        {/* Quick Prompt Chips */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: '🗺️ Plan a trip', query: 'Help me plan a trip' },
                                { label: '🍜 Find restaurants', query: 'Find best local restaurants' },
                                { label: '🛡️ Safety tips', query: 'What safety tips should I know?' },
                                { label: '💰 Budget advice', query: 'Budget travel tips' },
                                { label: '🌿 Eco travel', query: 'Eco-friendly travel tips' },
                                { label: '📸 Photo spots', query: 'Best photography locations nearby' },
                            ].map((chip, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await sendChatMessage(chip.query);
                                        onOpenChat?.();
                                    }}
                                    className="px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-full text-xs font-bold text-stone-600 transition-colors"
                                >
                                    {chip.label}
                                </motion.button>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Quick Stats (when trip exists) */}
                {savedTrips.length > 0 && (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Your Stats
                            </h2>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <GlassCard className="p-4 text-center border-stone-100 bg-white">
                                <Plane className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                                <p className="text-xl font-black text-stone-900">{savedTrips.length}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Trips Planned</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center border-stone-100 bg-white">
                                <Globe className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                                <p className="text-xl font-black text-stone-900">{new Set(savedTrips.map(t => t.destination)).size}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Destinations</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center border-stone-100 bg-white">
                                <Leaf className="w-6 h-6 mx-auto text-teal-500 mb-2" />
                                <p className="text-xl font-black text-stone-900">{Math.round(savedTrips.reduce((s, t) => s + (t.sustainabilityScore || 0), 0) / savedTrips.length)}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Avg Eco</p>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}

                {/* Trending Destinations */}
                <motion.div variants={item}>
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h2 className="font-heading text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary animate-pulse" /> Trending curation
                            </h2>
                            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Acquired by global analytics</p>
                        </div>
                        <button onClick={() => onNavigate?.('explore')} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 hover:underline">
                            See all <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop', rating: '4.9', reviews: '1,234 reviews', tag: 'Culture', price: '$120' },
                            { name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=400&auto=format&fit=crop', rating: '4.8', reviews: '984 reviews', tag: 'Romance', price: '$180' },
                            { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=400&auto=format&fit=crop', rating: '4.7', reviews: '2,430 reviews', tag: 'Wellness', price: '$85' },
                            { name: 'Reykjavik', country: 'Iceland', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=400&auto=format&fit=crop', rating: '4.8', reviews: '742 reviews', tag: 'Adventure', price: '$210' },
                        ].map((place, i) => (
                            <motion.div
                                key={i}
                                className="group cursor-pointer flex flex-col"
                                whileHover={{ scale: 1.015, y: -2 }}
                                onClick={() => {
                                    localStorage.setItem('faio_pending_hotel_search', JSON.stringify({ city: place.name }));
                                    onNavigate?.('hotels');
                                }}
                            >
                                {/* Image Container */}
                                <div className="h-52 rounded-[28px] relative overflow-hidden shadow-card group-hover:shadow-card-hover transition-all duration-300">
                                    <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    
                                    {/* AI Tag */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-[9px] font-black text-stone-900 uppercase tracking-widest rounded-xl shadow-soft flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5 text-primary" /> {place.tag}
                                        </span>
                                    </div>

                                    {/* Score Tag */}
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2.5 py-1 bg-stone-950 text-[10px] font-black text-white rounded-xl shadow-md flex items-center gap-1 border border-stone-800">
                                            ⭐ {place.rating}
                                        </span>
                                    </div>
                                </div>

                                {/* Text Details */}
                                <div className="pt-3 px-1 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-heading text-base font-black text-stone-900 tracking-tight leading-tight">{place.name}, {place.country}</h3>
                                        <span className="text-xs font-black text-stone-900">{place.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">
                                        <span>Curated Stay Plan</span>
                                        <span>per night</span>
                                    </div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mt-0.5">★ {place.reviews}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
