import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Users, 
  Gavel, 
  Calendar, 
  Trophy, 
  Flame, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { Member, Auction, GuildEvent } from '../types';
import { convertEstToBrt } from '../utils/time';

interface DashboardProps {
  currentUser: Member;
  members: Member[];
  auctions: Auction[];
  events: GuildEvent[];
  onRsvpChange: (eventId: string, isRsvped: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSelectedAuctionId: (id: string | null) => void;
}

export default function Dashboard({ 
  currentUser, 
  members, 
  auctions, 
  events, 
  onRsvpChange,
  setActiveTab,
  setSelectedAuctionId
}: DashboardProps) {
  
  // Get active auctions and upcoming events
  const activeAuctions = auctions.filter(a => a.status === 'active' && new Date(a.endAt).getTime() > Date.now());
  const finishedAuctions = auctions.filter(a => a.status === 'finished' || new Date(a.endAt).getTime() <= Date.now());
  const upcomingEvents = events.filter(e => e.status === 'upcoming');

  const totalGP = members.reduce((sum, m) => sum + m.points, 0);
  const activeLances = activeAuctions.reduce((sum, a) => sum + a.bids.length, 0);

  // Quick action to view auction details
  const handleQuickBid = (auctionId: string) => {
    setSelectedAuctionId(auctionId);
    setActiveTab('auctions');
  };

  const isUserRsvped = (eventId: string) => {
    return events.find(e => e.id === eventId)?.rsvps.includes(currentUser.id) || false;
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Hero Welcome Panel */}
      <motion.div 
         initial={{ opacity: 0, y: 15 }}
         animate={{ opacity: 1, y: 0 }}
         className="relative overflow-hidden bg-gradient-to-r from-[#0a1619] via-[#0f1118] to-[#0a0c10] border border-cyan-500/15 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-full bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            <Flame size={12} className="text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Active War Season
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 uppercase tracking-tight">
            Greetings, <span onClick={() => setActiveTab('profile')} className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 hover:scale-[1.01] inline-block active:scale-95 transition-all cursor-pointer hover:underline underline-offset-4 decoration-cyan-400" title="Click to edit character parameters">{currentUser.name}</span>!
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Your loyalty to the <span className="text-cyan-400 font-bold uppercase">void/tooburnt</span> clan strengthens our empire in Raven 2. Attend today's guild events, compete for legendary quality loot, and claim your guild points (GP).
          </p>

          {currentUser.altNames && currentUser.altNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-slate-400">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Alt Characters:</span>
              {currentUser.altNames.map((alt, idx) => (
                <span key={idx} className="bg-cyan-950/30 border border-cyan-500/10 px-2 py-0.5 rounded text-cyan-400 font-mono text-[10.5px]">
                  {alt}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Guild Bulletin / Broadcast Banner */}
      <div className="bg-[#12141c]/40 border-l-4 border-cyan-500 p-4 rounded-r-xl flex items-center gap-3 text-left">
        <Volume2 className="text-cyan-400 shrink-0" size={18} />
        <div className="text-xs text-slate-300">
          <span className="font-bold text-cyan-400 uppercase font-mono mr-2">[CLAN NOTICE]</span> 
          Full focus on today's Boss Raid at 21:00 UTC. Everyone must join Discord. Dropped items will be listed here for bidding immediately after defeat.
        </div>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: 'Total Members', val: `${members.length}/100`, icon: Users, desc: `${members.filter(m => m.role === 'admin').length} officers active`, color: 'border-slate-800' },
          { title: 'Active Auctions', val: activeAuctions.length, icon: Gavel, desc: `${activeLances} bids placed`, color: 'border-cyan-500/10' }
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              className={`p-4 bg-[#0a0c10] border ${s.color} rounded-xl text-left flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{s.title}</span>
                <Icon className="text-cyan-400/40" size={16} />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold font-sans text-slate-100">{s.val}</div>
                <span className="text-[10px] font-mono text-slate-500 leading-tight block mt-0.5">{s.desc}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Guild Officers */}
      {(() => {
        const admins = members.filter(m => m.role === 'admin');
        if (admins.length === 0) return null;
        return (
          <div className="bg-[#0a0c10] border border-slate-800/80 rounded-2xl p-5 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Shield className="text-cyan-400" size={16} />
              <h3 className="text-sm font-bold font-sans text-slate-200 uppercase tracking-wider">Guild Officers</h3>
              <span className="text-[9px] font-mono text-slate-500 ml-auto">Need help? Reach out to any officer below</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center gap-2.5 bg-[#0f1118] border border-slate-800/60 hover:border-cyan-500/20 rounded-xl px-3.5 py-2.5 transition-all">
                  <img src={admin.avatar} alt={admin.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full bg-[#161a24] border border-slate-750" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">{admin.name}</span>
                    <span className="text-[9px] font-mono text-cyan-400">{admin.rank} • {admin.class} • {admin.guild || 'RuinToo'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Main split content widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Auctions Quick Widget (Left 7 Columns) */}
        <div className="lg:col-span-7 bg-[#0a0c10] border border-slate-800/80 rounded-2xl p-5 flex flex-col text-left space-y-6">
          {/* Active */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Gavel className="text-cyan-400" size={18} />
                <h3 className="text-sm font-bold font-sans text-slate-200 uppercase tracking-wider">
                  Active Auctions
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedAuctionId(null); setActiveTab('auctions'); }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {activeAuctions.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs font-mono uppercase bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                  No active auctions at the moment.
                </div>
              ) : (
                activeAuctions.slice(0, 3).map((auc) => (
                  <div 
                    key={auc.id}
                    className="bg-[#0f1118]/80 hover:bg-[#131622] rounded-xl p-3 border border-slate-900 hover:border-cyan-500/25 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-800/80">
                        <img src={auc.imageUrl} alt={auc.itemName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <span className={`absolute top-0 left-0 w-2 h-full ${auc.itemGrade === 'legendary' ? 'bg-cyan-400' : auc.itemGrade === 'heroic' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{auc.itemName}</h4>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                          <span className={`px-1.5 rounded uppercase font-bold text-[8px] ${auc.itemGrade === 'legendary' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : auc.itemGrade === 'heroic' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{auc.itemGrade}</span>
                          <div className="text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            {`${Math.max(1, Math.ceil((new Date(auc.endAt).getTime() - Date.now()) / (1000 * 60 * 60)))}h left`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] font-mono text-slate-500 uppercase leading-[1]">Current Bid</span>
                        <div className="text-xs font-bold font-mono text-cyan-400 mt-0.5">{auc.currentBid} GP</div>
                      </div>
                      <button onClick={() => handleQuickBid(auc.id)} className="px-3 h-8 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 rounded-lg transition-all cursor-pointer active:scale-95">Bid</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Finished */}
          {finishedAuctions.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="text-slate-500" size={16} />
                  <h3 className="text-sm font-bold font-sans text-slate-400 uppercase tracking-wider">
                    Recently Finished ({finishedAuctions.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {finishedAuctions.slice(0, 3).map((auc) => (
                  <div 
                    key={auc.id}
                    className="bg-[#0a0c10]/60 rounded-xl p-3 border border-slate-900/60 flex items-center justify-between gap-4 opacity-70"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-800/60 grayscale">
                        <img src={auc.imageUrl} alt={auc.itemName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-400 truncate">{auc.itemName}</h4>
                        <span className="text-[9px] font-mono text-slate-500">Won by {auc.currentWinnerName || 'None'}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Final</span>
                      <div className="text-xs font-bold font-mono text-slate-400">{auc.currentBid} GP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events Panel (Right 5 Columns) */}
        <div className="lg:col-span-5 bg-[#0a0c10] border border-slate-800/80 rounded-2xl p-5 flex flex-col text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-cyan-400" size={18} />
              <h3 className="text-sm font-bold font-sans text-slate-200 uppercase tracking-wider">
                Upcoming Events
              </h3>
            </div>
            <button 
              onClick={() => setActiveTab('events')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              Calendar <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3 flex-grow">
            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                No events scheduled.
              </div>
            ) : (
              upcomingEvents.slice(0, 3).map((evt) => {
                const rsvped = isUserRsvped(evt.id);
                return (
                  <div 
                    key={evt.id}
                    className="p-3 bg-[#0d1017] rounded-xl border border-slate-900 hover:border-slate-800 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 leading-tight">{evt.title}</h4>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <div className="text-[10px] text-cyan-400/90 font-mono font-semibold flex items-center gap-1">
                            <Clock size={10} /> {evt.date} EST
                          </div>
                          {evt.time && (
                            <span className="text-[9px] text-slate-500 font-mono font-medium pl-3.5">
                              🇧🇷 {convertEstToBrt(evt.time)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* RSVP Quick Toggle */}
                      <button
                        onClick={() => onRsvpChange(evt.id, !rsvped)}
                        className={`h-7 px-2.5 text-[9px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                          rsvped 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                            : 'bg-transparent text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {rsvped ? '✓ Going' : 'Join'}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-1 mb-2">
                      {evt.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-850/60 pt-2 font-mono text-[9px]">
                      <span className="text-slate-500">
                        Min Level: <strong className="text-slate-300">lvl {evt.minLevel}</strong>
                      </span>
                      <span className="text-slate-500">
                        RSVPs: <strong className="text-cyan-400">{evt.rsvps.length}</strong>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
