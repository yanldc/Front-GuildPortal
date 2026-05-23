import React, { useState } from 'react';
import { Member } from '../../types';

interface BulkPointsPanelProps {
  members: Member[];
  selectedMemberIds: string[];
  setSelectedMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
  onUpdatePointsBulk: (memberIds: string[], amount: number, type: 'add' | 'remove', reason: string) => Promise<void> | void;
}

export default function BulkPointsPanel({ members, selectedMemberIds, setSelectedMemberIds, onUpdatePointsBulk }: BulkPointsPanelProps) {
  const [bulkPointAmount, setBulkPointAmount] = useState('22');
  const [bulkPointType, setBulkPointType] = useState<'add' | 'remove'>('add');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) return;
    const amount = parseInt(bulkPointAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    setSubmitting(true);
    try {
      await onUpdatePointsBulk(selectedMemberIds, amount, bulkPointType, bulkPointType === 'add' ? 'Ajuste de GP em Massa (Adicionado por Admin)' : 'Ajuste de GP em Massa (Removido por Admin)');
      setSelectedMemberIds([]);
      setBulkPointAmount('50');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="lg:col-span-4 bg-[#0a0c10]/95 border border-cyan-500/15 p-5 rounded-2xl relative sticky top-20 text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
        <div className="flex flex-col text-left">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Bulk GP Adjustment</span>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{selectedMemberIds.length} members selected</p>
        </div>
        <button onClick={() => setSelectedMemberIds([])} className="text-[10px] text-slate-500 hover:text-slate-350 font-mono">[Cancel X]</button>
      </div>

      <div>
        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Target Characters Selection</label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#08090d] border border-slate-850 rounded-xl">
          {selectedMemberIds.map((id) => {
            const mb = members.find((item) => item.id === id);
            return mb ? (
              <span key={id} className="text-[10px] font-mono font-bold bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded flex items-center gap-1.5">
                {mb.name}
                <button type="button" className="text-slate-505 hover:text-red-400 font-extrabold cursor-pointer focus:outline-none shrink-0" onClick={() => setSelectedMemberIds((prev) => prev.filter((prevId) => prevId !== id))}>×</button>
              </span>
            ) : null;
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex bg-[#08090d] border border-slate-800 p-1 rounded-xl">
          <button type="button" onClick={() => setBulkPointType('add')} className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${bulkPointType === 'add' ? 'bg-emerald-500/15 text-emerald-405 border border-emerald-500/10' : 'text-slate-500 hover:text-slate-400'}`}>+ Reward GP</button>
          <button type="button" onClick={() => setBulkPointType('remove')} className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${bulkPointType === 'remove' ? 'bg-red-500/15 text-red-400 border border-red-500/10' : 'text-slate-500 hover:text-slate-400'}`}>- Deduct GP</button>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">GP points per player</label>
          <input type="number" min="1" required value={bulkPointAmount} onChange={(e) => setBulkPointAmount(e.target.value)} className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 font-mono text-sm focus:outline-none" />
        </div>

        <button type="submit" disabled={submitting} className={`w-full h-10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${bulkPointType === 'add' ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-500 hover:bg-red-600 text-zinc-950 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
          {submitting ? '⟳ Processing...' : bulkPointType === 'add' ? `Grant GP to ${selectedMemberIds.length} Members` : `Deduct GP from ${selectedMemberIds.length} Members`}
        </button>
      </form>
    </div>
  );
}
