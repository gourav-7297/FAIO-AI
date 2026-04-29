import { Home, Compass, Map as MapIcon, Wallet, Users2, UserCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

type Tab = 'home' | 'explore' | 'community' | 'planner' | 'wallet' | 'safety' | 'profile' | 'guides' | 'cabs' | 'hotels' | 'flights' | 'trains' | 'buses' | 'visa' | 'packing' | 'documents';

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'explore', icon: Compass, label: 'Explore' },
        { id: 'community', icon: Users2, label: 'Social' },
        { id: 'planner', icon: MapIcon, label: 'Plan' },
        { id: 'wallet', icon: Wallet, label: 'Wallet' },
        { id: 'profile', icon: UserCircle, label: 'Me' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
            <div className="bg-white/92 backdrop-blur-xl border border-stone-200/60 shadow-nav rounded-2xl px-2 py-2">
                <div className="flex justify-between items-center h-14 relative">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-300",
                                    isActive ? "text-primary" : "text-stone-400 hover:text-stone-500"
                                )}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <tab.icon className={cn(
                                        "transition-all duration-300", 
                                        isActive ? "w-[22px] h-[22px] stroke-[2.5px]" : "w-5 h-5 stroke-[1.8px]"
                                    )} />
                                    <span className={cn(
                                        "text-[9px] font-semibold tracking-wide transition-all duration-300",
                                        isActive ? "opacity-100 text-primary" : "opacity-60"
                                    )}>
                                        {tab.label}
                                    </span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-1 bg-primary/8 border border-primary/10 rounded-xl"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
