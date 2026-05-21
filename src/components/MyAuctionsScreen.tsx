import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  AlertTriangle, 
  PartyPopper, 
  XOctagon, 
  Gavel, 
  Clock, 
  Plus 
} from 'lucide-react';
import { Member, Auction } from '../types';

interface MyAuctionsScreenProps {
  currentUser: Member;
  auctions: Auction[];
  onPlaceBid: (auctionId: string, amount: number) => void;
}

export default function MyAuctionsScreen({ currentUser, auctions, onPlaceBid }: MyAuctionsScreenProps) {
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter only auctions where the current user has placed at least one bid
  const myAuctions = auctions.filter((auc) => {
    return auc.bids.some((bid) => bid.memberId === currentUser.id);
  });

  const getBiddingStatus = (auc: Auction) => {
    if (auc.status === 'active') {
      if (auc.currentWinnerId === currentUser.id) {
        return {
          label: 'Winning',
          class: 'bg-emerald-500/10 text-emerald-405 border border-emerald-500/20',
          icon: <PartyPopper className="w-3.5 h-3.5 text-emerald-400" />
        };
      } else {
        return {
          label: 'Outbid',
          class: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
        };
      }
    } else {
      // Finished
      if (auc.currentWinnerId === currentUser.id) {
        return {
          label: 'Won!',
          class: 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold',
          icon: <Award className="w-3.5 h-3.5 text-cyan-400" />
        };
      } else {
        return {
          label: 'Lost',
          class: 'bg-slate-900 text-slate-500 border border-slate-800',
          icon: <XOctagon className="w-3.5 h-3.5" />
        };
      }
    }
  };

  const handleQuickBidSubmit = (auc: Auction) => {
    const rawVal = bidInputs[auc.id] || '';
    const val = parseInt(rawVal, 10);

    if (isNaN(val)) {
      setErrorMsg('Please type in a valid bid.');
      return;
    }

    const minNextBid = auc.currentBid + 1; // increment rule

    if (val < minNextBid) {
      setErrorMsg(`Bid amount must be at least ${minNextBid} GP.`);
      return;
    }

    if (val > currentUser.points) {
      setErrorMsg(`Insufficient GP balance. You only have ${currentUser.points} GP.`);
      return;
    }

    if (auc.allowedClasses && auc.allowedClasses.length > 0 && !auc.allowedClasses.includes('any') && !auc.allowedClasses.includes(currentUser.class)) {
      setErrorMsg(`Only players with the classes [${auc.allowedClasses.join(', ')}] can place a bid on this item.`);
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
        setErrorMsg(`Spam Protection: You must wait at least 30 seconds between bids. (Remaining: ${remaining}s)`);
        return;
      }
    }

    onPlaceBid(auc.id, val);
    setBidInputs({ ...bidInputs, [auc.id]: '' });
    setSuccessMsg(`Successfully bid ${val} GP on ${auc.itemName}!`);
    setErrorMsg(null);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const getUserHighestBid = (auc: Auction) => {
    const userBids = auc.bids.filter((b) => b.memberId === currentUser.id);
    if (userBids.length === 0) return 0;
    return Math.max(...userBids.map((b) => b.amount));
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
          My Bids & Loot
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Track your historical offerings and active status on all bid logs.
        </p>
      </div>

      {/* Message banners */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-3 bg-emerald-500/10 text-emerald-405 border border-emerald-500/30 rounded-xl text-xs font-medium"
          >
            {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-xs font-medium"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid view of participation */}
      {myAuctions.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0a0c10]/30 max-w-2xl mx-auto">
          <Gavel size={36} className="mx-auto text-slate-600 mb-2" />
          <p className="text-slate-400 text-sm font-semibold uppercase font-mono mb-1">No bidding history</p>
          <p className="text-slate-600 text-xs">Explore the "Guild Auctions" tab to compete for available dungeon items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myAuctions.map((auc) => {
            const status = getBiddingStatus(auc);
            const userMax = getUserHighestBid(auc);
            const minNext = auc.currentBid + 1;

            return (
              <div 
                key={auc.id}
                className="bg-[#0a0c10] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                
                {/* Item card header with image */}
                <div className="relative h-40 bg-slate-950 overflow-hidden">
                  <img 
                    src={auc.imageUrl} 
                    alt={auc.itemName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {/* Aspect tag based on state */}
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                    <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md ${status.class} flex items-center gap-1 backdrop-blur-md`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Level grade label */}
                  <span className={`absolute bottom-3 right-3 px-2 py-0.5 text-[9px] uppercase font-black tracking-widest rounded text-zinc-950 ${
                    auc.itemGrade === 'legendary' ? 'bg-cyan-400 animate-pulse' : auc.itemGrade === 'heroic' ? 'bg-purple-300' : 'bg-blue-300'
                  }`}>
                    {auc.itemGrade}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-grow flex flex-col text-left justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 line-clamp-1 mb-1">{auc.itemName}</h3>
                    
                    <div className="mt-2.5 grid grid-cols-2 gap-2 border-y border-slate-900 py-3 mb-4 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase leading-none block">Your Max Bid</span>
                        <span className="text-xs font-bold text-slate-300 mt-1 block">{userMax} GP</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase leading-none block">Current Bid</span>
                        <span className="text-xs font-extrabold text-cyan-400 mt-1 block">{auc.currentBid} GP</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational inputs for instant counter bid */}
                  {auc.status === 'active' && (
                    <div className="space-y-2 mt-auto">
                      {auc.currentWinnerId !== currentUser.id && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={minNext}
                            step={1}
                            placeholder={`Min: ${minNext}`}
                            value={bidInputs[auc.id] || ''}
                            onChange={(e) => setBidInputs({ ...bidInputs, [auc.id]: e.target.value })}
                            className="w-full h-9 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-lg text-slate-200 font-mono text-xs px-2.5 focus:outline-none"
                          />
                          <button
                            onClick={() => handleQuickBidSubmit(auc)}
                            title="Counter Bid"
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 hover:shadow-lg rounded-lg px-3.5 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between font-mono text-[9px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1"><Clock size={10} /> Closing soon</span>
                        <span>Winner: <strong>{(!auc.currentWinnerName || auc.currentWinnerName === 'None') 
                          ? 'None' 
                          : (currentUser.role === 'admin' || auc.currentWinnerId === currentUser.id) 
                            ? (auc.currentWinnerId === currentUser.id ? `${auc.currentWinnerName} (You)` : auc.currentWinnerName) 
                            : '*****'}</strong></span>
                      </div>
                    </div>
                  )}

                  {auc.status === 'finished' && (
                    <div className="pt-2 text-center border-t border-slate-900/60">
                      <p className="text-[10px] font-mono text-slate-500 uppercase">
                        {auc.currentWinnerId === currentUser.id 
                          ? 'Deducted and allocated to your character chest' 
                          : `Won by ${auc.currentWinnerName} for ${auc.currentBid} GP`}
                      </p>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
