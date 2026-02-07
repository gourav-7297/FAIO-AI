import { Drawer } from 'vaul';
import { CloudRain, Car, Zap, Settings2 } from 'lucide-react';
import { useEnvironment } from '../context/EnvironmentContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function PlanOnTheGoDrawer() {
    const { isRaining, toggleRain, isHighTraffic, toggleTraffic, isEmergency } = useEnvironment();

    if (isEmergency) return null; // Hide in emergency mode

    return (
        <Drawer.Root>
            <Drawer.Trigger asChild>
                <button className="fixed bottom-24 right-4 w-12 h-12 bg-surface border border-slate-700 rounded-full flex items-center justify-center shadow-lg z-40 active:scale-95 transition-transform text-white">
                    <Settings2 className="w-6 h-6" />
                </button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[96%] flex flex-col rounded-t-[10px] z-50 bg-background border-t border-slate-800 focus:outline-none">
                    <div className="p-4 bg-background rounded-t-[10px] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700 mb-8" />
                        <div className="max-w-md mx-auto">
                            <Drawer.Title className="font-bold text-2xl mb-4 text-white">Plan-On-The-Go Control</Drawer.Title>
                            <p className="text-secondary mb-8">Simulate environmental conditions to test the AI's reactive rerouting.</p>

                            <div className="space-y-4">
                                <ControlToggle
                                    active={isRaining}
                                    onClick={toggleRain}
                                    icon={CloudRain}
                                    label="Simulate Rain"
                                    desc="Switches outdoor activities to indoor backups"
                                    color="text-blue-400"
                                />

                                <ControlToggle
                                    active={isHighTraffic}
                                    onClick={toggleTraffic}
                                    icon={Car}
                                    label="Simulate High Traffic"
                                    desc="Optimizes route order to minimize delay"
                                    color="text-amber-400"
                                />

                                <div className="p-4 rounded-xl border border-slate-800 bg-surface/50 opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-800">
                                            <Zap className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">Crowd Surge (Coming Soon)</h4>
                                            <p className="text-xs text-secondary">Reroute to quiet zones</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

function ControlToggle({ active, onClick, icon: Icon, label, desc, color }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group",
                active ? "bg-slate-900 border-white/20" : "bg-surface border-slate-800"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg transition-colors", active ? "bg-white/10" : "bg-slate-800 group-hover:bg-slate-700")}>
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div>
                    <h4 className={cn("font-bold transition-colors", active ? "text-white" : "text-slate-200")}>{label}</h4>
                    <p className="text-xs text-secondary">{desc}</p>
                </div>
            </div>
            <div className={cn(
                "w-12 h-6 rounded-full p-1 transition-colors relative",
                active ? "bg-action" : "bg-slate-700"
            )}>
                <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: active ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </div>
        </button>
    );
}
