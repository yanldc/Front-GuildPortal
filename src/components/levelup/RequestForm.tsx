import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Member, LevelUpRequest, CLASSES_RAVEN2 } from '../../types';
import { convertEstToBrt } from '../../utils/time';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SELECTABLE_HOURS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

interface RequestFormProps {
  currentUser: Member;
  defaultWeekday: string;
  onSubmit: (req: Omit<LevelUpRequest, 'id' | 'slots' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function RequestForm({ currentUser, defaultWeekday, onSubmit, onClose }: RequestFormProps) {
  const [reqTitle, setReqTitle] = useState('');
  const [reqTime, setReqTime] = useState('20:00');
  const [reqWeekday, setReqWeekday] = useState(defaultWeekday);
  const [selectedReqChar, setSelectedReqChar] = useState('main');
  const [customReqAltName, setCustomReqAltName] = useState('');
  const [selectedReqClass, setSelectedReqClass] = useState(currentUser.class || CLASSES_RAVEN2[0]);
  const userAlts = currentUser.altNames || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqTime.trim()) return;

    let requesterName = currentUser.name;
    let requesterClass = currentUser.class || CLASSES_RAVEN2[0];

    if (selectedReqChar === 'main') {
      requesterName = currentUser.name;
      requesterClass = currentUser.class || CLASSES_RAVEN2[0];
    } else if (selectedReqChar.startsWith('alt-existing:')) {
      requesterName = selectedReqChar.replace('alt-existing:', '');
      requesterClass = selectedReqClass;
    } else {
      if (!customReqAltName.trim()) return;
      requesterName = customReqAltName.trim();
      requesterClass = selectedReqClass;
    }

    onSubmit({ title: reqTitle.trim(), time: reqTime.trim(), weekday: reqWeekday, createdBy: currentUser.id, createdByName: requesterName, class: requesterClass });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <form onSubmit={handleSubmit} className="bg-[#0c0e14] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">Create Help Request (Matchmaking)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Day of the Week <span className="text-cyan-400">*</span></label>
            <select value={reqWeekday} onChange={(e) => setReqWeekday(e.target.value)} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/45 rounded-xl text-slate-100 text-xs focus:outline-none cursor-pointer">
              <option value="Every day">Every day (Flexible)</option>
              {WEEKDAYS.map((day) => (<option key={day} value={day}>{day}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Title / Objective <span className="text-cyan-400">*</span></label>
            <input type="text" required maxLength={60} value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} placeholder="e.g., Main Quest Boss 52" className="w-full h-11 px-4 bg-[#050608] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Time (EST) <span className="text-cyan-400">*</span></label>
            <select value={reqTime} onChange={(e) => setReqTime(e.target.value)} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-200 text-xs focus:outline-none cursor-pointer font-mono">
              {SELECTABLE_HOURS.map((hr) => (<option key={hr} value={hr}>{hr} EST</option>))}
            </select>
            <p className="text-[10px] text-emerald-400 mt-1.5 font-mono">🇧🇷 {convertEstToBrt(reqTime)}</p>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Character <span className="text-cyan-400">*</span></label>
            <select value={selectedReqChar} onChange={(e) => { setSelectedReqChar(e.target.value); if (e.target.value === 'main') setSelectedReqClass(currentUser.class || CLASSES_RAVEN2[0]); }} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none cursor-pointer">
              <option value="main">{currentUser.name} (Main Char)</option>
              {userAlts.map((alt) => (<option key={alt} value={`alt-existing:${alt}`}>{alt} (Alt)</option>))}
              <option value="custom">-- Enter Another Alt --</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Class <span className="text-cyan-400">*</span></label>
            <select value={selectedReqClass} onChange={(e) => setSelectedReqClass(e.target.value)} disabled={selectedReqChar === 'main'} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-200 text-xs focus:outline-none cursor-pointer disabled:opacity-60">
              {CLASSES_RAVEN2.map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
            </select>
          </div>
          {selectedReqChar === 'custom' && (
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Alt Name <span className="text-cyan-400">*</span></label>
              <input type="text" required value={customReqAltName} onChange={(e) => setCustomReqAltName(e.target.value)} placeholder="e.g., RavenSniperAlt" className="w-full h-11 px-4 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none" />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-900">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 font-mono">Cancel</button>
          <button type="submit" className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer">Publish Request</button>
        </div>
      </form>
    </motion.div>
  );
}
