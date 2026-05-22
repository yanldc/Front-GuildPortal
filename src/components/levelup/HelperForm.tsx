import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Info } from 'lucide-react';
import { Member, CLASSES_RAVEN2 } from '../../types';
import { convertEstToBrt } from '../../utils/time';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SELECTABLE_HOURS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

interface HelperFormProps {
  currentUser: Member;
  defaultWeekday: string;
  onSubmit: (data: { characterName: string; class: string; isAlt: boolean; availability: string; weekday: string }) => void;
  onClose: () => void;
}

export default function HelperForm({ currentUser, defaultWeekday, onSubmit, onClose }: HelperFormProps) {
  const [selectedHelperChar, setSelectedHelperChar] = useState('main');
  const [customHelperAltName, setCustomHelperAltName] = useState('');
  const [selectedHelperClass, setSelectedHelperClass] = useState(CLASSES_RAVEN2[0]);
  const [helperStartHour, setHelperStartHour] = useState('20:00');
  const [helperEndHour, setHelperEndHour] = useState('23:00');
  const [helperWeekday, setHelperWeekday] = useState(defaultWeekday);
  const userAlts = currentUser.altNames || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let characterName = currentUser.name;
    let isAlt = false;

    if (selectedHelperChar === 'main') {
      characterName = currentUser.name + ' (Main)';
    } else if (selectedHelperChar.startsWith('alt-existing:')) {
      characterName = selectedHelperChar.replace('alt-existing:', '') + ' (Alt)';
      isAlt = true;
    } else {
      if (!customHelperAltName.trim()) return;
      characterName = customHelperAltName.trim() + ' (Alt)';
      isAlt = true;
    }

    onSubmit({ characterName, class: selectedHelperClass, isAlt, availability: `${helperStartHour} - ${helperEndHour}`, weekday: helperWeekday });
    onClose();
  };

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden bg-[#0c0f16] border border-slate-800/60 p-4 rounded-xl space-y-4 text-left">
      <div className="flex items-center gap-1 bg-cyan-950/10 border border-cyan-800/10 p-2 rounded-lg text-xs text-cyan-400 font-medium">
        <Info size={13} className="shrink-0" /><span>Register your main character or one of your alt accounts, specifying the times you are available to play.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Character <span className="text-cyan-400">*</span></label>
          <select value={selectedHelperChar} onChange={(e) => setSelectedHelperChar(e.target.value)} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none cursor-pointer">
            <option value="main">{currentUser.name} (Main Char)</option>
            {userAlts.map((alt) => (<option key={alt} value={`alt-existing:${alt}`}>{alt} (Alt)</option>))}
            <option value="custom">-- Enter Another Alt --</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Class <span className="text-cyan-400">*</span></label>
          <select value={selectedHelperClass} onChange={(e) => setSelectedHelperClass(e.target.value)} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer">
            {CLASSES_RAVEN2.map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Weekday <span className="text-cyan-400">*</span></label>
          <select value={helperWeekday} onChange={(e) => setHelperWeekday(e.target.value)} className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer">
            <option value="Every day">Every day (Flexible)</option>
            {WEEKDAYS.map((day) => (<option key={day} value={day}>{day}</option>))}
          </select>
        </div>
        <div>
          <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Availability (EST) <span className="text-cyan-400">*</span></span>
          <div className="grid grid-cols-2 gap-2">
            <select value={helperStartHour} onChange={(e) => setHelperStartHour(e.target.value)} className="w-full h-11 px-2.5 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer font-mono">
              {SELECTABLE_HOURS.map((hr) => (<option key={hr} value={hr}>{hr}</option>))}
            </select>
            <select value={helperEndHour} onChange={(e) => setHelperEndHour(e.target.value)} className="w-full h-11 px-2.5 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer font-mono">
              {SELECTABLE_HOURS.map((hr) => (<option key={hr} value={hr}>{hr}</option>))}
            </select>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1.5 font-mono">🇧🇷 {convertEstToBrt(`${helperStartHour} - ${helperEndHour}`)}</p>
        </div>
      </div>
      {selectedHelperChar === 'custom' && (
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 max-w-sm">
          <label className="block text-[10px] font-mono text-slate-405 uppercase tracking-wider mb-1">Alt Name <span className="text-cyan-400">*</span></label>
          <input type="text" required value={customHelperAltName} onChange={(e) => setCustomHelperAltName(e.target.value)} placeholder="e.g., RavenSniperAlt" className="w-full h-10 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-505 rounded-xl text-slate-100 text-xs focus:outline-none" />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-900/60">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 font-mono cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer">Confirm Registration</button>
      </div>
    </motion.form>
  );
}
