import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Activity } from 'lucide-react';
import { Member, PointTransaction } from '../types';
import { api } from '../services/api';

interface RankingMember extends Member {
  realPoints: number;
}

export default function RankingScreen() {
  const [members, setMembers] = useState<RankingMember[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const [membersData, auctionsData, txData] = await Promise.all([
          api.get<Member[]>('/members'),
          api.get<any[]>('/auctions?status=active'),
          api.get<PointTransaction[]>('/transactions'),
        ]);

        const lockedGP: Record<string, number> = {};
        for (const auction of auctionsData) {
          if (auction.currentWinnerId && auction.status === 'active') {
            const endAt = new Date(auction.endAt).getTime();
            if (endAt > Date.now()) {
              lockedGP[auction.currentWinnerId] = (lockedGP[auction.currentWinnerId] || 0) + auction.currentBid;
            }
          }
        }

        const ranked = membersData.map(m => ({
          ...m,
          realPoints: m.points + (lockedGP[m.id] || 0),
        }));

        setMembers(ranked);
        setTransactions(txData.filter(t => {
          const r = t.reason.toLowerCase();
          return !(r.includes('bid') || r.includes('outbid') || r.includes('refund') || r.includes('auction'));
        }));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }

    fetchRanking();
  }, []);

  const guildGroups = {
    RuinToo: members.filter(m => (m.guild || 'RuinToo') === 'RuinToo').sort((a, b) => b.realPoints - a.realPoints),
    Burnout: members.filter(m => m.guild === 'Burnout').sort((a, b) => b.realPoints - a.realPoints),
    Void: members.filter(m => m.guild === 'Void').sort((a, b) => b.realPoints - a.realPoints),
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={14} className="text-yellow-400" />;
    if (index === 1) return <Medal size={14} className="text-slate-300" />;
    if (index === 2) return <Medal size={14} className="text-amber-600" />;
    return <span className="text-[10px] font-mono text-slate-500 w-3.5 text-center">{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
          <Trophy className="text-cyan-400" size={24} /> GP Ranking
        </h2>
        <p className="text-slate-400 text-xs mt-1">Guild Points leaderboard across all guilds. Updated on page load.</p>
      </div>

      {/* Guild Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(guildGroups).map(([guildName, guildMembers]) => (
          <div key={guildName} className="bg-[#0a0c10] border border-slate-800/80 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">{guildName}</h3>
              <span className="text-[10px] font-mono text-slate-500">{guildMembers.length} members</span>
            </div>

            <div className="space-y-2 flex-grow">
              {guildMembers.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-mono uppercase bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                  No members
                </div>
              ) : (
                guildMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      index === 0 ? 'bg-yellow-500/5 border border-yellow-500/15' :
                      index === 1 ? 'bg-slate-500/5 border border-slate-500/10' :
                      index === 2 ? 'bg-amber-500/5 border border-amber-500/10' :
                      'bg-[#0f1118]/50 border border-transparent'
                    }`}
                  >
                    <div className="w-6 flex items-center justify-center shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <img src={member.avatar} alt={member.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full bg-[#161a24] border border-slate-800 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate">{member.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">{member.class} • Lv.{member.level}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-cyan-400">{member.realPoints.toLocaleString()}</span>
                      <span className="text-[9px] font-mono text-slate-500 ml-0.5">GP</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {guildMembers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Total Guild GP</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {guildMembers.reduce((sum, m) => sum + m.realPoints, 0).toLocaleString()} GP
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* GP Audit by Guild */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-cyan-400" size={20} />
          <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight">GP History</h2>
          <p className="text-slate-500 text-xs ml-2">Admin-issued GP operations by guild</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(guildGroups).map(([guildName, guildMembers]) => {
            const memberIds = guildMembers.map(m => m.id);
            const guildTxs = transactions.filter(t => memberIds.includes(t.memberId));

            return (
              <div key={`audit-${guildName}`} className="bg-[#0a0c10] border border-slate-800/80 rounded-2xl p-5 flex flex-col max-h-[400px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">{guildName}</h3>
                  <span className="text-[10px] font-mono text-slate-500">{guildTxs.length} entries</span>
                </div>

                <div className="overflow-y-auto flex-grow space-y-1.5 pr-1">
                  {guildTxs.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs font-mono uppercase bg-slate-900/10 rounded-xl border border-dashed border-slate-800">
                      No GP operations
                    </div>
                  ) : (
                    guildTxs.map(t => (
                      <div key={t.id} className="flex items-center justify-between gap-2 p-2 bg-[#0f1118]/50 rounded-lg text-[10px]">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-300 block truncate">{t.memberName}</span>
                          <span className="text-slate-500 font-mono truncate block" title={t.reason}>{t.reason}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-mono font-bold ${t.type === 'add' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.type === 'add' ? '+' : '-'}{t.amount} GP
                          </span>
                          <span className="block text-[9px] font-mono text-slate-600">
                            {new Date(t.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
