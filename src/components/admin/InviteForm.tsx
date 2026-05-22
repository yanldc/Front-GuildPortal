import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, CheckCircle, Link2, Trash2, Copy } from 'lucide-react';
import { CLASSES_RAVEN2, UserRank, UserRole } from '../../types';

export default function InviteForm() {
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteClass, setInviteClass] = useState(CLASSES_RAVEN2[0]);
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [invitePoints, setInvitePoints] = useState('150');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);

  const [pendingInvites, setPendingInvites] = useState<any[]>(() => {
    try { const saved = localStorage.getItem('raven2_pending_invites'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const handleCopyLink = (code: string) => {
    try { navigator.clipboard.writeText(`${window.location.origin}/?invite=${code}`); setCopiedInviteCode(code); setTimeout(() => setCopiedInviteCode(null), 2000); } catch (err) { console.error('Copy failed', err); }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    const email = inviteEmail.trim() || `${inviteName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const initialGP = parseInt(invitePoints, 10) || 150;
    const uniqueHash = Math.random().toString(36).substring(2, 9).toUpperCase();
    const pendingInvite = { code: uniqueHash, name: inviteName, email, class: inviteClass, rank: 'Recruit' as UserRank, role: inviteRole, points: initialGP, joinedAt: new Date().toISOString() };
    const updated = [...pendingInvites, pendingInvite];
    setPendingInvites(updated);
    localStorage.setItem('raven2_pending_invites', JSON.stringify(updated));
    setGeneratedLink(`${window.location.origin}/?invite=${uniqueHash}`);
    setInviteName(''); setInviteEmail(''); setInvitePoints('150');
  };

  const handleDeleteInvite = (code: string) => {
    const updated = pendingInvites.filter((inv) => inv.code !== code);
    setPendingInvites(updated);
    localStorage.setItem('raven2_pending_invites', JSON.stringify(updated));
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0a0c10] border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"><UserPlus className="text-cyan-400" size={18} /> Invite New Recruits</h3>
        <p className="text-slate-400 text-xs mt-1">Pre-register new RPG characters to join tooburnnt and generate valid single-use entry link keys.</p>
      </div>

      <form onSubmit={handleInviteSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Character Name</label>
            <input type="text" required value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="e.g. ArthasVanguard" className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Novice Recruit's Google Email</label>
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="arthas@gmail.com" className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Starting Class</label>
            <select value={inviteClass} onChange={(e) => setInviteClass(e.target.value)} className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-350 text-xs focus:outline-none">
              {CLASSES_RAVEN2.map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Initial GP Compensation Grant</label>
            <input type="number" min="0" required value={invitePoints} onChange={(e) => setInvitePoints(e.target.value)} className="w-full h-10 px-3 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none font-mono" />
          </div>
        </div>
        <div className="border-t border-slate-900 pt-3">
          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Command Authority</label>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as UserRole)} className="w-full h-10 px-2.5 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-355 text-xs focus:outline-none font-sans">
            <option value="member">Normal Member</option>
            <option value="admin">Command Official (Admin)</option>
          </select>
        </div>
        <button type="submit" className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
          <UserPlus size={16} /> Generate Key & Pre-Register Member
        </button>
      </form>

      <AnimatePresence>
        {generatedLink && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-1 text-emerald-405 font-bold uppercase text-[10px] font-mono"><CheckCircle size={12} className="text-emerald-500" /> Member pre-registered successfully!</div>
            <p className="text-[11px] text-slate-400 leading-snug font-sans">Provide the generated simulated invite link token to the recruit:</p>
            <div className="flex items-center gap-2 bg-[#08090d] border border-slate-850 p-2.5 rounded-lg">
              <Link2 size={14} className="text-cyan-400/70" />
              <span className="text-xs font-mono text-[#22d3ee] truncate select-all">{generatedLink}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {pendingInvites.length > 0 && (
        <div className="border-t border-slate-900 pt-5 mt-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"><Link2 size={14} className="text-cyan-400" /> Active Pending Invites ({pendingInvites.length})</h4>
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
                      <div><div>{invite.name}</div><div className="text-[10px] text-slate-500 font-mono">{invite.class}</div></div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{invite.email}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-cyan-400">{invite.points} GP</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="inline-block text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded border bg-slate-950 border-slate-800 text-slate-400 mr-1.5">{invite.rank || 'Recruit'}</span>
                      <span className="text-[9.5px] text-slate-500 uppercase">({invite.role})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button type="button" onClick={() => handleCopyLink(invite.code)} className="text-[10px] font-mono px-2.5 py-1 border border-slate-800 hover:border-cyan-500/35 rounded text-cyan-400 hover:bg-cyan-500/5 cursor-pointer min-w-[76px]">{copiedInviteCode === invite.code ? 'Copied! ✅' : 'Copy Link'}</button>
                      <button type="button" onClick={() => handleDeleteInvite(invite.code)} className="p-1.5 border border-slate-800 hover:border-red-550 rounded inline-flex items-center text-slate-500 hover:text-red-400 hover:bg-red-500/5 cursor-pointer" title="Revoke / Delete Invite"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
