import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Member, LevelUpRequest } from '../../types';

interface JoinSlotModalProps {
  targetReq: LevelUpRequest;
  currentUser: Member;
  onClose: () => void;
  onConfirm: (characterName: string, isAlt: boolean) => void;
}

export default function JoinSlotModal({ targetReq, currentUser, onClose, onConfirm }: JoinSlotModalProps) {
  const [joinCharSelection, setJoinCharSelection] = useState('main');
  const [customJoinAltName, setCustomJoinAltName] = useState('');
  const userAlts = currentUser.altNames || [];

  const handleConfirm = () => {
    let characterName = currentUser.name;
    let isAlt = false;

    if (joinCharSelection === 'main') {
      characterName = currentUser.name;
    } else if (joinCharSelection.startsWith('alt-existing:')) {
      characterName = joinCharSelection.replace('alt-existing:', '');
      isAlt = true;
    } else {
      if (!customJoinAltName.trim()) return;
      characterName = customJoinAltName.trim();
      isAlt = true;
    }

    onConfirm(characterName, isAlt);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0b0d12] border border-cyan-500/15 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"><X size={16} /></button>

        <div className="space-y-1.5 text-left">
          <span className="text-[10px] font-mono uppercase bg-cyan-950/40 text-cyan-400 border border-cyan-800/20 px-2 py-0.5 rounded leading-none mr-1.5 font-bold">Party Enrollment</span>
          <h3 className="text-sm font-bold text-slate-250 uppercase tracking-wide">Join Assistant Slot</h3>
          <p className="text-slate-400 text-xs">
            Join the party to cooperate with <strong className="text-slate-205">{targetReq.createdByName}</strong> on <span className="text-purple-400 font-bold">{targetReq.weekday}</span>:
            <span className="block mt-1 italic text-[11px] bg-[#121622] rounded py-1 px-2 text-cyan-300 font-mono">"{targetReq.title}"</span>
          </p>
        </div>

        <div className="space-y-3.5 text-left">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Which of your characters will participate?</label>
            <select value={joinCharSelection} onChange={(e) => setJoinCharSelection(e.target.value)} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-205 text-xs focus:outline-none cursor-pointer">
              <option value="main">{currentUser.name} (Main Char)</option>
              {userAlts.map((alt) => (<option key={alt} value={`alt-existing:${alt}`}>{alt} (Alt Account)</option>))}
              <option value="custom">-- Enter Another Alt Character --</option>
            </select>
          </div>
          {joinCharSelection === 'custom' && (
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Character / Alt Assistant Name</label>
              <input type="text" required value={customJoinAltName} onChange={(e) => setCustomJoinAltName(e.target.value)} placeholder="e.g., ShadowArcherAlt" className="w-full h-10 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none" />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 h-11 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 font-mono cursor-pointer">Back</button>
          <button type="button" onClick={handleConfirm} className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer">Confirm Slot</button>
        </div>
      </motion.div>
    </div>
  );
}
