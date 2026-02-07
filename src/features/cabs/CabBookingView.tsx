import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Navigation, CreditCard, Star,
    Car, Phone, MessageSquare, X, User
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';

// ============================
// TYPES
// ============================

interface RideOption {
    id: string;
    type: 'Economy' | 'Comfort' | 'Premium' | 'Van';
    name: string;
    image: string;
    price: number;
    currency: string;
    eta: number; // minutes
    capacity: number;
    description: string;
}

interface Driver {
    name: string;
    rating: number;
    carModel: string;
    plateNumber: string;
    phone: string;
    avatar: string;
}

// ============================
// MOCK DATA
// ============================

const RIDE_OPTIONS: RideOption[] = [
    {
        id: '1',
        type: 'Economy',
        name: 'Eco Saver',
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Placeholder icon
        price: 12.50,
        currency: 'USD',
        eta: 4,
        capacity: 4,
        description: 'Affordable everyday rides'
    },
    {
        id: '2',
        type: 'Comfort',
        name: 'Comfort',
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097136.png',
        price: 18.20,
        currency: 'USD',
        eta: 6,
        capacity: 4,
        description: 'Newer cars with extra legroom'
    },
    {
        id: '3',
        type: 'Premium',
        name: 'Exec Black',
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097166.png',
        price: 28.00,
        currency: 'USD',
        eta: 8,
        capacity: 3,
        description: 'Luxury rides with top-rated drivers'
    },
    {
        id: '4',
        type: 'Van',
        name: 'Van XL',
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097186.png',
        price: 35.00,
        currency: 'USD',
        eta: 12,
        capacity: 6,
        description: 'Rides for groups up to 6'
    }
];

const MOCK_DRIVER: Driver = {
    name: "Miguel Santos",
    rating: 4.8,
    carModel: "Toyota Camry (White)",
    plateNumber: "GH-882-KL",
    phone: "+1 555 0123",
    avatar: "https://i.pravatar.cc/150?u=miguel"
};

// ============================
// COMPONENT
// ============================

export function CabBookingView() {
    const [pickup, setPickup] = useState('Current Location');
    const [dropoff, setDropoff] = useState('');
    const [step, setStep] = useState<'input' | 'selection' | 'searching' | 'arriving'>('input');
    const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);

    // Simulate "Searching for Driver"
    useEffect(() => {
        if (step === 'searching') {
            const timer = setTimeout(() => {
                setStep('arriving');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Map Placeholder */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000" // Dark map generic image
                    alt="Map Background"
                    className="w-full h-full object-cover opacity-60"
                />
                {/* Simulated Pins */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white px-3 py-1 rounded-full shadow-lg text-xs font-bold text-black mb-1">
                        12 min away
                    </div>
                    <MapPin className="w-8 h-8 text-action fill-action drop-shadow-xl" />
                </div>
            </div>

            {/* Header / Back Button (conditionally shown if deeper in flow) */}
            {step !== 'input' && (
                <button
                    onClick={() => setStep('input')}
                    className="absolute top-12 left-5 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            {/* Bottom Sheet */}
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-24 px-5">
                <AnimatePresence mode="wait">

                    {/* STEP 1: DESTINATION INPUT */}
                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                        >
                            <h1 className="text-2xl font-bold text-white font-heading mb-6">Where to?</h1>
                            <GlassCard className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Navigation className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={pickup}
                                        onChange={(e) => setPickup(e.target.value)}
                                        className="bg-transparent text-white w-full border-b border-white/10 py-2 outline-none focus:border-action transition-colors"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-action/20 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-action" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter destination"
                                        value={dropoff}
                                        onChange={(e) => setDropoff(e.target.value)}
                                        className="bg-transparent text-white w-full border-b border-white/10 py-2 outline-none focus:border-action transition-colors"
                                    />
                                </div>
                            </GlassCard>
                            <button
                                disabled={!dropoff}
                                onClick={() => setStep('selection')}
                                className="w-full mt-4 py-3 bg-action rounded-xl font-bold text-white shadow-lg shadow-action/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Route
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: RIDE SELECTION */}
                    {step === 'selection' && (
                        <motion.div
                            key="selection"
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-surface border border-white/10 rounded-t-3xl -mx-5 px-5 pt-6 pb-2"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-1 bg-white/20 rounded-full" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-4">Choose a ride</h3>
                            <div className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar mb-4">
                                {RIDE_OPTIONS.map((ride) => (
                                    <div
                                        key={ride.id}
                                        onClick={() => setSelectedRide(ride)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                                            selectedRide?.id === ride.id
                                                ? "bg-action/20 border-action"
                                                : "bg-white/5 border-transparent hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white rounded-lg p-1">
                                                <img src={ride.image} alt={ride.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{ride.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-secondary">
                                                    <span>{ride.eta} min away</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-0.5">
                                                        <User className="w-3 h-3" /> {ride.capacity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-white">${ride.price}</span>
                                            {selectedRide?.id === ride.id && (
                                                <span className="text-xs text-action">Selected</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between py-3 border-t border-white/10 mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/5 rounded-full">
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-white">Personal • **** 4242</span>
                                </div>
                                <span className="text-action text-sm font-bold">Change</span>
                            </div>
                            <button
                                disabled={!selectedRide}
                                onClick={() => setStep('searching')}
                                className="w-full py-3.5 bg-action rounded-xl font-bold text-white text-lg shadow-lg shadow-action/20 disabled:opacity-50"
                            >
                                Confirm {selectedRide?.name ?? 'Ride'}
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 3: SEARCHING */}
                    {step === 'searching' && (
                        <motion.div
                            key="searching"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface rounded-2xl p-6 text-center border border-white/10"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 relative">
                                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                                <div className="absolute inset-0 border-4 border-action rounded-full border-t-transparent animate-spin" />
                                <Car className="absolute inset-0 m-auto w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Connecting...</h3>
                            <p className="text-secondary text-sm">Finding the nearest driver for you</p>
                        </motion.div>
                    )}

                    {/* STEP 4: ARRIVING */}
                    {step === 'arriving' && selectedRide && (
                        <motion.div
                            key="arriving"
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-surface border border-white/10 rounded-t-3xl -mx-5 px-5 pt-6 pb-2"
                        >
                            {/* Status Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Arriving in 4 min</h3>
                                    <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '60%' }}
                                            transition={{ duration: 2 }}
                                            className="h-full bg-action"
                                        />
                                    </div>
                                </div>
                                <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                                    Pin: 6649
                                </div>
                            </div>

                            {/* Driver Card */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <img
                                        src={MOCK_DRIVER.avatar}
                                        alt={MOCK_DRIVER.name}
                                        className="w-14 h-14 rounded-full border-2 border-white/20"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 fill-black" />
                                        {MOCK_DRIVER.rating}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-lg">{MOCK_DRIVER.name}</h4>
                                    <p className="text-secondary text-sm">{MOCK_DRIVER.carModel}</p>
                                    <div className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded text-xs font-mono text-white/80">
                                        {MOCK_DRIVER.plateNumber}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button className="w-10 h-10 rounded-full bg-action/20 flex items-center justify-center text-action">
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div className="space-y-4 border-t border-white/10 pt-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                        <div className="w-0.5 h-8 bg-white/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-action" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-xs text-secondary">Pickup</p>
                                            <p className="font-medium text-white text-sm">{pickup}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-secondary">Dropoff</p>
                                            <p className="font-medium text-white text-sm">{dropoff}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors">
                                Cancel Ride
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

