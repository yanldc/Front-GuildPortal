import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  UserPlus, 
  Search, 
  CheckCircle, 
  Activity, 
  Lock,
  Link2,
  X,
  Trash2,
  Copy,
  Sword,
  Shield
} from 'lucide-react';
import { Member, PointTransaction, UserRank, UserRole, CLASSES_RAVEN2 } from '../types';

interface AdminPanelProps {
  currentUser: Member;
  members: Member[];
  transactions: PointTransaction[];
  onAddMember: (newMember: Member) => void;
  onUpdatePoints: (memberId: string, amount: number, type: 'add' | 'remove', reason: string) => void;
  onUpdatePointsBulk: (memberIds: string[], amount: number, type: 'add' | 'remove', reason: string) => void;
  onUpdateMemberRole: (memberId: string, role: UserRole, rank: UserRank) => void;
}

export default function AdminPanel({
  currentUser,
  members,
  transactions,
  onAddMember,
  onUpdatePoints,
  onUpdatePointsBulk,
  onUpdateMemberRole
}: AdminPanelProps) {
  
  const [adminTab, setAdminTab] = useState<'members' | 'invites' | 'logs'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [guildFilter, setGuildFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [viewingProfileMember, setViewingProfileMember] = useState<Member | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<'name' | 'level' | 'points' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // States for Point Operation Modal / Inline Form (Single Member)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [pointAmount, setPointAmount] = useState('50');
  const [pointType, setPointType] = useState<'add' | 'remove'>('add');
  const [pointReason, setPointReason] = useState('');

  // States for Bulk Point Operation
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkPointAmount, setBulkPointAmount] = useState('55');
  const [bulkPointType, setBulkPointType] = useState<'add' | 'remove'>('add');

  // States for Invite Form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteClass, setInviteClass] = useState(CLASSES_RAVEN2[0]);
  const [inviteRank, setInviteRank] = useState<UserRank>('Recruit');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [invitePoints, setInvitePoints] = useState('150');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Pending invites list state loaded from localStorage
  const [pendingInvites, setPendingInvites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('raven2_pending_invites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);

  const handleCopyLink = (code: string) => {
    try {
      const link = `${window.location.origin}/?invite=${code}`;
      navigator.clipboard.writeText(link);
      setCopiedInviteCode(code);
      setTimeout(() => {
        setCopiedInviteCode(null);
      }, 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Helper for sorting
  const handleSort = (field: 'name' | 'level' | 'points') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter members list
  const filteredMembers = members.filter((m) => {
    const mGuild = m.guild || 'RuinToo';
    const matchesGuild = guildFilter === 'all' || mGuild === guildFilter;
    const matchesClass = classFilter === 'all' || m.class === classFilter;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGuild && matchesClass && matchesSearch;
  });

  // Sort filtered list
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortField) return 0;
    
    if (sortField === 'name') {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return sortDirection === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
    
    if (sortField === 'level') {
      const lvA = a.level || 0;
      const lvB = b.level || 0;
      return sortDirection === 'asc' ? lvA - lvB : lvB - lvA;
    }

    if (sortField === 'points') {
      const ptA = a.points || 0;
      const ptB = b.points || 0;
      return sortDirection === 'asc' ? ptA - ptB : ptB - ptA;
    }
    
    return 0;
  });

  const handlePointOperationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const amount = parseInt(pointAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    onUpdatePoints(
      selectedMemberId, 
      amount, 
      pointType, 
      pointType === 'add' ? 'Ajuste de GP (Adicionado por Admin)' : 'Ajuste de GP (Removido por Admin)'
    );
    
    // Reset point form
    setSelectedMemberId(null);
    setPointReason('');
    setPointAmount('50');
  };

  const handleBulkPointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) return;

    const amount = parseInt(bulkPointAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    onUpdatePointsBulk(
      selectedMemberIds,
      amount,
      bulkPointType,
      bulkPointType === 'add' ? 'Ajuste de GP em Massa (Adicionado por Admin)' : 'Ajuste de GP em Massa (Removido por Admin)'
    );

    // Reset selection and point state
    setSelectedMemberIds([]);
    setBulkPointAmount('50');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;

    const email = inviteEmail.trim() || `${inviteName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const initialGP = parseInt(invitePoints, 10) || 150;
    const uniqueHash = Math.random().toString(36).substring(2, 9).toUpperCase();

    const pendingInvite = {
      code: uniqueHash,
      name: inviteName,
      email: email,
      class: inviteClass,
      rank: inviteRank,
      role: inviteRole,
      points: initialGP,
      joinedAt: new Date().toISOString()
    };

    // Update pendingInvites state and storage
    const updated = [...pendingInvites, pendingInvite];
    setPendingInvites(updated);
    localStorage.setItem('raven2_pending_invites', JSON.stringify(updated));

    // Generate real clickable invite link
    setGeneratedLink(`${window.location.origin}/?invite=${uniqueHash}`);

    // Reset fields
    setInviteName('');
    setInviteEmail('');
    setInvitePoints('150');
  };

  const handleDeleteInvite = (code: string) => {
    const updated = pendingInvites.filter((inv) => inv.code !== code);
    setPendingInvites(updated);
    localStorage.setItem('raven2_pending_invites', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Admin Title Header */}
      <div className="bg-[#100f0d] border border-cyan-550/15 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            <Lock size={12} className="text-cyan-400" />
            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Restricted Entry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Guild Command Post (Admin)
          </h2>
          <p className="text-slate-400 text-xs">
            Official management of guild members, roster titles, GP modifications, and clanship recruitment invites.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#07080c] p-1 border border-slate-800 rounded-xl w-full sm:w-auto shrink-0 self-start sm:self-center">
          {([
            { id: 'members', label: 'Roster & GP' },
            { id: 'invites', label: 'Invite Recruits' },
            { id: 'logs', label: 'GP Audit Logs' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setAdminTab(tab.id);
                setGeneratedLink(null);
                setSelectedMemberId(null);
              }}
              className={`flex-grow sm:flex-grow-0 px-4 py-2 text-center text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                adminTab === tab.id
                  ? 'bg-slate-850 text-cyan-300 font-bold border border-slate-800'
                  : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ADMIN SUB-TAB: MEMBERS MANAGEMENT */}
      {adminTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Members Table section */}
          <div className={`${(selectedMemberId || selectedMemberIds.length > 0) ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
            
            {/* Search and Filters */}
            <div className="bg-[#0a0c10] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search members by character name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-44 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Guild:</span>
                  <select
                    value={guildFilter}
                    onChange={(e) => {
                      setGuildFilter(e.target.value);
                      setSelectedMemberIds([]); // Reset selection when filter changes
                    }}
                    className="flex-1 h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none font-sans cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="RuinToo">RuinToo</option>
                    <option value="Burnout">Burnout</option>
                  </select>
                </div>

                <div className="w-full sm:w-52 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Class:</span>
                  <select
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      setSelectedMemberIds([]); // Reset selection when filter changes
                    }}
                    className="flex-1 h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none font-sans cursor-pointer"
                  >
                    <option value="all">All</option>
                    {CLASSES_RAVEN2.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table layout */}
            <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#0b0e15] border-b border-slate-800 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                      <th className="py-3 px-4 w-12 text-center select-none">
                        <input 
                          type="checkbox" 
                          checked={sortedMembers.length > 0 && sortedMembers.every(m => selectedMemberIds.includes(m.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMemberIds(sortedMembers.map(m => m.id));
                              setSelectedMemberId(null); // Clear single form selection
                            } else {
                              setSelectedMemberIds([]);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-800 bg-[#08090d] text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                        />
                      </th>
                      <th 
                        className="py-3 px-4 cursor-pointer select-none hover:text-cyan-400 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1.5">
                          Character / Member
                          {sortField === 'name' && (
                            <span className="text-[10px] text-cyan-400 font-bold font-mono">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 cursor-pointer select-none hover:text-cyan-400 transition-colors"
                        onClick={() => handleSort('level')}
                      >
                        <div className="flex items-center gap-1.5">
                          Class / Level
                          {sortField === 'level' && (
                            <span className="text-[10px] text-cyan-400 font-bold font-mono">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4">Guild</th>
                      <th className="py-3 px-4">Roster</th>
                      <th 
                        className="py-3 px-4 text-right cursor-pointer select-none hover:text-cyan-400 transition-colors"
                        onClick={() => handleSort('points')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          GP Balance
                          {sortField === 'points' && (
                            <span className="text-[10px] text-cyan-400 font-bold font-mono">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
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
                            <input 
                              type="checkbox" 
                              checked={selectedMemberIds.includes(m.id)}
                              onChange={() => {
                                setSelectedMemberId(null); // Clear single adjust modal
                                setSelectedMemberIds(prev => 
                                  prev.includes(m.id) 
                                    ? prev.filter(id => id !== m.id) 
                                    : [...prev, m.id]
                                );
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-800 bg-[#08090d] text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={m.avatar} 
                                alt={m.name} 
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full bg-[#121620] border border-slate-800"
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setViewingProfileMember(m)}
                                    className="font-bold text-slate-200 hover:text-cyan-400 transition-colors cursor-pointer text-left focus:outline-none hover:underline"
                                    title="View full character and profile setup"
                                  >
                                    {m.name}
                                  </button>
                                  {isSelf && <span className="text-[9px] font-mono text-cyan-400 bg-cyan-450/10 px-1 py-0.5 rounded ml-1 border border-cyan-400/20">[YOU]</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="text-slate-300 font-medium">{m.class}</span>
                              <span className="text-[10px] font-mono text-slate-500">LEVEL {m.level}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-cyan-950/20 text-cyan-400 border border-cyan-500/10 text-[10px] font-mono font-bold">
                              {m.guild || 'RuinToo'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-sans text-xs">
                            <select
                              value={m.role}
                              onChange={(e) => {
                                const newRole = e.target.value as UserRole;
                                const newRank: UserRank = newRole === 'admin' ? 'Officer' : 'Member';
                                onUpdateMemberRole(m.id, newRole, newRank);
                              }}
                              className="bg-[#08090d] border border-slate-800 focus:border-cyan-500/45 text-[10px] text-slate-300 font-bold uppercase rounded-lg h-8 px-2 focus:outline-none cursor-pointer"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-400">
                            {m.points.toLocaleString()} GP
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedMemberIds([]); // Clear multi-select
                                setSelectedMemberId(m.id);
                                setPointType('add');
                              }}
                              className="px-3 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Coins size={12} /> Manage GP
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Interactive points adjust panel on Right Column */}
          {selectedMemberId && (
            <div className="lg:col-span-4 bg-[#0a0c10]/95 border border-cyan-500/15 p-5 rounded-2xl relative sticky top-20 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  Adjust Member GP
                </span>
                <button
                  onClick={() => setSelectedMemberId(null)}
                  className="text-[10px] text-slate-500 hover:text-slate-350 font-mono"
                >
                  [Close X]
                </button>
              </div>

              {/* Target member presentation info */}
              {(() => {
                const targetM = members.find((m) => m.id === selectedMemberId);
                if (!targetM) return null;
                return (
                  <div className="bg-[#0f1118] border border-slate-800 p-3 rounded-xl flex items-center gap-3 mb-2">
                    <img 
                      src={targetM.avatar} 
                      alt={targetM.name} 
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full bg-slate-950 border border-slate-805"
                    />
                    <div className="text-left min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{targetM.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500">
                        Current Balance: <strong className="text-cyan-400 text-xs">{targetM.points} GP</strong>
                      </p>
                    </div>
                  </div>
                );
              })()}

              <form onSubmit={handlePointOperationSubmit} className="space-y-4">
                
                {/* Add or Remove Switch */}
                <div className="flex bg-[#08090d] border border-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPointType('add')}
                    className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      pointType === 'add' 
                        ? 'bg-emerald-500/15 text-emerald-405 border border-emerald-500/10' 
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    + Reward GP
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointType('remove')}
                    className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      pointType === 'remove' 
                        ? 'bg-red-500/15 text-red-400 border border-red-500/10' 
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    - Deduct GP
                  </button>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">GP Point Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pointAmount}
                    onChange={(e) => setPointAmount(e.target.value)}
                    className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 font-mono text-sm focus:outline-none"
                  />
                </div>


                {/* Action CTA */}
                <button
                  type="submit"
                  className={`w-full h-10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    pointType === 'add'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-red-500 hover:bg-red-600 text-zinc-950 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  }`}
                >
                  {pointType === 'add' ? 'Apply GP Grant' : 'Apply GP Deduction'}
                </button>

              </form>
            </div>
          )}

          {/* Bulk GP Adjustment panel on Right Column */}
          {selectedMemberIds.length > 0 && (
            <div className="lg:col-span-4 bg-[#0a0c10]/95 border border-cyan-500/15 p-5 rounded-2xl relative sticky top-20 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    Bulk GP Adjustment
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {selectedMemberIds.length} members selected
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMemberIds([])}
                  className="text-[10px] text-slate-500 hover:text-slate-350 font-mono"
                >
                  [Cancel X]
                </button>
              </div>

              {/* Selected players list tag board */}
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Target Characters Selection</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#08090d] border border-slate-850 rounded-xl">
                  {selectedMemberIds.map((id) => {
                    const mb = members.find((item) => item.id === id);
                    return mb ? (
                      <span 
                        key={id} 
                        className="text-[10px] font-mono font-bold bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded flex items-center gap-1.5"
                      >
                        {mb.name}
                        <button
                          type="button"
                          className="text-slate-505 hover:text-red-400 font-extrabold cursor-pointer focus:outline-none shrink-0"
                          title="Remove from block adjust"
                          onClick={() => setSelectedMemberIds((prev) => prev.filter((prevId) => prevId !== id))}
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <form onSubmit={handleBulkPointSubmit} className="space-y-4">
                
                {/* Add or Remove Switch */}
                <div className="flex bg-[#08090d] border border-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBulkPointType('add')}
                    className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      bulkPointType === 'add' 
                        ? 'bg-emerald-500/15 text-emerald-405 border border-emerald-500/10' 
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    + Reward GP
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkPointType('remove')}
                    className={`w-1/2 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      bulkPointType === 'remove' 
                        ? 'bg-red-500/15 text-red-400 border border-red-500/10' 
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    - Deduct GP
                  </button>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">GP points per player</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bulkPointAmount}
                    onChange={(e) => setBulkPointAmount(e.target.value)}
                    className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 font-mono text-sm focus:outline-none"
                  />
                </div>

                {/* Action CTA with total summary */}
                <button
                  type="submit"
                  className={`w-full h-10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    bulkPointType === 'add'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-red-500 hover:bg-red-600 text-zinc-950 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  }`}
                >
                  {bulkPointType === 'add' 
                    ? `Grant GP to ${selectedMemberIds.length} Members` 
                    : `Deduct GP from ${selectedMemberIds.length} Members`
                  }
                </button>

              </form>
            </div>
          )}
        </div>
      )}

      {/* ADMIN SUB-TAB: INVITE NEW MEMBER */}
      {adminTab === 'invites' && (
        <div className="max-w-2xl mx-auto bg-[#0a0c10] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <UserPlus className="text-cyan-400" size={18} /> Invite New Recruits
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Pre-register new RPG characters to join tooburnnt and generate valid single-use entry link keys.
            </p>
          </div>

          <form onSubmit={handleInviteSubmit} className="space-y-4 text-left">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Character Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. ArthasVanguard"
                  className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Novice Recruit's Google Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="arthas@gmail.com"
                  className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Starting Class</label>
                <select
                  value={inviteClass}
                  onChange={(e) => setInviteClass(e.target.value)}
                  className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-350 text-xs focus:outline-none"
                >
                  {CLASSES_RAVEN2.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Initial GP Compensation Grant</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={invitePoints}
                  onChange={(e) => setInvitePoints(e.target.value)}
                  className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="border-t border-slate-900 pt-3">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Command Authority</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-355 text-xs focus:outline-none font-sans"
              >
                <option value="member">Normal Member</option>
                <option value="admin">Command Official (Admin)</option>
              </select>
            </div>

            {/* Submit Trigger Invite */}
            <button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus size={16} /> Generate Key & Pre-Register Member
            </button>

          </form>

          {/* Display simulated link on submission */}
          <AnimatePresence>
            {generatedLink && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl text-left space-y-2"
              >
                <div className="flex items-center gap-1 text-emerald-405 font-bold uppercase text-[10px] font-mono">
                  <CheckCircle size={12} className="text-emerald-500" /> Member pre-registered successfully!
                </div>
                <p className="text-[11px] text-slate-400 leading-snug font-sans">
                  Provide the generated simulated invite link token to the recruit so they can authorize access on Google authorization entry:
                </p>
                <div className="flex items-center gap-2 bg-[#08090d] border border-slate-850 p-2.5 rounded-lg">
                  <Link2 size={14} className="text-cyan-400/70" />
                  <span className="text-xs font-mono text-[#22d3ee] truncate select-all">{generatedLink}</span>
                  <span className="ml-auto text-[9px] bg-slate-800 text-slate-400 py-0.5 px-2 rounded uppercase font-mono font-bold">Invite Token</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Pending Invites Table */}
          {pendingInvites.length > 0 && (
            <div className="border-t border-slate-900 pt-5 mt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Link2 size={14} className="text-cyan-400" /> Active Pending Invites ({pendingInvites.length})
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                These recruits have been pre-allocated, but have not logged in to active character profile mapping on the portal yet.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0b0e15] border-b border-slate-800 font-mono text-[9px] text-slate-500 uppercase tracking-widest py-2">
                      <th className="py-2.5 px-3">Character Name</th>
                      <th className="py-2.5 px-3">Target Google Email</th>
                      <th className="py-2.5 px-3">Start GP</th>
                      <th className="py-2.5 px-3">Authority / Rank</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {pendingInvites.map((invite) => (
                      <tr key={invite.code} className="hover:bg-slate-950/20 text-[11px] text-slate-300">
                        <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <div>
                            <div>{invite.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{invite.class}</div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{invite.email}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-cyan-400">{invite.points} GP</td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="inline-block text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded border bg-slate-950 border-slate-800 text-slate-400 mr-1.5">
                            {invite.rank || 'Recruit'}
                          </span>
                          <span className="text-[9.5px] text-slate-500 uppercase">({invite.role})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(invite.code)}
                            className="text-[10px] font-mono px-2.5 py-1 border border-slate-800 hover:border-cyan-500/35 rounded text-cyan-400 hover:bg-cyan-500/5 cursor-pointer min-w-[76px]"
                          >
                            {copiedInviteCode === invite.code ? 'Copied! ✅' : 'Copy Link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInvite(invite.code)}
                            className="p-1.5 border border-slate-800 hover:border-red-550 rounded inline-flex items-center text-slate-500 hover:text-red-400 hover:bg-red-500/5 cursor-pointer"
                            title="Revoke / Delete Invite"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN SUB-TAB: AUDITORIA DE PONTOS */}
      {adminTab === 'logs' && (() => {
        const isAuctionTransaction = (t: PointTransaction) => {
          const reasonLower = t.reason.toLowerCase();
          return (
            reasonLower.includes('bid') ||
            reasonLower.includes('outbid') ||
            reasonLower.includes('auction') ||
            reasonLower.includes('leilão') ||
            reasonLower.includes('lance') ||
            reasonLower.includes('arremate') ||
            reasonLower.includes('refund') ||
            reasonLower.includes('item:')
          );
        };

        const auctionTxs = [...transactions].reverse().filter(isAuctionTransaction);
        const adminTxs = [...transactions].reverse().filter(t => !isAuctionTransaction(t));

        return (
          <div className="space-y-6">
            <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Activity className="text-cyan-400" size={18} /> GP Audit Ledger
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Full logs auditing distributed clanship resources, manual edits, and active bidding histories.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: AUCTIONS */}
              <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl p-5 flex flex-col h-full min-h-[350px]">
                <div className="pb-3 border-b border-slate-800 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Sword size={14} /> Auction & Bidding Logs (Leilão)
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Bid expenditures, outbid refunds, and guild item acquisitions.
                    </p>
                  </div>
                  <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/20 px-2 py-0.5 rounded font-mono font-bold">
                    {auctionTxs.length} Total
                  </span>
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0b0e15]/50 border-b border-slate-800/80 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">GP Amount</th>
                        <th className="py-2.5 px-3">Bidding Reason</th>
                        <th className="py-2.5 px-3 text-right">Date / Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-[11px] leading-relaxed">
                      {auctionTxs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-600 font-mono uppercase text-[9.5px]">
                            No auction logs registered.
                          </td>
                        </tr>
                      ) : (
                        auctionTxs.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-900/10">
                            <td className="py-2.5 px-3 font-semibold text-slate-350">
                              {t.memberName}
                            </td>
                            <td className={`py-2.5 px-3 font-mono font-extrabold ${
                              t.type === 'add' ? 'text-emerald-450' : 'text-red-400'
                            }`}>
                              {t.type === 'add' ? '+' : '-'}{t.amount} GP
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-[150px] truncate" title={t.reason}>
                              {t.reason}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-500">
                              {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD 2: ADMIN ADDED/REMOVED */}
              <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl p-5 flex flex-col h-full min-h-[350px]">
                <div className="pb-3 border-b border-slate-800 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Shield size={14} /> Staff Manual Operations (Pontos Adm)
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      GP rewards, direct alterations, and event attendance credit adjustments.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/20 px-2 py-0.5 rounded font-mono font-bold">
                    {adminTxs.length} Total
                  </span>
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0b0e15]/50 border-b border-slate-800/80 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">GP Amount</th>
                        <th className="py-2.5 px-3">Staff Reason</th>
                        <th className="py-2.5 px-3 text-right">Date / Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-[11px] leading-relaxed">
                      {adminTxs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-600 font-mono uppercase text-[9.5px]">
                            No manual operations logged.
                          </td>
                        </tr>
                      ) : (
                        adminTxs.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-900/10">
                            <td className="py-2.5 px-3 font-semibold text-slate-350">
                              {t.memberName}
                            </td>
                            <td className={`py-2.5 px-3 font-mono font-extrabold ${
                              t.type === 'add' ? 'text-emerald-450' : 'text-red-400'
                            }`}>
                              {t.type === 'add' ? '+' : '-'}{t.amount} GP
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 max-w-[150px] truncate" title={t.reason}>
                              {t.reason}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-500">
                              {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Viewing full sheet character modal */}
      <AnimatePresence>
        {viewingProfileMember && (() => {
          const profile = viewingProfileMember.rpgProfile;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-[#06080b] border border-slate-850 w-full max-w-5xl rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col my-8"
              >
                {/* Header */}
                <div className="bg-[#090b11] border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-cyan-400 h-4 w-4" size={18} />
                    <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                      RPG Sheet & Character Setup
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingProfileMember(null)}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-850 transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body - Scrollable content */}
                <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6 text-left">
                  {/* General Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Col 1: Avatar and Basic Info */}
                    <div className="bg-[#0e1118] border border-slate-850/80 p-5 rounded-xl flex flex-col items-center justify-center text-center">
                      <img 
                        src={viewingProfileMember.avatar} 
                        alt={viewingProfileMember.name} 
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full border-2 border-cyan-500/30 mb-3 bg-[#121620]" 
                      />
                      <h4 className="text-base font-bold text-slate-200">{viewingProfileMember.name}</h4>
                      <p className="text-xs font-mono text-cyan-400 mt-1 uppercase tracking-wider font-semibold">{viewingProfileMember.class}</p>
                      
                      <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                        <span className="text-[10px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 px-2.5 py-0.5 rounded-full uppercase font-bold">
                          Guild: {viewingProfileMember.guild || 'RuinToo'}
                        </span>
                        <span className="text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase font-bold">
                          {viewingProfileMember.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-slate-900/60 font-mono text-xs">
                        <div className="text-center">
                          <div className="text-slate-500 text-[9px] uppercase">Level</div>
                          <div className="text-slate-200 font-bold text-sm">LV. {viewingProfileMember.level || 1}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-500 text-[9px] uppercase">GP History</div>
                          <div className="text-cyan-400 font-bold text-sm">{viewingProfileMember.points.toLocaleString()} GP</div>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Combat Stats & Floors */}
                    <div className="bg-[#0e1118] border border-slate-850/80 p-5 rounded-xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                          Combat Stats
                        </h5>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                            <div className="text-slate-500 text-[9px] uppercase">ATK</div>
                            <div className="text-slate-200 font-bold text-xs text-cyan-300 mt-0.5">{profile?.atk || 0}</div>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                            <div className="text-slate-500 text-[9px] uppercase">DEF</div>
                            <div className="text-slate-200 font-bold text-xs text-[#a5b4fc] mt-0.5">{profile?.def || 0}</div>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                            <div className="text-slate-500 text-[9px] uppercase">ACC</div>
                            <div className="text-slate-200 font-bold text-xs text-[#fdba74] mt-0.5">{profile?.acc || 0}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-900/60 mt-4 text-xs">
                        <div className="flex justify-between items-center bg-[#080a0e] px-2.5 py-1.5 rounded-lg border border-slate-900">
                          <span className="text-slate-500 font-semibold">Rift Floor:</span>
                          <span className="font-mono text-cyan-400 font-bold text-[11px]">{profile?.riftFloor || 'F1'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#080a0e] px-2.5 py-1.5 rounded-lg border border-slate-900">
                          <span className="text-slate-500 font-semibold">Tower Floor:</span>
                          <span className="font-mono text-cyan-400 font-bold text-[11px]">{profile?.towerFloor || 'F1'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#080a0e] px-2.5 py-1.5 rounded-lg border border-slate-900">
                          <span className="text-slate-505 font-semibold">Main Quest:</span>
                          <span className="text-amber-400 font-mono text-[10px] max-w-[130px] truncate" title={profile?.mainQuest || 'None'}>
                            {profile?.mainQuest || 'None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Collections & Alts */}
                    <div className="bg-[#0e1118] border border-slate-850/80 p-5 rounded-xl flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold">
                          Server Collections
                        </h5>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-900">
                            <span className="text-slate-500">Item Collection:</span>
                            <span className="font-mono text-cyan-300 font-bold">{profile?.itemsCollection || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-900">
                            <span className="text-slate-500">Garments:</span>
                            <span className="font-mono text-pink-400 font-bold">{profile?.garmentCollection || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-900">
                            <span className="text-slate-505">Familiar Collection:</span>
                            <span className="font-mono text-[#10b981] font-bold">{profile?.familiarCollection || '0'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-900/60 mt-3">
                        <span className="text-[9px] font-mono text-slate-505 uppercase block mb-1.5 font-bold tracking-wider">Alt Names (Alt Characters)</span>
                        {viewingProfileMember.altNames && viewingProfileMember.altNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                            {viewingProfileMember.altNames.map((alt, idx) => (
                              <span key={idx} className="bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                                {alt}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 italic">No alts registered</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Character Items Layout Grids */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Weapons & Armor */}
                    <div className="bg-[#0e1118]/80 border border-slate-850/80 p-4 rounded-xl space-y-3">
                      <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold border-b border-slate-900/80 pb-2 flex items-center gap-1.5">
                        Weapons & Armor
                      </h5>
                      <div className="space-y-1.5">
                        {/* Main Weapon */}
                        <div className="flex justify-between items-center text-[11.5px] bg-slate-950 p-2 rounded-lg border border-cyan-500/10 hover:border-cyan-500/20 transition-all">
                          <span className="text-cyan-400 font-extrabold uppercase text-[9.5px] font-mono tracking-wider">MAIN WEAPON</span>
                          <span className="text-slate-205 font-semibold font-mono font-bold">
                            {profile?.mainWeapon?.preset || 'Blue/rare'} <span className="text-cyan-400 font-black ml-1.5">{profile?.mainWeapon?.refinement || '+0'}</span>
                          </span>
                        </div>
                        {[
                          { label: 'Gloves', val: profile?.gloves },
                          { label: 'Cape', val: profile?.cape },
                          { label: 'Helmet', val: profile?.helmet },
                          { label: 'Chest', val: profile?.chest },
                          { label: 'Pants', val: profile?.pants },
                          { label: 'Boots', val: profile?.boots }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] bg-[#0d0f14]/80 p-1.5 px-3 rounded-lg border border-slate-900">
                            <span className="text-slate-400 font-semibold">{item.label}</span>
                            <span className="text-slate-200 font-mono font-bold">
                              {item.val?.preset || 'Blue'} <span className="text-cyan-400 font-bold ml-1.5">{item.val?.refinement || '+0'}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Jewelry & Accessories */}
                    <div className="bg-[#0e1118]/80 border border-slate-850/80 p-4 rounded-xl space-y-3">
                      <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold border-b border-slate-900/80 pb-2 flex items-center gap-1.5">
                        Accessories & Jewelry
                      </h5>
                      <div className="space-y-1.5">
                        {[
                          { label: 'Left Earrings', val: profile?.lEarrings },
                          { label: 'Right Earrings', val: profile?.rEarrings },
                          { label: 'Necklace', val: profile?.necklace },
                          { label: 'Belt', val: profile?.belt },
                          { label: 'Left Bracelet', val: profile?.lBracelet },
                          { label: 'Right Bracelet', val: profile?.rBracelet },
                          { label: 'Left Ring', val: profile?.lRing },
                          { label: 'Right Ring', val: profile?.rRing },
                          { label: 'Toten', val: profile?.toten },
                          { label: 'Seal', val: profile?.seal }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] bg-[#0d0f14]/80 p-1.5 px-3 rounded-lg border border-slate-900">
                            <span className="text-slate-400 font-semibold">{item.label}</span>
                            <span className="text-slate-200 font-mono font-bold">
                              {item.val?.preset || 'Blue'} <span className="text-teal-400 font-bold ml-1.5">{item.val?.refinement || '+0'}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Symbols */}
                    <div className="bg-[#0e1118]/80 border border-slate-850/80 p-4 rounded-xl space-y-3">
                      <h5 className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold border-b border-slate-900/80 pb-2 flex items-center gap-1.5">
                        Sacred Clan Symbols
                      </h5>
                      <div className="space-y-3">
                        {[
                          { label: 'Rift Hunter Symbol', val: profile?.riftHunterSymbol },
                          { label: 'Honorable Symbol', val: profile?.honorableSymbol },
                          { label: 'Dimensional Wanderers Symbol', val: profile?.dimensionalWanderersSymbol }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-900/90 space-y-2">
                            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              ✨ {item.label}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                              <div className="bg-[#0d0f14]/80 px-2 py-1 rounded border border-slate-900 font-bold">
                                <span className="text-slate-500 uppercase text-[8px] block leading-none">Preset:</span>
                                <span className="text-cyan-400 capitalize">{item.val?.preset || 'grey'}</span>
                              </div>
                              <div className="bg-[#0d0f14]/80 px-2 py-1 rounded border border-slate-900 font-bold">
                                <span className="text-slate-505 uppercase text-[8px] block leading-none">Upgrade:</span>
                                <span className="text-amber-400">{item.val?.refinement || 'Lv.0'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-[#090b11] border-t border-slate-850 px-6 py-3.5 flex justify-end">
                  <button
                    onClick={() => setViewingProfileMember(null)}
                    className="px-5 h-9 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Close Sheet
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
