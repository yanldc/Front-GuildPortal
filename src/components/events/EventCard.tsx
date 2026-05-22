import React from 'react';
import { motion } from 'motion/react';
import { Clock, Users, Gift, Skull, RefreshCw, Gamepad2, ShieldAlert, Award, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Member, GuildEvent, GuildEventType } from '../../types';
import { convertEstToBrt } from '../../utils/time';

interface EventCardProps {
  evt: GuildEvent;
  currentUser: Member;
  members: Member[];
  isAdmin: boolean;
  onRsvpChange: (eventId: string, isRsvped: boolean) => void;
  onEdit: (evt: GuildEvent) => void;
  onDelete: (id: string) => void;
  expandedRsvps: Record<string, boolean>;
  setExpandedRsvps: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const getEventIcon = (type: GuildEventType) => {
  switch (type) {
    case 'world_boss': return <Skull className="text-red-400" size={18} />;
    case 'rift': return <RefreshCw className="text-teal-400" size={18} />;
    case 'guild_dungeon': return <Gamepad2 className="text-purple-400" size={18} />;
    case 'ancient_fortress': return <ShieldAlert className="text-amber-500" size={18} />;
    case 'clash': return <ShieldAlert className="text-cyan-400" size={18} />;
    case 'abyss_boss': return <Skull className="text-purple-500" size={18} />;
    default: return <Award className="text-blue-400" size={18} />;
  }
};

const getTypeLabel = (type: GuildEventType) => {
  const map: Record<string, string> = { world_boss: 'WORLD BOSS 🔴', rift: 'RIFT 🌀', guild_dungeon: 'GUILD DUNGEON 🏰', ancient_fortress: 'ANCIENT FORTRESS (PVP) ⚔️', clash: 'CLASH (PVP) 🛡️', abyss_boss: 'ABYSS BOSS ☠️' };
  return map[type] || 'EVENT 📅';
};

export default function EventCard({ evt, currentUser, members, isAdmin, onRsvpChange, onEdit, onDelete, expandedRsvps, setExpandedRsvps }: EventCardProps) {
  const rsvped = evt.rsvps.includes(currentUser.id);

  return (
    <motion.div layout key={evt.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
      className={`bg-[#0a0c10] border rounded-2xl p-5 flex flex-col justify-between transition-all relative ${evt.status === 'completed' ? 'border-slate-900 opacity-60' : rsvped ? 'border-cyan-500/30 ring-1 ring-cyan-500/10' : 'border-slate-850 hover:border-slate-700/80'}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.015] rounded-full blur-2xl pointer-events-none" />
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#11141e] flex items-center justify-center border border-slate-850">{getEventIcon(evt.type)}</div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider">{getTypeLabel(evt.type)}</span>
              <span className="text-[9px] font-mono font-semibold text-slate-600 block mt-0.5">Frequency: <span className="text-cyan-400/80">{evt.weekday || 'Every day'}</span></span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-right">
            <div className="flex items-center gap-1 bg-[#121620] border border-slate-850 px-2 py-1 rounded-lg font-mono text-[9px] text-cyan-400 font-bold"><Clock size={10} />{evt.time || '22:30'} EST</div>
            <span className="text-[9px] font-mono text-slate-500">🇧🇷 {convertEstToBrt(evt.time || '22:30')}</span>
          </div>
        </div>

        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide mb-1.5 text-left">{evt.title}</h3>
          {isAdmin && (
            <div className="flex items-center gap-0.5 opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap">
              <button onClick={() => onEdit(evt)} className="p-1 px-1.5 bg-[#121620] hover:bg-slate-800 hover:text-cyan-400 rounded border border-slate-800 text-[10px] font-mono uppercase cursor-pointer">Edit</button>
              <button onClick={() => onDelete(evt.id)} className="p-1 text-slate-500 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4 text-left">{evt.description}</p>

        {/* Rewards */}
        <div className="space-y-2 bg-[#08090d]/90 border border-slate-905 p-3.5 rounded-xl mb-4 text-left">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Approximate rewards:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {evt.rewards.map((rew, i) => (<span key={i} className="inline-flex items-center gap-1 bg-cyan-500/5 text-cyan-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-cyan-500/10"><Gift size={9} /> {rew}</span>))}
          </div>
        </div>

        {/* Admin RSVP list */}
        {isAdmin && (
          <div className="mt-4 pt-3.5 border-t border-slate-900 text-left">
            <button onClick={() => setExpandedRsvps(prev => ({ ...prev, [evt.id]: !prev[evt.id] }))} className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08] border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors">
              <span>👑 Confirmed Players ({evt.rsvps.length})</span>
              <span className="flex items-center gap-1 text-[9px] text-slate-400 normal-case font-normal">{expandedRsvps[evt.id] ? <>Hide <ChevronUp size={11} /></> : <>Show <ChevronDown size={11} /></>}</span>
            </button>
            {expandedRsvps[evt.id] && (
              <div className="mt-2.5 bg-[#040508]/40 border border-slate-900/60 p-2.5 rounded-lg">
                {evt.rsvps.length === 0 ? <p className="text-[10px] text-slate-500 italic font-mono pl-1">No sign-ups yet.</p> : (
                  <div className="flex flex-wrap gap-1.5">
                    {members.filter(m => evt.rsvps.includes(m.id)).map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1.5 bg-[#08090d] border border-slate-850 text-slate-300 text-[10px] px-2 py-0.5 rounded-lg font-mono">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /><span className="text-slate-200 font-medium">{m.name}</span><span className="text-slate-500 text-[9px]">({m.class})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer RSVP */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-900 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Users size={12} className="text-slate-500" /><span>{evt.rsvps.length} Confirmed</span></div>
        <button onClick={() => onRsvpChange(evt.id, !rsvped)} className={`h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${rsvped ? 'bg-cyan-950/20 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-950/45' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black'}`}>
          {rsvped ? '✓ RSVP Registered' : 'Confirm RSVP'}
        </button>
      </div>
    </motion.div>
  );
}
