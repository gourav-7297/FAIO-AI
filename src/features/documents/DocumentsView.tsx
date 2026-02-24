import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Trash2, Copy, AlertTriangle,
    X, ChevronDown, Check, Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import {
    loadDocuments, addDocument, deleteDocument, getDaysUntilExpiry,
    DOC_TYPES, DOC_EMOJIS, DOC_COLORS,
    type TravelDocument, type DocType
} from '../../services/documentsService';
import { useToast } from '../../components/ui/Toast';

export function DocumentsView() {
    const { showToast } = useToast();
    const [docs, setDocs] = useState<TravelDocument[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [filter, setFilter] = useState<DocType | 'all'>('all');

    useEffect(() => { setDocs(loadDocuments()); }, []);

    const filtered = filter === 'all' ? docs : docs.filter(d => d.type === filter);

    const expiring = docs.filter(d => {
        if (!d.expiryDate) return false;
        const days = getDaysUntilExpiry(d.expiryDate);
        return days > 0 && days <= 30;
    });

    const expired = docs.filter(d => {
        if (!d.expiryDate) return false;
        return getDaysUntilExpiry(d.expiryDate) <= 0;
    });

    const handleDelete = (id: string) => {
        setDocs(deleteDocument(id));
        showToast('Document deleted', 'success');
    };

    const copyNumber = (num: string) => {
        navigator.clipboard.writeText(num).then(() => showToast('Copied!', 'success')).catch(() => { });
    };

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Travel</span>
                </div>
                <h1 className="text-3xl font-bold">Documents</h1>
                <p className="text-secondary text-sm">Store & manage your travel documents</p>
            </motion.header>

            {/* Expiry alerts */}
            {(expiring.length > 0 || expired.length > 0) && (
                <div className="space-y-2 mb-4">
                    {expired.map(d => (
                        <GlassCard key={d.id} className="p-3 flex items-center gap-3 border-rose-500/30">
                            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-rose-400 font-bold">EXPIRED</p>
                                <p className="text-[10px] text-secondary truncate">{d.title} — expired {Math.abs(getDaysUntilExpiry(d.expiryDate!))} days ago</p>
                            </div>
                        </GlassCard>
                    ))}
                    {expiring.map(d => (
                        <GlassCard key={d.id} className="p-3 flex items-center gap-3 border-amber-500/30">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-amber-400 font-bold">Expiring Soon</p>
                                <p className="text-[10px] text-secondary truncate">{d.title} — {getDaysUntilExpiry(d.expiryDate!)} days left</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                <button onClick={() => setFilter('all')}
                    className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap flex-shrink-0",
                        filter === 'all' ? "bg-action text-white" : "bg-white/5 text-secondary")}>
                    All ({docs.length})
                </button>
                {DOC_TYPES.filter(t => docs.some(d => d.type === t)).map(t => (
                    <button key={t} onClick={() => setFilter(t)}
                        className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap flex-shrink-0",
                            filter === t ? "bg-action text-white" : "bg-white/5 text-secondary")}>
                        {DOC_EMOJIS[t]} {t}
                    </button>
                ))}
            </div>

            {/* Documents */}
            <div className="space-y-2">
                {filtered.map((doc, i) => (
                    <DocCard key={doc.id} doc={doc} onDelete={handleDelete} onCopy={copyNumber} delay={i * 0.05} />
                ))}
            </div>

            {docs.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Shield className="w-16 h-16 text-action/20 mx-auto mb-4" />
                    <p className="text-secondary text-sm">No documents yet</p>
                    <p className="text-secondary text-[10px] mt-1">Add your passport, tickets, insurance & more</p>
                </motion.div>
            )}

            {/* Add button */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(true)}
                className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl bg-gradient-to-r from-action to-purple-500 text-white shadow-lg flex items-center justify-center z-40">
                <Plus className="w-6 h-6" />
            </motion.button>

            <AnimatePresence>
                {showAdd && <AddDocModal onClose={() => setShowAdd(false)} onAdd={(doc) => {
                    setDocs(addDocument(doc));
                    setShowAdd(false);
                    showToast('Document added', 'success');
                }} />}
            </AnimatePresence>
        </div>
    );
}

function DocCard({ doc, onDelete, onCopy, delay }: { doc: TravelDocument; onDelete: (id: string) => void; onCopy: (n: string) => void; delay: number }) {
    const [expanded, setExpanded] = useState(false);
    const daysLeft = doc.expiryDate ? getDaysUntilExpiry(doc.expiryDate) : null;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg", DOC_COLORS[doc.type])}>
                            {DOC_EMOJIS[doc.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{doc.title}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-secondary">{doc.type}</span>
                                {doc.number && (
                                    <button onClick={e => { e.stopPropagation(); onCopy(doc.number); }}
                                        className="flex items-center gap-0.5 text-[9px] text-action hover:text-white">
                                        <Copy className="w-2.5 h-2.5" /> {doc.number.slice(0, 4)}••••
                                    </button>
                                )}
                            </div>
                        </div>
                        {daysLeft !== null && (
                            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
                                daysLeft <= 0 ? "bg-rose-500/20 text-rose-400" :
                                    daysLeft <= 30 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400")}>
                                {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                            </span>
                        )}
                        <ChevronDown className={cn("w-4 h-4 text-secondary transition-transform", expanded && "rotate-180")} />
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 p-3 space-y-2">
                            {doc.number && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-secondary">Number</span>
                                    <button onClick={() => onCopy(doc.number)} className="flex items-center gap-1 text-xs text-white font-mono">
                                        {doc.number} <Copy className="w-3 h-3 text-action" />
                                    </button>
                                </div>
                            )}
                            {doc.issueDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-secondary">Issued</span>
                                    <span className="text-xs text-white">{doc.issueDate}</span>
                                </div>
                            )}
                            {doc.expiryDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-secondary">Expires</span>
                                    <span className="text-xs text-white">{doc.expiryDate}</span>
                                </div>
                            )}
                            {doc.notes && (
                                <div>
                                    <span className="text-[10px] text-secondary">Notes</span>
                                    <p className="text-xs text-white mt-0.5">{doc.notes}</p>
                                </div>
                            )}
                            <button onClick={() => onDelete(doc.id)}
                                className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 mt-1">
                                <Trash2 className="w-3 h-3" /> Delete document
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
}

function AddDocModal({ onClose, onAdd }: { onClose: () => void; onAdd: (doc: Omit<TravelDocument, 'id' | 'createdAt'>) => void }) {
    const [type, setType] = useState<DocType>('Passport');
    const [title, setTitle] = useState('');
    const [number, setNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd({ type, title: title.trim(), number: number.trim(), issueDate: issueDate || undefined, expiryDate: expiryDate || undefined, notes: notes.trim() });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4" onClick={onClose}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="w-full max-w-md bg-surface rounded-2xl p-5 space-y-3 border border-white/10 max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Add Document</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-secondary" /></button>
                </div>

                <div>
                    <p className="text-[10px] text-secondary mb-1">Document Type</p>
                    <div className="grid grid-cols-4 gap-1.5">
                        {DOC_TYPES.map(t => (
                            <button key={t} onClick={() => setType(t)}
                                className={cn("p-2 rounded-xl text-[9px] font-bold text-center",
                                    type === t ? "bg-action text-white" : "bg-white/5 text-secondary")}>
                                <span className="text-lg block">{DOC_EMOJIS[t]}</span>{t}
                            </button>
                        ))}
                    </div>
                </div>

                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title (e.g. Indian Passport)"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none" />

                <input value={number} onChange={e => setNumber(e.target.value)} placeholder="Document number"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none font-mono" />

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <p className="text-[10px] text-secondary mb-1">Issue Date</p>
                        <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none" />
                    </div>
                    <div>
                        <p className="text-[10px] text-secondary mb-1">Expiry Date</p>
                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none" />
                    </div>
                </div>

                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none resize-none" />

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-action to-purple-500 text-white font-bold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Save Document
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
