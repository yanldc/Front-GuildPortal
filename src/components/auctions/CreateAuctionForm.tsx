import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gavel, UploadCloud } from 'lucide-react';
import { Auction, ItemGrade, ITEM_PRESETS, CLASSES_RAVEN2 } from '../../types';

interface CreateAuctionFormProps {
  onCreateAuction: (details: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) => void;
  onClose: () => void;
}

export default function CreateAuctionForm({ onCreateAuction, onClose }: CreateAuctionFormProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemGrade, setNewItemGrade] = useState<ItemGrade>('heroic');
  const [newItemMinBid, setNewItemMinBid] = useState('100');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('24');
  const [newItemAllowedClasses, setNewItemAllowedClasses] = useState<string[]>(['any']);
  const [usePresetImage, setUsePresetImage] = useState(true);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [mockFileName, setMockFileName] = useState<string | null>(null);
  const [mockFileBase64, setMockFileBase64] = useState<string | null>(null);

  const isAnyClassMode = newItemAllowedClasses.includes('any') || newItemAllowedClasses.length === 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMockFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => { setMockFileBase64(reader.result as string); setCustomImageUrl(reader.result as string); setUsePresetImage(false); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    let finalImageUrl = usePresetImage ? ITEM_PRESETS[selectedPresetIndex].url : (customImageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400');
    const durationHrs = parseFloat(newItemDuration) || 24;
    onCreateAuction({ itemName: newItemName, itemGrade: newItemGrade, minBid: parseInt(newItemMinBid, 10) || 100, endAt: new Date(Date.now() + 1000 * 60 * 60 * durationHrs).toISOString(), imageUrl: finalImageUrl, description: newItemDesc || `Fresh drop ${newItemGrade} gear.`, allowedClasses: newItemAllowedClasses });
    onClose();
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
                  <option value="0.166667">10 Min</option><option value="0.5">30 Min</option><option value="1">1 Hour</option><option value="3">3 Hours</option><option value="6">6 Hours</option><option value="12">12 Hours</option><option value="24">24 Hours</option>
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
          </div>

          <div className="space-y-4">
            <div className="flex bg-[#08090d] border border-slate-800 p-1 rounded-xl">
              <button type="button" onClick={() => setUsePresetImage(true)} className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase rounded-lg ${usePresetImage ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Presets</button>
              <button type="button" onClick={() => setUsePresetImage(false)} className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase rounded-lg ${!usePresetImage ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Upload</button>
            </div>
            {usePresetImage ? (
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-[#08090d]">
                {ITEM_PRESETS.map((preset, index) => (
                  <button key={index} type="button" onClick={() => setSelectedPresetIndex(index)} className={`relative rounded-lg overflow-hidden h-14 border transition-all ${selectedPresetIndex === index ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-slate-800'}`}>
                    <img src={preset.url} alt={preset.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border border-dashed border-slate-800 hover:border-cyan-500/40 rounded-xl bg-[#08090d] p-5 text-center relative">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="text-cyan-400/75 mx-auto" size={24} />
                  <p className="text-xs font-semibold uppercase font-mono text-slate-400 mt-1">{mockFileName || 'Load Screenshot'}</p>
                </div>
                <input type="text" value={customImageUrl} onChange={(e) => { setCustomImageUrl(e.target.value); setMockFileName(null); }} placeholder="Or paste image URL" className="w-full h-9 px-3 bg-[#08090d] border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl text-xs font-semibold uppercase text-slate-400 bg-[#12151f]/50 cursor-pointer">Cancel</button>
          <button type="submit" className="px-6 h-10 rounded-xl text-xs font-bold uppercase bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 cursor-pointer">Create Auction</button>
        </div>
      </form>
    </motion.div>
  );
}
