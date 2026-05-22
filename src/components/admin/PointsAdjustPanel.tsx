import React, { useState } from 'react';
import { Member } from '../../types';

interface PointsAdjustPanelProps {
  members: Member[];
  selectedMemberId: string;
  onClose: () => void;
  onUpdatePoints: (memberId: string, amount: number, type: 'add' | 'remove', reason: string) => void;
}

export default function PointsAdjustPanel({ members, selectedMemberId, onClose, onUpdatePoints }: PointsAdjustPanelProps) {
  const [pointAmount, setPointAmount] = useState('50');
  const [pointType, setPointType] = useState<'add' | 'remove'>('add');

  const targetM = members.find((m) => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(pointAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    onUpdatePoints(selectedMemberId, amount, pointType, pointType === 'add' ? 'Ajuste de GP (Adicionado por Admin)' : 'Ajuste de GP (Removido por Admin)');
    onClose();
  };

  if (!targetM) return null;

  return (
    <div className="lg:col-span-4 bg-[#0a0c10]/95 border border-cyan-500/15 p-5 rounded-2xl relative sticky top-20 text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Adjust Member GP</span>
        <button onClick={onClose} className="text-[10px] text-slate-500 hover:text-slate-350 font-mono">[Close X]</button>
      </div>

      <div className="bg-[#0f1118] border border-slate-800 p-3 rounded-xl flex items-center gap-3 mb-2">
        <img src={targetM.avatar} alt={targetM.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full bg-slate-950 border border-slate-805" />
        <div className="text-left min-w-0">
          <h4 className="text-xs font-bold text-slate-200 truncate">{targetM.name}</h4>
          <p className="text-[10px] font-mono text-slate-500">Current Balance: <strong className="text-cyan-400 text-xs">{targetM.points} GP</strong></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex bg-[#08090d] border border-slate-800 p-1 rounded-xl">
          <button type="button" onClick={() => setPointType('add')} className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${pointType === 'add' ? 'bg-emerald-500/15 text-emerald-405 border border-emerald-500/10' : 'text-slate-500 hover:text-slate-400'}`}>+ Reward GP</button>
          <button type="button" onClick={() => setPointType('remove')} className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${pointType === 'remove' ? 'bg-red-500/15 text-red-400 border border-red-500/10' : 'text-slate-500 hover:text-slate-400'}`}>- Deduct GP</button>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">GP Point Value</label>
          <input type="number" min="1" required value={pointAmount} onChange={(e) => setPointAmount(e.target.value)} className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 font-mono text-sm focus:outline-none" />
        </div>

        <button type="submit" className={`w-full h-10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${pointType === 'add' ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-500 hover:bg-red-600 text-zinc-950 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
          {pointType === 'add' ? 'Apply GP Grant' : 'Apply GP Deduction'}
        </button>
      </form>
    </div>
  );
}
