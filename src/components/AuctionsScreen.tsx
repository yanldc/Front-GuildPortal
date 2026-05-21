import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gavel, 
  Search, 
  Plus, 
  Clock, 
  User, 
  Info, 
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import { Member, Auction, ItemGrade, ITEM_PRESETS, CLASSES_RAVEN2 } from '../types';

interface AuctionsScreenProps {
  currentUser: Member;
  auctions: Auction[];
  onPlaceBid: (auctionId: string, amount: number) => void;
  onCreateAuction: (newAuction: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) => void;
  activeAuctionIdFromDashboard: string | null;
  clearActiveAuctionId: () => void;
}

export default function AuctionsScreen({ 
  currentUser, 
  auctions, 
  onPlaceBid, 
  onCreateAuction,
  activeAuctionIdFromDashboard,
  clearActiveAuctionId
}: AuctionsScreenProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'finished' | 'all'>('active');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(activeAuctionIdFromDashboard);

  // States for creative bidding form
  const [bidValue, setBidValue] = useState<string>('');
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  // States for Admin "New Auction" Panel
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemGrade, setNewItemGrade] = useState<ItemGrade>('heroic');
  const [newItemMinBid, setNewItemMinBid] = useState('100');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('24'); // hours
  const [newItemAllowedClasses, setNewItemAllowedClasses] = useState<string[]>(['any']);
  const isAnyClassMode = newItemAllowedClasses.includes('any') || newItemAllowedClasses.length === 0;
  const [usePresetImage, setUsePresetImage] = useState(true);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [mockFileName, setMockFileName] = useState<string | null>(null);
  const [mockFileBase64, setMockFileBase64] = useState<string | null>(null);

  // File Upload Handlers (Simulation for item screenshot print)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMockFileName(file.name);
      // Read file to base64 to show live preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMockFileBase64(reader.result as string);
        setCustomImageUrl(reader.result as string);
        setUsePresetImage(false); // prioritize uploaded print
      };
      reader.readAsDataURL(file);
    }
  };

  const currentSelectedAuction = auctions.find((a) => a.id === (selectedAuctionId || activeAuctionIdFromDashboard));

  // Filtered auctions
  const filteredAuctions = auctions.filter((auc) => {
    const matchesSearch = auc.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || auc.itemGrade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || auc.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedAuction) return;

    const val = parseInt(bidValue, 10);
    if (isNaN(val)) {
      setBidError('Please type in a valid number.');
      return;
    }

    const minNextBid = currentSelectedAuction.currentBid + 1;

    if (val < minNextBid) {
      setBidError(`Bid must beat current bid by at least 1 GP (Minimum: ${minNextBid} GP).`);
      return;
    }

    if (val > currentUser.points) {
      setBidError(`Insufficient GP points. Your balance is ${currentUser.points} GP.`);
      return;
    }

    if (currentSelectedAuction.allowedClasses && currentSelectedAuction.allowedClasses.length > 0 && !currentSelectedAuction.allowedClasses.includes('any') && !currentSelectedAuction.allowedClasses.includes(currentUser.class)) {
      setBidError(`Class restriction applies: Only players with classes [${currentSelectedAuction.allowedClasses.join(', ')}] can place a bid on this item. Your class is "${currentUser.class}".`);
      return;
    }

    // Find last bid timestamp by this user in all auctions
    let lastBidTime: number | null = null;
    auctions.forEach((a) => {
      a.bids.forEach((bid) => {
        if (bid.memberId === currentUser.id) {
          const t = new Date(bid.timestamp).getTime();
          if (lastBidTime === null || t > lastBidTime) {
            lastBidTime = t;
          }
        }
      });
    });

    if (lastBidTime !== null) {
      const elapsed = Date.now() - lastBidTime;
      if (elapsed < 30000) {
        const remaining = Math.ceil((30000 - elapsed) / 1000);
        setBidError(`Spam Protection: You must wait at least 30 seconds between bids. (Remaining: ${remaining}s)`);
        return;
      }
    }

    // Process real bid
    onPlaceBid(currentSelectedAuction.id, val);
    setBidError(null);
    setBidSuccess(`✓ Bid of ${val} GP successfully confirmed!`);
    setBidValue('');

    // Clear confirmation message
    setTimeout(() => {
      setBidSuccess(null);
    }, 4000);
  };

  const handleCreateAuctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    let finalImageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400';

    if (usePresetImage) {
      finalImageUrl = ITEM_PRESETS[selectedPresetIndex].url;
    } else if (customImageUrl) {
      finalImageUrl = customImageUrl;
    }

    const durationHrs = parseFloat(newItemDuration) || 24;
    const endTimestamp = new Date(Date.now() + 1000 * 60 * 60 * durationHrs).toISOString();

    onCreateAuction({
      itemName: newItemName,
      itemGrade: newItemGrade,
      minBid: parseInt(newItemMinBid, 10) || 100,
      endAt: endTimestamp,
      imageUrl: finalImageUrl,
      description: newItemDesc || `Fresh drop ${newItemGrade} gear secured from our weekly Raven 2 clans raides.`,
      allowedClasses: newItemAllowedClasses
    });

    // Reset fields
    setNewItemName('');
    setNewItemDesc('');
    setNewItemMinBid('100');
    setNewItemAllowedClasses(['any']);
    setMockFileName(null);
    setMockFileBase64(null);
    setShowAdminForm(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            Guild Loot Auctions
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Place bids using your GP balance to acquire premier items obtained from co-op operations.
          </p>
        </div>

        {/* Admin trigger button */}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowAdminForm(!showAdminForm)}
            id="admin-cadastrar-leilao-toggle"
            className="h-10 px-4 flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer self-start sm:self-center"
          >
            <Plus size={16} /> {showAdminForm ? 'Close Form' : 'New Loot Auction'}
          </button>
        )}
      </div>

      {/* Admin Panel Collage */}
      <AnimatePresence>
        {showAdminForm && currentUser.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form 
              onSubmit={handleCreateAuctionSubmit}
              className="bg-[#0a0c10] border-2 border-dashed border-cyan-500/20 p-6 rounded-2xl space-y-5"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Gavel className="text-cyan-400" size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Loot Auction Registration (Admin)
                </h3>
              </div>

              {/* Form Input Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Item Name</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Platinum Blade of Justice"
                      className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Rarity Grade</label>
                      <select
                        value={newItemGrade}
                        onChange={(e) => setNewItemGrade(e.target.value as ItemGrade)}
                        className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-300 text-xs focus:outline-none"
                      >
                        <option value="rare">Rare</option>
                        <option value="heroic">Heroic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Starting Price (GP)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newItemMinBid}
                        onChange={(e) => setNewItemMinBid(e.target.value)}
                        className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Auction Duration</label>
                      <select
                        value={newItemDuration}
                        onChange={(e) => setNewItemDuration(e.target.value)}
                        className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-300 text-xs focus:outline-none"
                      >
                        <option value="0.166667">10 Minutes</option>
                        <option value="0.5">30 Minutes</option>
                        <option value="0.75">45 Minutes</option>
                        <option value="1">1 Hour</option>
                        <option value="3">3 Hours</option>
                        <option value="6">6 Hours</option>
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours (Standard)</option>
                      </select>
                    </div>                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5 flex justify-between items-center">
                        <span>Allowed Classes</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {isAnyClassMode ? 'Any Class' : `${newItemAllowedClasses.length} Selected`}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-[#050609] border border-slate-900 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => setNewItemAllowedClasses(['any'])}
                          className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isAnyClassMode
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-sm'
                              : 'text-slate-500 border border-transparent hover:text-slate-400'
                          }`}
                        >
                          🌐 Any Class (Any)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isAnyClassMode) {
                              setNewItemAllowedClasses(['Vanguard']); // default starting class when activating specific restriction
                            }
                          }}
                          className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            !isAnyClassMode
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-sm'
                              : 'text-slate-500 border border-transparent hover:text-slate-400'
                          }`}
                        >
                          🛡️ Specific Classes
                        </button>
                      </div>
                    </div>
                  </div>

                  {!isAnyClassMode && (
                    <div className="space-y-3 p-3.5 bg-[#050609] border border-slate-900 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1.5 font-bold">
                          Class Presets (Quick Selection):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewItemAllowedClasses(['Vanguard', 'Berserker', 'Destroyer', 'Warlord', 'Assassin'])}
                            className="px-2.5 py-1 text-[10px] font-sans rounded-md bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-all font-semibold cursor-pointer"
                          >
                            🛡️ Tanks & Melee
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewItemAllowedClasses(['Night Ranger', 'Gunslinger'])}
                            className="px-2.5 py-1 text-[10px] font-sans rounded-md bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-all font-semibold cursor-pointer"
                          >
                            🏹 Ranged Classes
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewItemAllowedClasses(['Divine Caster', 'Elementalist', 'Deathbringer'])}
                            className="px-2.5 py-1 text-[10px] font-sans rounded-md bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-all font-semibold cursor-pointer"
                          >
                            🔮 Mages & Support
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewItemAllowedClasses([...CLASSES_RAVEN2])}
                            className="px-2.5 py-1 text-[10px] font-sans rounded-md bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800/20 transition-all font-bold cursor-pointer"
                          >
                            ✨ All (Without 'Any')
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewItemAllowedClasses(['any'])}
                            className="px-2.5 py-1 text-[10px] font-sans rounded-md bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/20 transition-all font-bold cursor-pointer"
                          >
                            ❌ Reset to 'Any'
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-2 font-bold">
                          Select Allowed Classes (Multiple):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {CLASSES_RAVEN2.map((cls) => {
                            const isSelected = newItemAllowedClasses.includes(cls);
                            return (
                              <button
                                key={cls}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    const updated = newItemAllowedClasses.filter(c => c !== cls);
                                    if (updated.length === 0) {
                                      setNewItemAllowedClasses(['any']); // standard callback
                                    } else {
                                      setNewItemAllowedClasses(updated);
                                    }
                                  } else {
                                    setNewItemAllowedClasses([...newItemAllowedClasses.filter(c => c !== 'any'), cls]);
                                  }
                                }}
                                className={`h-8 px-2 text-[10px] rounded-lg border font-bold flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500/10 text-amber-350 border-amber-500/45'
                                    : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-900'
                                }`}
                              >
                                <span className="truncate">{cls}</span>
                                {isSelected ? (
                                  <span className="text-[10px] text-amber-400 font-extrabold ml-1">✓</span>
                                ) : (
                                  <span className="text-[9px] text-slate-650 font-normal ml-1">+</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Description / Drop Notes</label>
                    <textarea
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="e.g. Secured from Field Raid. High stats roll for Rogue/Ranger."
                      rows={2}
                      className="w-full p-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Right Column: Print Image Select & Upload */}
                <div className="space-y-4">
                  
                  {/* Select Mode Switch */}
                  <div className="flex bg-[#08090d] border border-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUsePresetImage(true)}
                      className="w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                      style={{
                        backgroundColor: usePresetImage ? '#1e293b' : 'transparent',
                        color: usePresetImage ? '#f1f5f9' : '#64748b'
                      }}
                    >
                      Item Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsePresetImage(false)}
                      className="w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                      style={{
                        backgroundColor: !usePresetImage ? '#1e293b' : 'transparent',
                        color: !usePresetImage ? '#f1f5f9' : '#64748b'
                      }}
                    >
                      Upload Screenshot
                    </button>
                  </div>

                  {usePresetImage ? (
                    <div>
                      <span className="block text-xs font-mono text-slate-400 uppercase mb-2">Select Artwork Preset</span>
                      <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-44 p-1 border border-slate-800 rounded-xl bg-[#08090d]">
                        {ITEM_PRESETS.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedPresetIndex(index)}
                            className={`relative rounded-lg overflow-hidden h-14 border transition-all ${
                              selectedPresetIndex === index 
                                ? 'border-cyan-400 scale-95 ring-2 ring-cyan-400/20' 
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center p-1">
                              <span className="text-[7.5px] font-mono uppercase text-slate-200 text-center truncate leading-tight block w-full bg-black/70 py-0.5 rounded">
                                {preset.name.split(' ')[0]}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <span className="block text-xs font-mono text-slate-400 uppercase">Attach Game Capture Print</span>
                      
                      {/* Drag & Drop simulated area */}
                      <div className="border border-dashed border-slate-800 hover:border-cyan-500/40 rounded-xl bg-[#08090d] p-5 text-center transition-colors relative">
                        <input
                          type="file"
                          id="admin-screenshot-file-uploaded"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center space-y-1 text-slate-400">
                          <UploadCloud className="text-cyan-400/75" size={24} />
                          <p className="text-xs font-semibold uppercase font-mono">
                            {mockFileName ? '✓ File Loaded' : 'Load Print Screenshot'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {mockFileName ? mockFileName : 'Click or drop your print file here'}
                          </p>
                        </div>
                      </div>

                      {/* URL Fallback */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Or paste external Image URL</label>
                        <input
                          type="text"
                          value={customImageUrl}
                          onChange={(e) => {
                            setCustomImageUrl(e.target.value);
                            setMockFileName(null);
                            setMockFileBase64(null);
                          }}
                          placeholder="https://example.com/loot.png"
                          className="w-full h-9 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-lg text-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tiny Preview image frame */}
                  {(usePresetImage || customImageUrl || mockFileBase64) && (
                    <div className="flex items-center gap-3 bg-[#0d1017] p-3 rounded-xl border border-slate-800">
                      <img 
                        src={usePresetImage ? ITEM_PRESETS[selectedPresetIndex].url : (mockFileBase64 || customImageUrl)} 
                        alt="Preview" 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=100';
                        }}
                      />
                      <div className="text-left">
                        <span className="text-[9px] font-mono text-slate-500 uppercase leading-none block">Selected Image</span>
                        <span className="text-xs font-bold text-slate-350 leading-tight block mt-1">
                          {usePresetImage ? ITEM_PRESETS[selectedPresetIndex].name : (mockFileName || 'Custom screenshot')}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdminForm(false)}
                  className="px-4 h-10 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 bg-[#12151f]/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 h-10 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 cursor-pointer"
                >
                  Create Auction
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Content: Filter + List & Detailed Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: List of Auctions with search */}
        <div className={`${selectedAuctionId ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          
          <div className="bg-[#0a0c10] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
              />
            </div>

            {/* Filter Grade */}
            <div className="flex gap-1 bg-[#08090d] border border-slate-800 p-1 rounded-xl">
              {(['all', 'rare', 'heroic', 'legendary'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    selectedGrade === grade
                      ? 'bg-slate-800 text-slate-100 font-bold'
                      : 'text-slate-500 hover:text-slate-305'
                  }`}
                >
                  {grade === 'all' ? 'All' : grade}
                </button>
              ))}
            </div>

            {/* Filter Status (Active/Finished) */}
            <div className="flex gap-1 bg-[#08090d] border border-slate-800 p-1 rounded-xl">
              {(['active', 'finished'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-slate-800 text-slate-100 font-bold'
                      : 'text-slate-500 hover:text-slate-305'
                  }`}
                >
                  {status === 'active' ? 'Active' : 'Finished'}
                </button>
              ))}
            </div>

          </div>

          {/* Grid Layout of Items */}
          <div className={`grid grid-cols-1 ${selectedAuctionId ? 'sm:grid-cols-1 md:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
            {filteredAuctions.length === 0 ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0a0c10]/30 font-sans">
                <Gavel size={32} className="mx-auto text-slate-655 mb-2 text-slate-600" />
                <p className="text-slate-400 text-xs uppercase font-semibold font-mono pb-1">No matching auctions</p>
                <p className="text-slate-500 text-[11px]">Adjust your search tags or criteria to find items.</p>
              </div>
            ) : (
              filteredAuctions.map((auc) => {
                const isSelected = selectedAuctionId === auc.id;
                return (
                  <div
                    key={auc.id}
                    onClick={() => {
                      setSelectedAuctionId(auc.id);
                      clearActiveAuctionId();
                    }}
                    className={`bg-[#0a0c10] border rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between hover:border-cyan-500/40 ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/10 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    
                    {/* Item Image Card panel */}
                    <div className="relative h-36 bg-slate-950 overflow-hidden">
                      <img 
                        src={auc.imageUrl} 
                        alt={auc.itemName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {/* Grade Banner */}
                      <span className={`absolute top-0 left-0 w-2.5 h-full ${
                        auc.itemGrade === 'legendary' ? 'bg-cyan-400' : auc.itemGrade === 'heroic' ? 'bg-purple-500' : 'bg-blue-500'
                      }`} />

                      {/* Header grade badge */}
                      <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-[8px] font-mono font-black uppercase text-slate-300 py-0.5 px-2 rounded-md border border-slate-800">
                        {auc.itemGrade}
                      </span>

                      {auc.status === 'finished' && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2">
                          <span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 rounded-lg">
                            Finished
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-grow flex flex-col justify-between text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide line-clamp-1 mb-1">
                          {auc.itemName}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
                          <Clock size={10} className="text-slate-500" />
                          <span>
                            {auc.status === 'active' 
                              ? `Expires soon`
                              : 'Closed'}
                          </span>
                        </div>

                        {auc.allowedClasses && auc.allowedClasses.length > 0 && !auc.allowedClasses.includes('any') ? (
                          <span className="inline-flex items-center gap-1 bg-amber-550/15 text-amber-400 border border-amber-500/25 text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded mt-2 uppercase max-w-full truncate" title={auc.allowedClasses.join(', ')}>
                            🛡️ {auc.allowedClasses.join(', ')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-900/60 text-slate-400 border border-slate-800/80 text-[8.5px] font-mono px-1.5 py-0.5 rounded mt-2 uppercase">
                            🌐 Any Class
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-900/60 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-slate-500 uppercase leading-none">Current Bid</span>
                          <span className="text-xs font-extrabold text-cyan-400 font-mono mt-1">{auc.currentBid} GP</span>
                        </div>
                        <div className="text-right flex flex-col">
                          <span className="text-[8px] font-mono text-slate-500 uppercase leading-none">Highest Bidder</span>
                          <span className="text-[10px] font-bold text-slate-350 truncate max-w-[85px] leading-tight block mt-0.5" title={(!auc.currentWinnerName || auc.currentWinnerName === 'None') ? 'None' : auc.currentWinnerName}>
                            {(!auc.currentWinnerName || auc.currentWinnerName === 'None') 
                              ? 'None' 
                              : (currentUser.role === 'admin' || auc.currentWinnerId === currentUser.id) 
                                ? (auc.currentWinnerId === currentUser.id ? `${auc.currentWinnerName} (You)` : auc.currentWinnerName) 
                                : auc.status === 'active' 
                                  ? '*****' 
                                  : auc.currentWinnerName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 flex justify-end">
                        <span className="text-[9px] font-semibold text-cyan-400 flex items-center gap-0.5">
                          Details <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Selected Item Bid System Detail view (5 Columns) */}
        {selectedAuctionId && currentSelectedAuction && (
          <div className="lg:col-span-5 bg-[#0a0c10]/95 border border-cyan-500/15 rounded-2xl p-5 sticky top-20 text-left space-y-5 shadow-2xl">
            
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gavel className="text-cyan-400" size={16} />
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#22d3ee]">
                  Loot Bid Board
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuctionId(null)}
                className="text-[10px] text-slate-500 hover:text-slate-350 font-mono focus:outline-none"
              >
                [Close X]
              </button>
            </div>

            {/* Display Item Artwork */}
            <div className="relative rounded-xl overflow-hidden h-44 bg-slate-950 border border-slate-800">
              <img 
                src={currentSelectedAuction.imageUrl} 
                alt={currentSelectedAuction.itemName} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-4">
                <span className={`px-2 py-0.5 text-[8px] uppercase font-black tracking-widest rounded w-fit text-zinc-950 ${
                  currentSelectedAuction.itemGrade === 'legendary' ? 'bg-cyan-400' : 'bg-purple-300'
                }`}>
                  {currentSelectedAuction.itemGrade}
                </span>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide mt-2">{currentSelectedAuction.itemName}</h3>
              </div>
            </div>

            {/* Description Notes */}
            <p className="text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40">
              {currentSelectedAuction.description}
            </p>

            {/* Class Restriction Details */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900/30 rounded-xl border border-slate-800/65 text-[10px] font-mono">
              <span className="text-slate-400 uppercase font-semibold">Allowed Classes</span>
              {currentSelectedAuction.allowedClasses && 
               currentSelectedAuction.allowedClasses.length > 0 && 
               !currentSelectedAuction.allowedClasses.includes('any') ? (
                <span className="text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/25 px-2 px-1 rounded-md text-right max-w-[65%] truncate" title={currentSelectedAuction.allowedClasses.join(', ')}>
                  🛡️ {currentSelectedAuction.allowedClasses.join(', ')} ONLY
                </span>
              ) : (
                <span className="text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-md">
                  🌐 Any Class
                </span>
              )}
            </div>

            {/* Price values and current winner */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#0d1017] rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-[9px] text-slate-500 uppercase leading-none block">Starting Price</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">{currentSelectedAuction.minBid} GP</span>
              </div>
              <div className="text-right border-l border-slate-800 pl-3">
                <span className="text-[9px] text-cyan-400 uppercase font-bold leading-none block">Current Highest Bid</span>
                <span className="text-sm font-black text-cyan-400 mt-1 block">{currentSelectedAuction.currentBid} GP</span>
              </div>
            </div>

            {/* Live bids ledger log */}
            <div>
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Bid History</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 bg-black/20 p-2 rounded-xl border border-slate-900">
                {currentSelectedAuction.bids.length === 0 ? (
                  <div className="text-center py-4 text-[10px] font-mono text-slate-500 uppercase">
                    No bids details submitted.
                  </div>
                ) : (
                  [...currentSelectedAuction.bids].reverse().map((bid) => (
                    <div 
                      key={bid.id}
                      className="flex items-center justify-between text-[11px] py-1 px-2 hover:bg-slate-900 rounded transition-colors font-mono"
                    >
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <User size={10} className="text-slate-500 shrink-0" />
                        <span className={bid.memberId === currentUser.id ? 'text-cyan-400 font-semibold' : 'text-slate-350'}>
                          {((currentUser.role === 'admin' || bid.memberId === currentUser.id) || currentSelectedAuction.status !== 'active')
                            ? (bid.memberId === currentUser.id ? `${bid.memberName} (You)` : bid.memberName)
                            : '*****'}
                          <span className="text-[9px] text-slate-500 font-normal ml-1.5 opacity-80 select-none font-mono">
                            ({new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                          </span>
                        </span>
                      </div>
                      <span className="text-cyan-400 font-bold">{bid.amount} GP</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Interactive Bid Form submission */}
            {currentSelectedAuction.status === 'active' ? (
              <form onSubmit={handleBidSubmit} className="space-y-3">
                {currentSelectedAuction.allowedClasses && 
                 currentSelectedAuction.allowedClasses.length > 0 && 
                 !currentSelectedAuction.allowedClasses.includes('any') && 
                 !currentSelectedAuction.allowedClasses.includes(currentUser.class) ? (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs leading-relaxed font-sans">
                    🛡️ <strong className="text-red-400">Class Blocked:</strong> Bidding restricted. Only players with class <strong className="text-slate-100 underline decoration-red-400">{currentSelectedAuction.allowedClasses.join(', ')}</strong> can join this item bidding. Your class is <strong className="text-red-400 font-bold">{currentUser.class}</strong>.
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-1 font-mono text-[9px] text-slate-500 uppercase">
                      <span>Minimum Valid Bid</span>
                      <strong className="text-cyan-400">{(currentSelectedAuction.currentBid + 1)} GP</strong>
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={currentSelectedAuction.currentBid + 1}
                        step={1}
                        value={bidValue}
                        onChange={(e) => setBidValue(e.target.value)}
                        placeholder={`Min: ${currentSelectedAuction.currentBid + 1}`}
                        className="w-full h-10 px-3.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 font-mono text-xs focus:outline-none"
                      />
                      <button
                        type="submit"
                        id="place-active-bid-btn"
                        className="h-10 px-5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer shrink-0"
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {bidError && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-red-400 font-mono"
                    >
                      ✕ {bidError}
                    </motion.p>
                  )}
                  {bidSuccess && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-emerald-400 font-mono"
                    >
                      {bidSuccess}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            ) : (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <span className="text-xs font-mono text-slate-500 uppercase leading-snug">
                  This auction is closed. <br />
                  <strong className="text-slate-350">Won by {currentSelectedAuction.currentWinnerName || 'None'}: {currentSelectedAuction.currentBid} GP</strong>
                </span>
              </div>
            )}

            {/* Guild Rules advice */}
            <div className="flex gap-2 text-[9.5px] text-slate-500 bg-slate-900/10 p-2.5 rounded-xl border border-slate-800 items-start">
              <Info size={14} className="text-cyan-400/40 shrink-0 mt-0.5" />
              <span>
                <strong>Rule:</strong> Multiple consecutive bids are permitted. GP points are only deducted from your balance if you are the definitive winner when the auction timer ends.
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
