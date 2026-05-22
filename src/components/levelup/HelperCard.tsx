import React from 'react';
import { Clock } from 'lucide-react';
import { Member, LevelUpHelper } from '../../types';
import { convertEstToBrt } from '../../utils/time';

interface HelperCardProps {
  help: LevelUpHelper;
  currentUser: Member;
  onRemove: (id: string) => void;
}

export default function HelperCard({ help, currentUser, onRemove }: HelperCardProps) {
  const isOwner = help.memberId === currentUser.id;

  return (
    <div className={`bg-[#05070c] border p-4 rounded-xl flex flex-col justify-between space-y-3 transition-colors ${help.memberId === currentUser.id ? 'border-emerald-500/20 bg-[#070b12]' : 'border-slate-850'}`}>
      <div className="text-left space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <strong className="text-slate-200 text-xs font-bold font-sans block truncate max-w-[170px]" title={help.characterName}>{help.characterName}</strong>
            <span className="text-[10px] text-slate-500 font-mono block">Class: <span className="text-slate-350">{help.class}</span></span>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {help.isAlt ? (
              <span className="text-[8px] font-mono bg-cyan-950/20 text-cyan-405 border border-cyan-800/10 px-1.5 py-0.5 rounded uppercase leading-none font-bold">ALT Character</span>
            ) : (
              <span className="text-[8px] font-mono bg-emerald-950/20 text-emerald-455 border border-emerald-800/10 px-1.5 py-0.5 rounded uppercase leading-none font-bold">MAIN Account</span>
            )}
            <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1 py-0.5 rounded leading-none uppercase">📅 {help.weekday}</span>
          </div>
        </div>

        <div className="bg-[#0b0e16] p-2.5 rounded-lg border border-slate-850 text-slate-350 text-[11px] leading-relaxed space-y-1">
          <div className="flex items-center gap-1 text-[9px] text-slate-550 uppercase tracking-wider font-mono"><Clock size={11} className="text-cyan-400 shrink-0" /> Available Hours:</div>
          <p className="text-slate-200 italic leading-snug">{help.availability.includes('EST') || help.availability.includes('BRT') ? help.availability : `${help.availability} EST`}</p>
          <div className="text-[10px] font-mono text-slate-500">🇧🇷 {convertEstToBrt(help.availability)}</div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between text-[10px] text-slate-550 font-mono">
        <span>Offered by: {help.memberOriginalName}</span>
        {isOwner && (
          <button onClick={() => onRemove(help.id)} className="hover:text-red-400 text-[10px] font-bold uppercase hover:bg-red-500/5 px-2 py-0.5 border border-transparent hover:border-red-900/30 rounded transition-all cursor-pointer focus:outline-none">Withdraw</button>
        )}
      </div>
    </div>
  );
}
