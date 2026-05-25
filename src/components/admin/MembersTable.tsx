import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Coins, Trash2, AlertTriangle } from 'lucide-react';
import { Member, UserRole, UserRank, CLASSES_RAVEN2 } from '../../types';

interface MembersTableProps {
  currentUser: Member;
  members: Member[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  guildFilter: string;
  setGuildFilter: (f: string) => void;
  classFilter: string;
  setClassFilter: (f: string) => void;
  sortField: 'name' | 'level' | 'points' | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: 'name' | 'level' | 'points') => void;
  selectedMemberIds: string[];
  setSelectedMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedMemberId: (id: string | null) => void;
  setViewingProfileMember: (m: Member | null) => void | Promise<void>;
  onUpdateMemberRole: (memberId: string, role: UserRole, rank: UserRank) => void;
  onUpdateMemberGuild: (memberId: string, guild: string) => Promise<void> | void;
  onDeleteMember: (memberId: string) => Promise<void> | void;
}

export default function MembersTable({
  currentUser, members, searchQuery, setSearchQuery,
  guildFilter, setGuildFilter, classFilter, setClassFilter,
  sortField, sortDirection, handleSort,
  selectedMemberIds, setSelectedMemberIds, setSelectedMemberId,
  setViewingProfileMember, onUpdateMemberRole, onUpdateMemberGuild, onDeleteMember
}: MembersTableProps) {

  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const filteredMembers = members.filter((m) => {
    const mGuild = m.guild || 'RuinToo';
    const matchesGuild = guildFilter === 'all' || mGuild === guildFilter;
    const matchesClass = classFilter === 'all' || m.class === classFilter;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGuild && matchesClass && matchesSearch;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortField === 'level') return sortDirection === 'asc' ? a.level - b.level : b.level - a.level;
    if (sortField === 'points') return sortDirection === 'asc' ? a.points - b.points : b.points - a.points;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-[#0a0c10] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Search members by character name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none" />
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-44 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Guild:</span>
            <select value={guildFilter} onChange={(e) => { setGuildFilter(e.target.value); setSelectedMemberIds([]); }} className="flex-1 h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none font-sans cursor-pointer">
              <option value="all">All</option>
              <option value="RuinToo">RuinToo</option>
              <option value="Burnout">Burnout</option>
              <option value="Void">Void</option>
            </select>
          </div>
          <div className="w-full sm:w-52 flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Class:</span>
            <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setSelectedMemberIds([]); }} className="flex-1 h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none font-sans cursor-pointer">
              <option value="all">All</option>
              {CLASSES_RAVEN2.map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-[#0b0e15] border-b border-slate-800 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                <th className="py-3 px-4 w-12 text-center select-none">
                  <input type="checkbox" checked={sortedMembers.length > 0 && sortedMembers.every(m => selectedMemberIds.includes(m.id))} onChange={(e) => { if (e.target.checked) { setSelectedMemberIds(sortedMembers.map(m => m.id)); setSelectedMemberId(null); } else { setSelectedMemberIds([]); } }} className="w-3.5 h-3.5 rounded border-slate-800 bg-[#08090d] text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500" />
                </th>
                <th className="py-3 px-4 cursor-pointer select-none hover:text-cyan-400 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">Character / Member {sortField === 'name' && <span className="text-[10px] text-cyan-400 font-bold font-mono">{sortDirection === 'asc' ? '▲' : '▼'}</span>}</div>
                </th>
                <th className="py-3 px-4 cursor-pointer select-none hover:text-cyan-400 transition-colors" onClick={() => handleSort('level')}>
                  <div className="flex items-center gap-1.5">Class / Level {sortField === 'level' && <span className="text-[10px] text-cyan-400 font-bold font-mono">{sortDirection === 'asc' ? '▲' : '▼'}</span>}</div>
                </th>
                <th className="py-3 px-4">Guild</th>
                <th className="py-3 px-4">Guild (Edit)</th>
                <th className="py-3 px-4">Roster</th>
                <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-cyan-400 transition-colors" onClick={() => handleSort('points')}>
                  <div className="flex items-center justify-end gap-1.5">GP Balance {sortField === 'points' && <span className="text-[10px] text-cyan-400 font-bold font-mono">{sortDirection === 'asc' ? '▲' : '▼'}</span>}</div>
                </th>
                <th className="py-3 px-4 text-center">GP Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedMembers.map((m) => {
                const isSelf = m.id === currentUser.id;
                return (
                  <tr key={m.id} className="hover:bg-slate-900/40 text-xs transition-colors">
                    <td className="py-3 px-4 text-center">
                      <input type="checkbox" checked={selectedMemberIds.includes(m.id)} onChange={() => { setSelectedMemberId(null); setSelectedMemberIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]); }} className="w-3.5 h-3.5 rounded border-slate-800 bg-[#08090d] text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full bg-[#121620] border border-slate-800" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewingProfileMember(m)} className="font-bold text-slate-200 hover:text-cyan-400 transition-colors cursor-pointer text-left focus:outline-none hover:underline" title="View full character and profile setup">{m.name}</button>
                            {isSelf && <span className="text-[9px] font-mono text-cyan-400 bg-cyan-450/10 px-1 py-0.5 rounded ml-1 border border-cyan-400/20">[YOU]</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><div className="flex flex-col"><span className="text-slate-300 font-medium">{m.class}</span><span className="text-[10px] font-mono text-slate-500">LEVEL {m.level}</span></div></td>
                    <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-cyan-950/20 text-cyan-400 border border-cyan-500/10 text-[10px] font-mono font-bold">{m.guild || 'RuinToo'}</span></td>
                    <td className="py-3.5 px-4 font-sans text-xs">
                      <select value={m.guild || 'RuinToo'} onChange={(e) => onUpdateMemberGuild(m.id, e.target.value)} className="bg-[#08090d] border border-slate-800 focus:border-cyan-500/45 text-[10px] text-slate-300 font-bold uppercase rounded-lg h-8 px-2 focus:outline-none cursor-pointer">
                        <option value="RuinToo">RuinToo</option>
                        <option value="Burnout">Burnout</option>
                        <option value="Void">Void</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs">
                      <select value={m.role} onChange={(e) => { const newRole = e.target.value as UserRole; const newRank: UserRank = newRole === 'admin' ? 'Officer' : 'Member'; onUpdateMemberRole(m.id, newRole, newRank); }} className="bg-[#08090d] border border-slate-800 focus:border-cyan-500/45 text-[10px] text-slate-300 font-bold uppercase rounded-lg h-8 px-2 focus:outline-none cursor-pointer">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-400">{m.points.toLocaleString()} GP</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => { setSelectedMemberIds([]); setSelectedMemberId(m.id); }} className="px-3 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1">
                          <Coins size={12} /> Manage GP
                        </button>
                        {!isSelf && (
                          <button onClick={() => setDeleteTarget(m)} title="Remove member" className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/40 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Double Confirmation Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d0f14] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Permanent Deletion</h3>
                  <p className="text-[10px] text-slate-400 font-mono">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-500/15 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <p>You are about to permanently remove <strong className="text-red-400">{deleteTarget.name}</strong> from the guild roster.</p>
                <p className="text-slate-400">This will delete all their data including: GP balance, bid history, event RSVPs, level-up requests, and transaction logs.</p>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Type <strong className="text-red-400">{deleteTarget.name}</strong> to confirm
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={deleteTarget.name}
                  className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-red-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDeleteTarget(null); setConfirmName(''); }}
                  className="flex-1 h-10 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmName !== deleteTarget.name || deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await onDeleteMember(deleteTarget.id);
                      setDeleteTarget(null);
                      setConfirmName('');
                    } finally { setDeleting(false); }
                  }}
                  className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {deleting ? '⟳ Removing...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
