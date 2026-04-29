import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface SubViewHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onBack: () => void;
}

export function SubViewHeader({ title, subtitle, icon, onBack }: SubViewHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-6 mb-12"
        >
            <button
                onClick={onBack}
                className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-900 hover:bg-stone-900 hover:text-white transition-all active:scale-95 shadow-sm"
            >
                <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
            </button>
            <div className="pt-1">
                <div className="flex items-center gap-3 mb-1">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <h1 className="text-3xl font-black text-stone-900 tracking-tighter leading-none">
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mt-2">
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

