import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Member, Auction } from '../../types';

interface AuctionCardProps {
  auction: Auction;
  currentUser: Member;
  isSelected: boolean;
  onClick: () => void;
}

export default function AuctionCard({ auction, currentUser, isSelected, onClick }: AuctionCardProps) {
  return (
    <div onClick={onClick} className={`bg-[#0a0c10] border rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between hover:border-cyan-500/40 ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/10 shadow-[0_0_20px_rgba(6,182,212,0.08)]' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="relative h-36 bg-slate-950 overflow-hidden">
        <img src={auction.imageUrl} alt={auction.itemName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        <span className={`absolute top-0 left-0 w-2.5 h-full ${auction.itemGrade === 'legendary' ? 'bg-cyan-400' : auction.itemGrade === 'heroic' ? 'bg-purple-500' : 'bg-blue-500'}`} />
        <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-[8px] font-mono font-black uppercase text-slate-300 py-0.5 px-2 rounded-md border border-slate-800">{auction.itemGrade}</span>
        {auction.status === 'finished' && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center"><span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-xs font-bold uppercase text-slate-400 rounded-lg">Finished</span></div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between text-left">
        <div>
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide line-clamp-1 mb-1">{auction.itemName}</h4>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1"><Clock size={10} className="text-slate-500" /><span>{auction.status === 'active' ? 'Expires soon' : 'Closed'}</span></div>
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
