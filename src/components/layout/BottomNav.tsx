import { Home, Compass, Map as MapIcon, Wallet, ShieldAlert, Users2 } from 'lucide-react';
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
        { id: 'community', icon: Users2, label: 'Community' },
        { id: 'planner', icon: MapIcon, label: 'Plan' },
        { id: 'wallet', icon: Wallet, label: 'Wallet' },
        { id: 'safety', icon: ShieldAlert, label: 'Safety' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 px-2 z-50">
            <div className="flex justify-between items-center max-w-md mx-auto h-[60px]">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full relative",
                                isActive ? "text-action" : "text-secondary hover:text-slate-200"
                            )}
                        >
                            <div className="relative p-1.5">
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute inset-0 bg-action/20 blur-xl rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <tab.icon className={cn("w-5 h-5 transition-all duration-300", isActive && "scale-110")} />
                            </div>
                            <span className="text-[9px] font-medium mt-0.5">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

