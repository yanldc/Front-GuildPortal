import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gavel } from 'lucide-react';
import { Auction, ItemGrade, CLASSES_RAVEN2 } from '../../types';

interface CreateAuctionFormProps {
  onCreateAuction: (details: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) => Promise<void> | void;
  onClose: () => void;
}

export default function CreateAuctionForm({ onCreateAuction, onClose }: CreateAuctionFormProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemGrade, setNewItemGrade] = useState<ItemGrade>('heroic');
  const [newItemMinBid, setNewItemMinBid] = useState('1');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('24');
  const [newItemAllowedClasses, setNewItemAllowedClasses] = useState<string[]>(['any']);
  const [newItemAllowedGuilds, setNewItemAllowedGuilds] = useState<string[]>(['any']);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAnyClassMode = newItemAllowedClasses.includes('any') || newItemAllowedClasses.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setSubmitting(true);
    try {
      const durationHrs = parseFloat(newItemDuration) || 24;
      await onCreateAuction({ itemName: newItemName, itemGrade: newItemGrade, minBid: parseInt(newItemMinBid, 10) || 100, endAt: new Date(Date.now() + 1000 * 60 * 60 * durationHrs).toISOString(), imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400', description: newItemDesc || `Fresh drop ${newItemGrade} gear.`, allowedClasses: newItemAllowedClasses, allowedGuilds: newItemAllowedGuilds });
      onClose();
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
      <form onSubmit={handleSubmit} className="bg-[#0a0c10] border-2 border-dashed border-cyan-500/20 p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800"><Gavel className="text-cyan-400" size={18} /><h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Loot Auction Registration (Admin)</h3></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Item Name</label>
              <input type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Platinum Blade of Justice" className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Rarity Grade</label>
                <select value={newItemGrade} onChange={(e) => setNewItemGrade(e.target.value as ItemGrade)} className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none">
                  <option value="rare">Rare</option><option value="heroic">Heroic</option><option value="legendary">Legendary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Starting Price (GP)</label>
                <input type="number" min="1" required value={newItemMinBid} onChange={(e) => setNewItemMinBid(e.target.value)} className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Duration</label>
                <select value={newItemDuration} onChange={(e) => setNewItemDuration(e.target.value)} className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none">
                  <option value="0.083333">5 Min</option><option value="0.166667">10 Min</option><option value="0.25">15 Min</option><option value="0.5">30 Min</option><option value="1">1 Hour</option><option value="3">3 Hours</option><option value="6">6 Hours</option><option value="12">12 Hours</option><option value="24">24 Hours</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Classes</label>
                <select value={isAnyClassMode ? 'any' : 'specific'} onChange={(e) => setNewItemAllowedClasses(e.target.value === 'any' ? ['any'] : ['Vanguard'])} className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none">
                  <option value="any">Any Class</option><option value="specific">Specific</option>
                </select>
              </div>
            </div>
            {!isAnyClassMode && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {CLASSES_RAVEN2.map((cls) => {
                  const isSelected = newItemAllowedClasses.includes(cls);
                  return (<button key={cls} type="button" onClick={() => { if (isSelected) { const u = newItemAllowedClasses.filter(c => c !== cls); setNewItemAllowedClasses(u.length === 0 ? ['any'] : u); } else { setNewItemAllowedClasses([...newItemAllowedClasses.filter(c => c !== 'any'), cls]); } }} className={`h-8 px-2 text-[10px] rounded-lg border font-bold transition-all cursor-pointer ${isSelected ? 'bg-amber-500/10 text-amber-350 border-amber-500/45' : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-900'}`}>{cls} {isSelected && '✓'}</button>);
                })}
              </div>
            )}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Description</label>
              <textarea value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Drop notes..." rows={2} className="w-full p-3 bg-[#08090d] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Guild Restriction</label>
              <div className="flex gap-2">
                {['any', 'RuinToo', 'Burnout', 'Void'].map((g) => {
                  const isSelected = g === 'any' ? newItemAllowedGuilds.includes('any') : newItemAllowedGuilds.includes(g);
                  return (
                    <button key={g} type="button" onClick={() => {
                      if (g === 'any') { setNewItemAllowedGuilds(['any']); }
                      else {
                        const without = newItemAllowedGuilds.filter(x => x !== 'any');
                        if (isSelected) {
                          const updated = without.filter(x => x !== g);
                          setNewItemAllowedGuilds(updated.length === 0 ? ['any'] : updated);
                        } else {
                          setNewItemAllowedGuilds([...without, g]);
                        }
                      }
                    }} className={`px-3 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-900'}`}>
                      {g === 'any' ? '🌐 All Guilds' : g} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Image URL</label>
              <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste image URL here" className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none" />
            </div>
            {imageUrl.trim() && (
              <div className="rounded-xl overflow-hidden h-44 bg-slate-950 border border-slate-800">
                <img src={imageUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl text-xs font-semibold uppercase text-slate-400 bg-[#12151f]/50 cursor-pointer">Cancel</button>
          <button type="submit" disabled={submitting} className="px-6 h-10 rounded-xl text-xs font-bold uppercase bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? '⟳ Creating...' : 'Create Auction'}</button>
        </div>
      </form>
    </motion.div>
  );
}
