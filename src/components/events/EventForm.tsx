import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { GuildEvent, GuildEventType } from '../../types';
import { convertEstToBrt } from '../../utils/time';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface EventFormProps {
  onSubmit: (evt: Omit<GuildEvent, 'id' | 'status' | 'rsvps'>) => void | Promise<void>;
  onClose: () => void;
}

export default function EventForm({ onSubmit, onClose }: EventFormProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<GuildEventType>('world_boss');
  const [newDescription, setNewDescription] = useState('');
  const [newWeekday, setNewWeekday] = useState<string>('Every day');
  const [newTime, setNewTime] = useState('22:30');
  const [newMinLevel, setNewMinLevel] = useState<number>(60);
  const [newRewardsInput, setNewRewardsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const rewardsArray = newRewardsInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
      await onSubmit({
        title: newTitle.trim(), type: newType, description: newDescription.trim() || 'No description.',
        weekday: newWeekday, time: newTime, date: newWeekday === 'Every day' ? `Daily at ${newTime}` : `${newWeekday} at ${newTime}`,
        minLevel: Number(newMinLevel) || 1, rewards: rewardsArray.length ? rewardsArray : ['GP Coins']
      });
      onClose();
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <form onSubmit={handleSubmit} className="bg-[#0b0d13]/90 border border-cyan-500/20 p-5 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2"><Sparkles size={12} /> Create New Fixed Guild Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Event Title</label>
            <input type="text" required placeholder="e.g. Daily Rift Secondary" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full h-10 px-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500/40" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Category</label>
            <select value={newType} onChange={(e) => setNewType(e.target.value as GuildEventType)} className="w-full h-10 px-2 bg-[#050609] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none font-mono">
              <option value="world_boss">World Boss</option><option value="rift">Rift</option><option value="guild_dungeon">Guild Dungeon</option><option value="ancient_fortress">Ancient Fortress (PvP)</option><option value="clash">Clash (PvP)</option><option value="abyss_boss">Abyss Boss</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Day</label>
              <select value={newWeekday} onChange={(e) => setNewWeekday(e.target.value)} className="w-full h-10 px-2 bg-[#050609] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none">
                <option value="Every day">Every day</option>
                {WEEKDAYS.map(day => (<option key={day} value={day}>{day}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Time (EST)</label>
              <input type="text" required placeholder="22:30" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full h-10 px-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs text-center focus:outline-none font-mono" />
              <div className="text-[9px] font-mono text-slate-500 mt-1 text-right">🇧🇷 {convertEstToBrt(newTime) || '--:--'}</div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Description</label>
          <textarea placeholder="Information, Discord links..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full h-16 p-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none resize-none" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Rewards (comma separated)</label>
          <input type="text" placeholder="+50 GP Points, Rare Item" value={newRewardsInput} onChange={(e) => setNewRewardsInput(e.target.value)} className="w-full h-10 px-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-9 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-lg cursor-pointer">Cancel</button>
          <button type="submit" disabled={submitting} className="px-5 h-9 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 text-xs font-black uppercase rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? '⟳ Saving...' : 'Save Event'}</button>
        </div>
      </form>
    </motion.div>
  );
}
