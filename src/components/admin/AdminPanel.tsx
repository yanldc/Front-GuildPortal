import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, CheckCircle } from 'lucide-react';
import { Member, PointTransaction, UserRank, UserRole } from '../../types';
import MembersTable from './MembersTable';
import PointsAdjustPanel from './PointsAdjustPanel';
import BulkPointsPanel from './BulkPointsPanel';
import InviteForm from './InviteForm';
import AuditLogs from './AuditLogs';

interface AdminPanelProps {
  currentUser: Member;
  members: Member[];
  transactions: PointTransaction[];
  onAddMember: (newMember: Member) => void;
  onUpdatePoints: (memberId: string, amount: number, type: 'add' | 'remove', reason: string) => void;
  onUpdatePointsBulk: (memberIds: string[], amount: number, type: 'add' | 'remove', reason: string) => void;
  onUpdateMemberRole: (memberId: string, role: UserRole, rank: UserRank) => void;
}

export default function AdminPanel({ currentUser, members, transactions, onAddMember, onUpdatePoints, onUpdatePointsBulk, onUpdateMemberRole }: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'members' | 'invites' | 'logs'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [guildFilter, setGuildFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [viewingProfileMember, setViewingProfileMember] = useState<Member | null>(null);
  const [sortField, setSortField] = useState<'name' | 'level' | 'points' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const handleSort = (field: 'name' | 'level' | 'points') => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#100f0d] border border-cyan-550/15 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            <Lock size={12} className="text-cyan-400" />
            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Restricted Entry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">Guild Command Post (Admin)</h2>
          <p className="text-slate-400 text-xs">Official management of guild members, roster titles, GP modifications, and clanship recruitment invites.</p>
        </div>
        <div className="flex bg-[#07080c] p-1 border border-slate-800 rounded-xl w-full sm:w-auto shrink-0 self-start sm:self-center">
          {([{ id: 'members', label: 'Roster & GP' }, { id: 'invites', label: 'Invite Recruits' }, { id: 'logs', label: 'GP Audit Logs' }] as const).map((tab) => (
            <button key={tab.id} onClick={() => { setAdminTab(tab.id); setSelectedMemberId(null); }} className={`flex-grow sm:flex-grow-0 px-4 py-2 text-center text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${adminTab === tab.id ? 'bg-slate-850 text-cyan-300 font-bold border border-slate-800' : 'text-slate-500 hover:text-slate-350'}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Members Tab */}
      {adminTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`${(selectedMemberId || selectedMemberIds.length > 0) ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            <MembersTable
              currentUser={currentUser} members={members}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              guildFilter={guildFilter} setGuildFilter={setGuildFilter}
              classFilter={classFilter} setClassFilter={setClassFilter}
              sortField={sortField} sortDirection={sortDirection} handleSort={handleSort}
              selectedMemberIds={selectedMemberIds} setSelectedMemberIds={setSelectedMemberIds}
              setSelectedMemberId={setSelectedMemberId}
              setViewingProfileMember={setViewingProfileMember}
              onUpdateMemberRole={onUpdateMemberRole}
            />
          </div>
          {selectedMemberId && (
            <PointsAdjustPanel members={members} selectedMemberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} onUpdatePoints={onUpdatePoints} />
          )}
          {selectedMemberIds.length > 0 && !selectedMemberId && (
            <BulkPointsPanel members={members} selectedMemberIds={selectedMemberIds} setSelectedMemberIds={setSelectedMemberIds} onUpdatePointsBulk={onUpdatePointsBulk} />
          )}
        </div>
      )}

      {adminTab === 'invites' && <InviteForm />}
      {adminTab === 'logs' && <AuditLogs transactions={transactions} />}

      {/* Member Profile Modal */}
      <AnimatePresence>
        {viewingProfileMember && (() => {
          const profile = viewingProfileMember.rpgProfile;
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 overflow-y-auto">
              <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="bg-[#06080b] border border-slate-850 w-full max-w-5xl rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col my-8">
                <div className="bg-[#090b11] border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2"><CheckCircle className="text-cyan-400 h-4 w-4" size={18} /><span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">RPG Sheet & Character Setup</span></div>
                  <button onClick={() => setViewingProfileMember(null)} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer flex items-center justify-center"><X size={16} /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0e1118] border border-slate-850/80 p-5 rounded-xl flex flex-col items-center text-center">
                      <img src={viewingProfileMember.avatar} alt={viewingProfileMember.name} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full border-2 border-cyan-500/30 mb-3 bg-[#121620]" />
                      <h4 className="text-base font-bold text-slate-200">{viewingProfileMember.name}</h4>
                      <p className="text-xs font-mono text-cyan-400 mt-1 uppercase">{viewingProfileMember.class}</p>
                      <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-slate-900/60 font-mono text-xs">
                        <div className="text-center"><div className="text-slate-500 text-[9px] uppercase">Level</div><div className="text-slate-200 font-bold text-sm">LV. {viewingProfileMember.level}</div></div>
                        <div className="text-center"><div className="text-slate-500 text-[9px] uppercase">GP</div><div className="text-cyan-400 font-bold text-sm">{viewingProfileMember.points.toLocaleString()} GP</div></div>
                      </div>
                    </div>
                    <div className="bg-[#0e1118] border border-slate-850/80 p-5 rounded-xl">
                      <h5 className="text-[11px] font-mono text-cyan-400 uppercase font-extrabold mb-3">Combat Stats</h5>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-900"><div className="text-slate-500 text-[9px]">ATK</div><div className="text-cyan-300 font-bold">{profile?.atk || 0}</div></div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-900"><div className="text-slate-500 text-[9px]">DEF</div><div className="text-[#a5b4fc] font-bold">{profile?.def || 0}</div></div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-900"><div className="text-slate-500 text-[9px]">ACC</div><div className="text-[#fdba74] font-bold">{profile?.acc || 0}</div></div>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-slate-900/60 mt-4 text-xs">
                        {[{ l: 'Rift Floor', v: profile?.riftFloor || 'F1' }, { l: 'Tower Floor', v: profile?.towerFloor || 'F1' }, { l: 'Main Quest', v: profile?.mainQuest || 'None' }].map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-[#080a0e] px-2.5 py-1.5 rounded-lg border border-slate-900"><span className="text-slate-500">{item.l}:</span><span className="font-mono text-cyan-400 font-bold text-[11px]">{item.v}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0e1118] border border-slate-850/80 p-5 rounded-xl">
                      <h5 className="text-[11px] font-mono text-cyan-400 uppercase font-extrabold mb-2">Collections</h5>
                      <div className="space-y-2 text-xs">
                        {[{ l: 'Items', v: profile?.itemsCollection || '0', c: 'text-cyan-300' }, { l: 'Garments', v: profile?.garmentCollection || '0', c: 'text-pink-400' }, { l: 'Familiar', v: profile?.familiarCollection || '0', c: 'text-[#10b981]' }].map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-900"><span className="text-slate-500">{item.l}:</span><span className={`font-mono font-bold ${item.c}`}>{item.v}</span></div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-slate-900/60 mt-3">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5 font-bold">Alt Names</span>
                        {viewingProfileMember.altNames && viewingProfileMember.altNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">{viewingProfileMember.altNames.map((alt, idx) => (<span key={idx} className="bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">{alt}</span>))}</div>
                        ) : <span className="text-[10px] font-mono text-slate-500 italic">No alts</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#090b11] border-t border-slate-850 px-6 py-3.5 flex justify-end">
                  <button onClick={() => setViewingProfileMember(null)} className="px-5 h-9 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[11px] font-bold uppercase rounded-lg cursor-pointer">Close Sheet</button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
