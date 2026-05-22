import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, Calendar } from 'lucide-react';
import { Member, Auction } from '../../types';

interface AuctionCardProps {
  auction: Auction;
  currentUser: Member;
  isSelected: boolean;
  onClick: () => void;
}

function useCountdown(endAt: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setTimeLeft(`${h}h ${m}m ${s}s`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  return timeLeft;
}

export default function AuctionCard({ auction, currentUser, isSelected, onClick }: AuctionCardProps) {
  const countdown = useCountdown(auction.endAt);
  const isEnded = countdown === 'Ended';
  const startedAt = new Date(auction.endAt).getTime() > Date.now()
    ? new Date(new Date(auction.endAt).getTime() - 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div onClick={onClick} className={`bg-[#0a0c10] border rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between hover:border-cyan-500/40 ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/10 shadow-[0_0_20px_rgba(6,182,212,0.08)]' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="relative h-116 bg-slate-950 overflow-hidden">
        <img src={auction.imageUrl} alt={auction.itemName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        <span className={`absolute top-0 left-0 w-2.5 h-full ${auction.itemGrade === 'legendary' ? 'bg-cyan-400' : auction.itemGrade === 'heroic' ? 'bg-purple-500' : 'bg-blue-500'}`} />
        <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-[8px] font-mono font-black uppercase text-slate-300 py-0.5 px-2 rounded-md border border-slate-800">{auction.itemGrade}</span>
        {(auction.status === 'finished' || isEnded) && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center"><span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-xs font-bold uppercase text-slate-400 rounded-lg">Finished</span></div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between text-left">
        <div>
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide line-clamp-1 mb-1">{auction.itemName}</h4>

          {/* Countdown timer */}
          <div className={`flex items-center gap-1.5 text-[10px] font-mono mt-1.5 ${isEnded ? 'text-red-400' : 'text-cyan-400'}`}>
            <Clock size={10} className={isEnded ? 'text-red-500' : 'text-cyan-500'} />
            <span className="font-bold">{(auction.status === 'finished' || isEnded) ? 'Ended' : countdown}</span>
          </div>

          {/* Start time */}
          {startedAt && (
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 mt-1">
              <Calendar size={9} className="text-slate-600" />
              <span>Started {startedAt}</span>
            </div>
          )}

          {auction.allowedClasses && auction.allowedClasses.length > 0 && !auction.allowedClasses.includes('any') ? (
            <span className="inline-flex items-center gap-1 bg-amber-550/15 text-amber-400 border border-amber-500/25 text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded mt-2 uppercase truncate">🛡️ {auction.allowedClasses.join(', ')}</span>
          ) : (<span className="inline-flex items-center gap-1 bg-slate-900/60 text-slate-400 border border-slate-800/80 text-[8.5px] font-mono px-1.5 py-0.5 rounded mt-2 uppercase">🌐 Any Class</span>)}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-900/60 flex items-center justify-between">
          <div className="flex flex-col"><span className="text-[8px] font-mono text-slate-500 uppercase leading-none">Current Bid</span><span className="text-xs font-extrabold text-cyan-400 font-mono mt-1">{auction.currentBid} GP</span></div>
          <div className="text-right flex flex-col">
            <span className="text-[8px] font-mono text-slate-500 uppercase leading-none">Highest Bidder</span>
            <span className="text-[10px] font-bold text-slate-350 truncate max-w-[85px] leading-tight block mt-0.5">
              {(!auction.currentWinnerName || auction.currentWinnerName === 'None') ? 'None' : (currentUser.role === 'admin' || auction.currentWinnerId === currentUser.id) ? (auction.currentWinnerId === currentUser.id ? `${auction.currentWinnerName} (You)` : auction.currentWinnerName) : auction.status === 'active' ? '*****' : auction.currentWinnerName}
            </span>
          </div>
        </div>
        <div className="mt-3.5 flex justify-end"><span className="text-[9px] font-semibold text-cyan-400 flex items-center gap-0.5">Details <ChevronRight size={12} /></span></div>
      </div>
    </div>
  );
}
