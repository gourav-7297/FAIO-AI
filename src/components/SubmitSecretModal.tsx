import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Camera, Sparkles, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { secretsService } from '../services/secretsService';
import { cn } from '../lib/utils';

interface SubmitSecretModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination?: string;
    onSuccess?: () => void;
}

type SecretType = 'viewpoint' | 'food' | 'shortcut' | 'activity' | 'cafe' | 'stay';

const secretTypes: { id: SecretType; label: string; emoji: string }[] = [
    { id: 'viewpoint', label: 'Viewpoint', emoji: '🌄' },
    { id: 'food', label: 'Food Spot', emoji: '🍜' },
    { id: 'cafe', label: 'Cafe', emoji: '☕' },
    { id: 'shortcut', label: 'Shortcut', emoji: '🚶' },
    { id: 'activity', label: 'Activity', emoji: '🎯' },
    { id: 'stay', label: 'Stay', emoji: '🏠' },
];

export function SubmitSecretModal({ isOpen, onClose, destination = '', onSuccess }: SubmitSecretModalProps) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [type, setType] = useState<SecretType>('viewpoint');
    const [description, setDescription] = useState('');
    const [locationName, setLocationName] = useState(destination);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('Please sign in to submit a secret');
            return;
        }

        if (!name.trim() || !locationName.trim()) {
            setError('Name and location are required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { error: submitError } = await secretsService.submitSecret(user.id, {
                destination: locationName,
                name: name.trim(),
                type,
                description: description.trim() || undefined,
            });

            if (submitError) {
                setError(submitError.message);
            } else {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                    // Reset form
                    setName('');
                    setDescription('');
                    setIsSuccess(false);
                }, 1500);
            }
        } catch (err) {
            setError('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setName('');
        setDescription('');
        setError(null);
        setIsSuccess(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={resetAndClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        className="relative w-full max-w-md bg-surface border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
                    >
                        {/* Success State */}
                        {isSuccess ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="py-12 text-center"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Secret Shared!</h3>
                                <p className="text-secondary text-sm">Thanks for helping fellow travelers discover hidden gems</p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Share a Secret</h3>
                                            <p className="text-xs text-secondary">Help others discover hidden gems</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetAndClose}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-secondary" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Secret Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Hidden Rooftop Cafe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-action transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Location/City *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                            <input
                                                type="text"
                                                placeholder="e.g., Tokyo"
                                                value={locationName}
                                                onChange={(e) => setLocationName(e.target.value)}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-action transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {secretTypes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setType(t.id)}
                                                    className={cn(
                                                        "p-3 rounded-xl border transition-all text-center",
                                                        type === t.id
                                                            ? "bg-action/20 border-action text-white"
                                                            : "bg-slate-800/50 border-slate-700 text-secondary hover:border-slate-600"
                                                    )}
                                                >
                                                    <span className="text-lg">{t.emoji}</span>
                                                    <p className="text-xs mt-1">{t.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            placeholder="Share tips, directions, or what makes this place special..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-action transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Image Upload Placeholder */}
                                    <button
                                        type="button"
                                        className="w-full p-4 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-secondary hover:border-slate-500 transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <span className="text-sm">Add Photo (Coming Soon)</span>
                                    </button>

                                    {/* Error */}
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-sm text-center"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    {/* Submit */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting || !name.trim() || !locationName.trim()}
                                        className={cn(
                                            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                                            isSubmitting || !name.trim() || !locationName.trim()
                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sharing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Share Secret
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
