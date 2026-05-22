import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Gavel, Search, Plus } from 'lucide-react';
import { Member, Auction } from '../../types';
import AuctionCard from './AuctionCard';
import BidPanel from './BidPanel';
import CreateAuctionForm from './CreateAuctionForm';

interface AuctionsScreenProps {
  currentUser: Member;
  auctions: Auction[];
  onPlaceBid: (auctionId: string, amount: number) => void;
  onCreateAuction: (newAuction: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) => void;
  activeAuctionIdFromDashboard: string | null;
  clearActiveAuctionId: () => void;
}

export default function AuctionsScreen({ currentUser, auctions, onPlaceBid, onCreateAuction, activeAuctionIdFromDashboard, clearActiveAuctionId }: AuctionsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'finished' | 'all'>('active');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(activeAuctionIdFromDashboard);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const currentSelectedAuction = auctions.find((a) => a.id === (selectedAuctionId || activeAuctionIdFromDashboard));

  const filteredAuctions = auctions.filter((auc) => {
    const matchesSearch = auc.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || auc.itemGrade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || auc.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">Guild Loot Auctions</h2>
          <p className="text-slate-400 text-xs mt-1">Place bids using your GP balance to acquire premier items.</p>
        </div>
        {currentUser.role === 'admin' && (
          <button onClick={() => setShowAdminForm(!showAdminForm)} className="h-10 px-4 flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer self-start sm:self-center">
            <Plus size={16} /> {showAdminForm ? 'Close Form' : 'New Loot Auction'}
          </button>
        )}
      </div>

      {/* Admin Form */}
      <AnimatePresence>
        {showAdminForm && currentUser.role === 'admin' && <CreateAuctionForm onCreateAuction={onCreateAuction} onClose={() => setShowAdminForm(false)} />}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`${selectedAuctionId ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {/* Filters */}
          <div className="bg-[#0a0c10] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Search by item name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none" />
            </div>
            <div className="flex gap-1 bg-[#08090d] border border-slate-800 p-1 rounded-xl">
              {(['all', 'rare', 'heroic', 'legendary'] as const).map((grade) => (
                <button key={grade} onClick={() => setSelectedGrade(grade)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${selectedGrade === grade ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-305'}`}>{grade === 'all' ? 'All' : grade}</button>
              ))}
            </div>
            <div className="flex gap-1 bg-[#08090d] border border-slate-800 p-1 rounded-xl">
              {(['active', 'finished'] as const).map((status) => (
                <button key={status} onClick={() => setSelectedStatus(status)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${selectedStatus === status ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-305'}`}>{status === 'active' ? 'Active' : 'Finished'}</button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className={`grid grid-cols-1 ${selectedAuctionId ? 'sm:grid-cols-1 md:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
            {filteredAuctions.length === 0 ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0a0c10]/30">
                <Gavel size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400 text-xs uppercase font-semibold font-mono">No matching auctions</p>
              </div>
            ) : (
              filteredAuctions.map((auc) => (
                <AuctionCard key={auc.id} auction={auc} currentUser={currentUser} isSelected={selectedAuctionId === auc.id} onClick={() => { setSelectedAuctionId(auc.id); clearActiveAuctionId(); }} />
              ))
            )}
          </div>
        </div>

        {/* Bid Panel */}
        {selectedAuctionId && currentSelectedAuction && (
          <BidPanel auction={currentSelectedAuction} currentUser={currentUser} allAuctions={auctions} onPlaceBid={onPlaceBid} onClose={() => setSelectedAuctionId(null)} />
        )}
      </div>
    </div>
  );
}
