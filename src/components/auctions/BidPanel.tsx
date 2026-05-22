import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gavel, User, Info } from 'lucide-react';
import { Member, Auction } from '../../types';

interface BidPanelProps {
  auction: Auction;
  currentUser: Member;
  allAuctions: Auction[];
  onPlaceBid: (auctionId: string, amount: number) => Promise<void> | void;
  onClose: () => void;
}

export default function BidPanel({ auction, currentUser, allAuctions, onPlaceBid, onClose }: BidPanelProps) {
  const [bidValue, setBidValue] = useState<string>('');
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(bidValue, 10);
    if (isNaN(val)) { setBidError('Please type a valid number.'); return; }
    const minNextBid = auction.currentBid + 1;
    if (val < minNextBid) { setBidError(`Bid must be at least ${minNextBid} GP.`); return; }
    if (val > currentUser.points) { setBidError(`Insufficient GP. Balance: ${currentUser.points} GP.`); return; }
    if (auction.allowedClasses && auction.allowedClasses.length > 0 && !auction.allowedClasses.includes('any') && !auction.allowedClasses.includes(currentUser.class)) { setBidError(`Class restriction: Only [${auction.allowedClasses.join(', ')}] can bid.`); return; }

    let lastBidTime: number | null = null;
    allAuctions.forEach(a => a.bids.forEach(b => { if (b.memberId === currentUser.id) { const t = new Date(b.timestamp).getTime(); if (lastBidTime === null || t > lastBidTime) lastBidTime = t; } }));
    if (lastBidTime !== null && (Date.now() - lastBidTime) < 30000) { setBidError(`Spam Protection: Wait ${Math.ceil((30000 - (Date.now() - lastBidTime)) / 1000)}s.`); return; }

    setSubmitting(true);
    try {
      await onPlaceBid(auction.id, val);
      setBidError(null); setBidSuccess(`✓ Bid of ${val} GP confirmed!`); setBidValue('');
      setTimeout(() => setBidSuccess(null), 4000);
    } catch { /* handled by parent toast */ }
    finally { setSubmitting(false); }
  };

  const classBlocked = auction.allowedClasses && auction.allowedClasses.length > 0 && !auction.allowedClasses.includes('any') && !auction.allowedClasses.includes(currentUser.class);

  return (
    <div className="lg:col-span-5 bg-[#0a0c10]/95 border border-cyan-500/15 rounded-2xl p-5 sticky top-20 text-left space-y-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2"><Gavel className="text-cyan-400" size={16} /><h3 className="text-xs font-extrabold uppercase tracking-widest text-[#22d3ee]">Loot Bid Board</h3></div>
        <button onClick={onClose} className="text-[10px] text-slate-500 hover:text-slate-350 font-mono">[Close X]</button>
      </div>

      {/* Image */}
      <div className="relative rounded-xl overflow-hidden h-64 bg-slate-950 border border-slate-800 cursor-pointer" onClick={() => setImageExpanded(true)}>
        <img src={auction.imageUrl} alt={auction.itemName} referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-4">
          <span className={`px-2 py-0.5 text-[8px] uppercase font-black tracking-widest rounded w-fit text-zinc-950 ${auction.itemGrade === 'legendary' ? 'bg-cyan-400' : 'bg-purple-300'}`}>{auction.itemGrade}</span>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide mt-2">{auction.itemName}</h3>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {imageExpanded && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4" onClick={() => setImageExpanded(false)}>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={auction.imageUrl}
              alt={auction.itemName}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-700"
            />
          </div>
        )}
      </AnimatePresence>

      <p className="text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40">{auction.description}</p>

      {/* Class restriction */}
      <div className="flex items-center justify-between p-2.5 bg-slate-900/30 rounded-xl border border-slate-800/65 text-[10px] font-mono">
        <span className="text-slate-400 uppercase font-semibold">Allowed Classes</span>
        {auction.allowedClasses && auction.allowedClasses.length > 0 && !auction.allowedClasses.includes('any') ? (
          <span className="text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-md">🛡️ {auction.allowedClasses.join(', ')} ONLY</span>
        ) : (<span className="text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-md">🌐 Any Class</span>)}
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-[#0d1017] rounded-xl border border-slate-800 font-mono">
        <div><span className="text-[9px] text-slate-500 uppercase block">Starting</span><span className="text-xs font-semibold text-slate-300 mt-1 block">{auction.minBid} GP</span></div>
        <div className="text-right border-l border-slate-800 pl-3"><span className="text-[9px] text-cyan-400 uppercase font-bold block">Current Bid</span><span className="text-sm font-black text-cyan-400 mt-1 block">{auction.currentBid} GP</span></div>
      </div>

      {/* Bid History */}
      <div>
        <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Bid History</span>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 bg-black/20 p-2 rounded-xl border border-slate-900">
          {auction.bids.length === 0 ? (<div className="text-center py-4 text-[10px] font-mono text-slate-500 uppercase">No bids yet.</div>) : (
            [...auction.bids].reverse().map((bid) => (
              <div key={bid.id} className="flex items-center justify-between text-[11px] py-1 px-2 hover:bg-slate-900 rounded font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User size={10} className="text-slate-500 shrink-0" />
                  <span className={bid.memberId === currentUser.id ? 'text-cyan-400 font-semibold' : 'text-slate-350'}>
                    {(currentUser.role === 'admin' || bid.memberId === currentUser.id || auction.status !== 'active') ? (bid.memberId === currentUser.id ? `${bid.memberName} (You)` : bid.memberName) : '*****'}
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">{bid.amount} GP</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bid Form */}
      {auction.status === 'active' ? (
        <form onSubmit={handleBidSubmit} className="space-y-3">
          {classBlocked ? (
            <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs">🛡️ <strong className="text-red-400">Class Blocked:</strong> Only [{auction.allowedClasses!.join(', ')}] can bid. Your class: <strong className="text-red-400">{currentUser.class}</strong>.</div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1 font-mono text-[9px] text-slate-500 uppercase"><span>Min Bid</span><strong className="text-cyan-400">{auction.currentBid + 1} GP</strong></div>
              <div className="flex gap-2">
                <input type="number" required min={auction.currentBid + 1} value={bidValue} onChange={(e) => setBidValue(e.target.value)} placeholder={`Min: ${auction.currentBid + 1}`} className="w-full h-10 px-3.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 font-mono text-xs focus:outline-none" />
                <button type="submit" disabled={submitting} className="h-10 px-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black text-xs uppercase rounded-xl cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? '⟳ Bidding...' : 'Place Bid'}</button>
              </div>
            </div>
          )}
          <AnimatePresence>
            {bidError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-400 font-mono">✕ {bidError}</motion.p>}
            {bidSuccess && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-emerald-400 font-mono">{bidSuccess}</motion.p>}
          </AnimatePresence>
        </form>
      ) : (
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center"><span className="text-xs font-mono text-slate-500 uppercase">Closed. Won by {auction.currentWinnerName || 'None'}: {auction.currentBid} GP</span></div>
      )}

      <div className="flex gap-2 text-[9.5px] text-slate-500 bg-slate-900/10 p-2.5 rounded-xl border border-slate-800 items-start">
        <Info size={14} className="text-cyan-400/40 shrink-0 mt-0.5" /><span><strong>Rule:</strong> GP is deducted only if you are the winner when the auction ends.</span>
      </div>
    </div>
  );
}
