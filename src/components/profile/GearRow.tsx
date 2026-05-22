import React from 'react';
import { GearItem } from '../../types';

interface GearRowProps {
  label: string;
  value: GearItem;
  onChange: (item: GearItem) => void;
  presets: string[];
  refinementLabel?: string;
  refinementPlaceholder?: string;
}

export default function GearRow({ label, value, onChange, presets, refinementLabel = 'Ref:', refinementPlaceholder = '+6' }: GearRowProps) {
  return (
    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-2 bg-[#0d0f14]/40 hover:bg-[#0d0f14]/90 border border-slate-900 rounded-lg transition-colors">
      <div className="col-span-12 sm:col-span-3 text-xs text-slate-300 font-semibold pl-2">{label}</div>
      <div className="col-span-8 sm:col-span-6">
        <select value={value.preset} onChange={(e) => onChange({ ...value, preset: e.target.value })} className="w-full h-8 px-2 bg-slate-950 border border-slate-850 rounded text-slate-300 text-[11px] focus:outline-none font-sans">
          {presets.map((pst) => (<option key={pst} value={pst}>{pst}</option>))}
        </select>
      </div>
      <div className="col-span-4 sm:col-span-3 flex items-center gap-1">
        <span className="text-[8px] font-mono text-slate-500 uppercase">{refinementLabel}</span>
        <input type="text" value={value.refinement} onChange={(e) => onChange({ ...value, refinement: e.target.value })} placeholder={refinementPlaceholder} className="w-full h-8 px-2 bg-slate-950 border border-slate-850 rounded text-slate-200 text-xs focus:outline-none text-center font-mono font-semibold" />
      </div>
    </div>
  );
}
