import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Clock, Star, Shield, Navigation,
    Users, Phone, MessageCircle,
    Loader2, CheckCircle,
    AlertTriangle, Share2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';

interface RideOption {
    id: string;
    type: string;
    icon: string;
    eta: string;
    price: number;
    priceRange: string;
    capacity: number;
    description: string;
    isEco: boolean;
    isSafe: boolean;
    surge: number;
}

interface Driver {
    name: string;
    rating: number;
    trips: number;
    car: string;
    plate: string;
    photo: string;
    isVerified: boolean;
}

const RIDE_OPTIONS: RideOption[] = [
    { id: '1', type: 'Economy', icon: '🚗', eta: '3 min', price: 8, priceRange: '$8-12', capacity: 4, description: 'Affordable daily rides', isEco: false, isSafe: true, surge: 1 },
    { id: '2', type: 'Comfort', icon: '🚙', eta: '5 min', price: 15, priceRange: '$15-20', capacity: 4, description: 'Extra legroom & quiet ride', isEco: false, isSafe: true, surge: 1 },
    { id: '3', type: 'Eco Green', icon: '🔋', eta: '4 min', price: 10, priceRange: '$10-14', capacity: 4, description: 'Electric vehicle, zero emissions', isEco: true, isSafe: true, surge: 1 },
    { id: '4', type: 'XL', icon: '🚐', eta: '7 min', price: 22, priceRange: '$22-28', capacity: 6, description: 'Extra space for groups', isEco: false, isSafe: true, surge: 1 },
    { id: '5', type: 'Women Safe', icon: '🛡️', eta: '6 min', price: 12, priceRange: '$12-16', capacity: 4, description: 'Verified female drivers only', isEco: false, isSafe: true, surge: 1 },
];

export function CabBookingView() {
    const { tripData } = useAIAgents();
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [selectedRide, setSelectedRide] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showRides, setShowRides] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [rideBooked, setRideBooked] = useState(false);
    const [shareRide, setShareRide] = useState(false);

    const [driver] = useState<Driver>({
        name: 'Kenji M.', rating: 4.9, trips: 2340,
        car: 'Toyota Prius', plate: 'ABC 1234', photo: '🧑‍✈️', isVerified: true
    });

    const handleSearch = async () => {
        if (!pickup || !dropoff) return;
        setIsSearching(true);
        await new Promise(r => setTimeout(r, 1200));
        setIsSearching(false);
        setShowRides(true);
    };

    const handleBook = async () => {
        setIsBooking(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsBooking(false);
        setRideBooked(true);
    };

    const selectedOption = RIDE_OPTIONS.find(r => r.id === selectedRide);

    if (rideBooked) {
        return (
            <div className="p-5 pt-12 min-h-screen pb-32">
                <RideTracker driver={driver} rideType={selectedOption!} shareRide={shareRide} onCancel={() => setRideBooked(false)} />
            </div>
        );
    }

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Car className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Safe Rides</span>
                </div>
                <h1 className="text-3xl font-bold">Book a Ride</h1>
                <p className="text-secondary text-sm">
                    {tripData ? `Verified rides in ${tripData.destination}` : 'AI-verified safe transport'}
                </p>
            </motion.header>

            {/* Route Input */}
            <GlassCard className="p-4 mb-5">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            <div className="w-0.5 h-8 bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)}
                                placeholder="Pickup location"
                                className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-action"
                            />
                            <input type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)}
                                placeholder="Where to?"
                                className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-action"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={!pickup || !dropoff || isSearching}
                        className="w-full py-3 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSearching ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding rides...</> : <><Navigation className="w-4 h-4" /> Find Rides</>}
                    </button>
                </div>
            </GlassCard>

            {/* Safety Features */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <GlassCard className="p-2.5 text-center">
                    <Shield className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <p className="text-[10px] font-bold">ID Verified</p>
                    <p className="text-[9px] text-secondary">All drivers</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <Navigation className="w-4 h-4 mx-auto text-action mb-1" />
                    <p className="text-[10px] font-bold">Live Track</p>
                    <p className="text-[9px] text-secondary">Real-time GPS</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <Share2 className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <p className="text-[10px] font-bold">Share Ride</p>
                    <p className="text-[9px] text-secondary">With contacts</p>
                </GlassCard>
            </div>

            {/* Ride Options */}
            <AnimatePresence>
                {showRides && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold">Available Rides</h3>
                            <span className="text-xs text-secondary">{RIDE_OPTIONS.length} options</span>
                        </div>

                        {RIDE_OPTIONS.map((ride, i) => (
                            <motion.div
                                key={ride.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <button onClick={() => setSelectedRide(ride.id)} className="w-full text-left">
                                    <GlassCard className={cn(
                                        "p-4 transition-all",
                                        selectedRide === ride.id ? "border-action bg-action/5" : "hover:border-slate-600"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{ride.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold">{ride.type}</h4>
                                                    {ride.isEco && (
                                                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded">ECO</span>
                                                    )}
                                                    {ride.type === 'Women Safe' && (
                                                        <span className="px-1.5 py-0.5 bg-pink-500/10 text-pink-400 text-[9px] font-bold rounded">SAFE</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-secondary">{ride.description}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-secondary">
                                                        <Clock className="w-3 h-3" /> {ride.eta}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-secondary">
                                                        <Users className="w-3 h-3" /> {ride.capacity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-action">${ride.price}</p>
                                                <p className="text-[10px] text-secondary">{ride.priceRange}</p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </button>
                            </motion.div>
                        ))}

                        {/* Share Ride Toggle */}
                        <GlassCard className="p-4 flex items-center gap-3">
                            <Share2 className={cn("w-5 h-5", shareRide ? "text-action" : "text-secondary")} />
                            <div className="flex-1">
                                <p className="text-sm font-bold">Share ride with contacts</p>
                                <p className="text-xs text-secondary">Auto-share trip details for safety</p>
                            </div>
                            <button onClick={() => setShareRide(!shareRide)}
                                className={cn(
                                    "w-12 h-7 rounded-full transition-colors flex items-center px-1",
                                    shareRide ? "bg-action" : "bg-slate-700",
                                )}
                            >
                                <motion.div animate={{ x: shareRide ? 20 : 0 }}
                                    className="w-5 h-5 bg-white rounded-full shadow"
                                />
                            </button>
                        </GlassCard>

                        {/* Book Button */}
                        {selectedRide && (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleBook}
                                disabled={isBooking}
                                className="w-full py-4 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isBooking ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Matching driver...</>
                                ) : (
                                    `Confirm ${selectedOption?.type} — $${selectedOption?.price}`
                                )}
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================
// RIDE TRACKER
// ============================
function RideTracker({ driver, rideType, shareRide, onCancel }: {
    driver: Driver; rideType: RideOption; shareRide: boolean; onCancel: () => void
}) {
    const [eta, setEta] = useState(5);

    useEffect(() => {
        const t = setInterval(() => setEta(e => Math.max(0, e - 1)), 60000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard gradient="green" glow className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                        </motion.div>
                        <span className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Driver En Route</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">{eta} min</h2>
                    <p className="text-sm text-white/70">Estimated arrival</p>
                </GlassCard>
            </motion.div>

            {/* Driver Card */}
            <GlassCard className="p-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full  bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center text-3xl">
                        {driver.photo}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{driver.name}</h3>
                            {driver.isVerified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold">{driver.rating}</span>
                            <span>•</span>
                            <span>{driver.trips} trips</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 bg-action/10 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-action" />
                        </button>
                        <button className="w-10 h-10 bg-action/10 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-action" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 bg-surface/50 rounded-lg text-center">
                        <p className="text-xs text-secondary">Car</p>
                        <p className="text-sm font-bold">{driver.car}</p>
                    </div>
                    <div className="p-2 bg-surface/50 rounded-lg text-center">
                        <p className="text-xs text-secondary">Plate</p>
                        <p className="text-sm font-bold">{driver.plate}</p>
                    </div>
                    <div className="p-2 bg-surface/50 rounded-lg text-center">
                        <p className="text-xs text-secondary">Ride</p>
                        <p className="text-sm font-bold">{rideType.type}</p>
                    </div>
                </div>

                {shareRide && (
                    <div className="p-3 bg-emerald-500/10 rounded-xl flex items-center gap-2 mb-4">
                        <Share2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">Ride details shared with emergency contacts</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 py-3 border border-red-500/30 text-red-400 rounded-xl font-bold text-sm">
                        Cancel Ride
                    </button>
                    <button className="flex-1 py-3 bg-action text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Safety Alert
                    </button>
                </div>
            </GlassCard>

            {/* Safety Tips */}
            <GlassCard className="p-4">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    Safety Reminders
                </h4>
                <ul className="space-y-2 text-xs text-secondary">
                    <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> Verify plate number matches before entering</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> Share your ride details with a trusted contact</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" /> Sit in the back seat and keep your phone charged</li>
                </ul>
            </GlassCard>
        </div>
    );
}
