import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, ArrowRight } from 'lucide-react';

interface GoogleAccount {
  email: string;
  name: string;
  picture: string;
  note?: string;
}

const GOOGLE_ACCOUNTS_PRESET: GoogleAccount[] = [
  { email: 'yanlemkedecastro@gmail.com', name: 'Yan Lemke de Castro', picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yan', note: 'Primary Developer Account (Rank: Leader)' },
  { email: 'shadowvixen@guild.com', name: 'Shadow Vixen CSO', picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow', note: 'Pre-registered Account (Rank: Elite)' },
  { email: 'bloodrage@guild.com', name: 'Blood Rage Officer', picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Blood', note: 'Pre-registered Account (Rank: Officer)' }
];

interface AccountSelectorProps {
  onSelect: (acc: { email: string; name: string; picture: string }) => void;
  onClose: () => void;
}

export default function AccountSelector({ onSelect, onClose }: AccountSelectorProps) {
  const [isEnteringCustom, setIsEnteringCustom] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customName.trim() || customEmail.split('@')[0];
    onSelect({ email: customEmail.trim(), name, picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-[#0d0f14] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer">✕</button>
        <div className="text-center mb-5 pb-4 border-b border-slate-900">
          <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.19-.48-.28-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Sign in with Google</h3>
          <p className="text-[11px] text-slate-400 mt-1">Select an account to access tooburnnt guild portal</p>
        </div>

        {!isEnteringCustom ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {GOOGLE_ACCOUNTS_PRESET.map((acc, idx) => (
              <button key={idx} onClick={() => onSelect(acc)} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-[#141822] border border-slate-850 hover:border-cyan-500/30 transition-all text-left cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-800"><img src={acc.picture} alt={acc.name} referrerPolicy="no-referrer" /></div>
                  <div><div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">{acc.name}</div><div className="text-[10.5px] font-mono text-slate-500">{acc.email}</div></div>
                </div>
                <div className="flex flex-col items-end"><ArrowRight size={12} className="text-slate-600 group-hover:text-cyan-400" /><span className="text-[8px] text-cyan-500/70 font-mono mt-1">{acc.note}</span></div>
              </button>
            ))}
            <button onClick={() => setIsEnteringCustom(true)} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/20 hover:bg-slate-900/60 border border-slate-800/60 border-dashed text-slate-400 hover:text-cyan-400 text-xs font-bold cursor-pointer"><Plus size={14} /> Use another account</button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div><label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email</label><input type="email" required value={customEmail} onChange={(e) => setCustomEmail(e.target.value)} placeholder="e.g. player@gmail.com" className="w-full h-10 px-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none" /></div>
            <div><label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Display Name</label><input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Silver Blade" className="w-full h-10 px-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none" /></div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setIsEnteringCustom(false)} className="w-1/2 h-10 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="w-1/2 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black text-xs uppercase rounded-xl cursor-pointer">Sign In</button>
            </div>
          </form>
        )}
        <div className="mt-5 pt-3.5 border-t border-slate-900 text-center text-[9px] text-slate-500 uppercase tracking-widest">Google Security Sandbox Verification</div>
      </motion.div>
    </div>
  );
}
