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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
        >
            <button
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary hover:text-background hover:bg-white/10 transition-all active:scale-95"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    {icon}
                    {title}
                </h1>
                {subtitle && <p className="text-secondary text-sm mt-0.5">{subtitle}</p>}
            </div>
        </motion.div>
    );
}
