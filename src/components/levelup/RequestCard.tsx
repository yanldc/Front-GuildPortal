import React from 'react';
import { Clock, Trash2, UserPlus, Users } from 'lucide-react';
import { Member, LevelUpRequest } from '../../types';
import { convertEstToBrt } from '../../utils/time';

interface RequestCardProps {
  req: LevelUpRequest;
  currentUser: Member;
  onDelete: (id: string) => void;
  onOpenJoin: (id: string) => void;
  onLeaveSlot: (reqId: string, charName: string) => void;
}

export default function RequestCard({ req, currentUser, onDelete, onOpenJoin, onLeaveSlot }: RequestCardProps) {
  const isCreator = req.createdBy === currentUser.id;
  const slotsFilled = req.slots.length;
  const isUserAlreadyJoined = req.slots.some((s) => s.joinedById === currentUser.id);

  return (
    <div className={`bg-[#0a0c10] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-slate-750 relative ${req.createdBy === currentUser.id ? 'border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.02)]' : 'border-slate-850'}`}>
      {(isCreator || currentUser.role === 'admin') && (
        <button onClick={() => onDelete(req.id)} className="absolute top-4 right-4 p-1.5 bg-slate-950/80 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer" title="Delete this help card"><Trash2 size={13.5} /></button>
      )}

      <div className="space-y-3 text-left">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 pr-8">
            <span className="text-[11px] text-slate-500 font-mono">Requestor:</span>
            <strong className="text-slate-300 text-xs font-semibold">{req.createdByName}</strong>
            <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded leading-none uppercase">{req.class}</span>
            <span className={`text-[9px] font-mono border px-2 py-0.5 rounded ml-auto ${req.weekday === 'Every day' ? 'bg-purple-950/20 text-purple-400 border-purple-800/30' : 'bg-cyan-950/20 text-cyan-400 border-cyan-800/30'}`}>📅 {req.weekday}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-200 hover:text-cyan-400 transition-colors pr-6">{req.title}</h4>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 bg-[#0f121d] border border-cyan-500/10 rounded-xl px-3.5 py-1.5 text-xs text-cyan-300 font-mono w-fit">
            <Clock size={13} className="text-cyan-400 shrink-0" />
            <span>{req.time.includes('EST') || req.time.includes('BRT') ? req.time : `${req.time} EST`}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 pl-1">🇧🇷 {convertEstToBrt(req.time)}</span>
        </div>

        {/* Slots */}
        <div className="pt-2.5 border-t border-slate-900 space-y-2">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Assistant Slots ({slotsFilled}/4)</span>
            <span className="text-[10px] text-slate-500 font-mono">any member or alt can join</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((index) => {
              const slot = req.slots[index];
              if (slot) {
                const isMySlot = slot.joinedById === currentUser.id;
                return (
                  <div key={index} className="bg-[#10141e] border border-teal-500/20 px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-1.5 text-xs text-slate-300 font-sans">
                    <div className="truncate flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <div className="truncate">
                        <div className="font-semibold text-slate-100 truncate text-[11.5px] leading-tight">{slot.characterName}</div>
                        <div className="text-[9px] text-slate-500 font-mono truncate leading-none">{slot.isAlt ? `Alt of ${slot.joinedByName}` : `owner: ${slot.joinedByName}`}</div>
                      </div>
                    </div>
                    {isMySlot && (<button onClick={() => onLeaveSlot(req.id, slot.characterName)} className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400 transition-colors focus:outline-none font-mono text-[9px] uppercase font-bold" title="Leave this slot">✕</button>)}
                  </div>
                );
              }
              return (
                <button key={index} onClick={() => onOpenJoin(req.id)} className="bg-[#050609] border border-dashed border-slate-800 hover:border-cyan-500/25 px-2.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] text-slate-550 hover:text-cyan-405 leading-none transition-all cursor-pointer h-10 select-none">
                  <UserPlus size={12} className="text-slate-600 animate-pulse" /><span>Open Slot (Click to join)</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 mt-3 border-t border-slate-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-550"><Users size={12} /><span>{4 - slotsFilled} slots free</span></div>
        {slotsFilled < 4 ? (
          <button onClick={() => onOpenJoin(req.id)} className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${isUserAlreadyJoined ? 'bg-cyan-950/20 text-cyan-450 border border-cyan-800/35 hover:bg-cyan-950/40' : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800'}`}>
            <UserPlus size={13} />{isUserAlreadyJoined ? 'Register Alt +' : 'Join Party'}
          </button>
        ) : (<span className="text-[10px] font-mono uppercase bg-emerald-950/20 text-emerald-405 border border-emerald-900/30 px-2.5 py-1 rounded">Party Full ✓</span>)}
      </div>
    </div>
  );
}
