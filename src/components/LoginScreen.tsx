import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User, Sword, Plus, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Member, CLASSES_RAVEN2 } from '../types';
import { invitesService } from '../services/invites';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

interface LoginScreenProps {
  onLogin: (user: Member) => Promise<void>;
  members: Member[];
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginScreen({ onLogin, members }: LoginScreenProps) {
  const [authenticatedGoogleUser, setAuthenticatedGoogleUser] = useState<{
    email: string;
    name: string;
    picture: string;
  } | null>(null);

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Store the google credential for registration
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeInvite, setActiveInvite] = useState<any | null>(null);

  // Register form
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASSES_RAVEN2[0]);
  const [altNames, setAltNames] = useState<string[]>([]);
  const [newAltName, setNewAltName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Check URL for invite code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('invite');
    if (code) {
      invitesService.verifyCode(code)
        .then((invite) => setActiveInvite(invite))
        .catch(() => {});
    }
  }, []);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 400,
        text: 'signin_with',
        shape: 'pill',
      });
    }
  }, []);

  // Handle Google credential response (real Google Sign-In)
  const handleGoogleCredentialResponse = (response: { credential: string }) => {
    setIsLoadingAuth(true);
    setLoginError(null);
    setGoogleCredential(response.credential);

    // Send the real Google ID token to the backend
    onLogin({ id: '', name: '', email: '', avatar: '', class: '', level: 0, rank: 'Recruit', role: 'member', points: 0, joinedAt: '', _googleToken: response.credential } as any)
      .then(() => {})
      .catch(() => {
        // Decode JWT to get user info for registration form
        try {
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          setAuthenticatedGoogleUser({
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
          });
          if (activeInvite) {
            setName(activeInvite.name);
            setSelectedClass(activeInvite.class);
          }
        } catch {
          setLoginError('Failed to process Google authentication.');
        }
      })
      .finally(() => setIsLoadingAuth(false));
  };

  // Fallback: email login for dev mode
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim();
    if (!email) return;

    setIsLoadingAuth(true);
    setLoginError(null);

    const emailName = email.split('@')[0];
    const picture = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(emailName)}`;

    onLogin({ id: '', name: emailName, email, avatar: picture, class: '', level: 0, rank: 'Recruit', role: 'member', points: 0, joinedAt: '' } as Member)
      .then(() => {})
      .catch(() => {
        setAuthenticatedGoogleUser({ email, name: emailName, picture });
        if (activeInvite) {
          setName(activeInvite.name);
          setSelectedClass(activeInvite.class);
        }
      })
      .finally(() => setIsLoadingAuth(false));
  };

  const handleAddAltName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAlt = newAltName.trim();
    if (!cleanAlt) return;
    if (altNames.some(alt => alt.toLowerCase() === cleanAlt.toLowerCase())) { setFormError('This Alt Name has already been added.'); return; }
    if (cleanAlt.toLowerCase() === name.trim().toLowerCase()) { setFormError('Alt Character Name cannot be identical to your main character.'); return; }
    setAltNames([...altNames, cleanAlt]);
    setNewAltName('');
    setFormError(null);
  };

  const handleRemoveAltName = (idx: number) => setAltNames(altNames.filter((_, i) => i !== idx));

  const handeRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const mainCharName = name.trim();
    if (!mainCharName) { setFormError('Main Character Name is required.'); return; }
    if (members.some(m => m.name.toLowerCase() === mainCharName.toLowerCase())) { setFormError('This Character Name is already registered.'); return; }
    if (!authenticatedGoogleUser) { setFormError('Google Account authentication is missing.'); return; }
    if (!activeInvite) { setFormError('Roster enrollment restricted. You require a valid invite code.'); return; }

    onLogin({
      id: '', name: mainCharName, email: authenticatedGoogleUser.email,
      avatar: '', class: selectedClass, level: 60,
      rank: activeInvite.rank || 'Recruit', role: 'member',
      points: 0,
      joinedAt: new Date().toISOString(), altNames,
      _googleToken: googleCredential,
      _inviteCode: activeInvite.code,
    } as any);
  };

  const handleDisconnect = () => { setAuthenticatedGoogleUser(null); setFormError(null); };

  return (
    <div className="min-h-screen bg-[#060709] bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-[#0b1619] via-[#08090a] to-[#040506] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none select-none">
        <Shield size={600} className="text-cyan-400" strokeWidth={0.5} />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-lg bg-[#0a0c10]/95 border border-cyan-500/15 p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.06)] backdrop-blur-md relative z-10 text-left">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#141822] border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-3 animate-pulse">
            <Shield className="text-cyan-400 w-7 h-7 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-sans tracking-wider text-slate-100 uppercase">GUILD PORTAL</h1>
          <p className="text-cyan-400/80 font-mono text-xs uppercase tracking-[0.25em] font-medium mt-1">Raven 2 • void/tooburnt</p>
        </div>

        <AnimatePresence mode="wait">
          {isLoadingAuth ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest text-center animate-pulse">Authenticating...</p>
            </motion.div>
          ) : !authenticatedGoogleUser ? (
            /* LOGIN PHASE */
            <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <div className="bg-[#0e1118] border border-cyan-500/10 p-4.5 rounded-xl text-slate-300 text-xs leading-relaxed space-y-2">
                <p>🛡️ <strong className="text-slate-100">Official Access Rule:</strong> This portal is private to members of the <strong className="text-cyan-400">void/tooburnt</strong> clan.</p>
                <p className="text-slate-400 text-[11px] font-mono">Authenticate through Google to access your character.</p>
              </div>

              {/* Google Sign-In Button (real) */}
              {GOOGLE_CLIENT_ID ? (
                <div>
                  <div ref={googleBtnRef} className="flex justify-center" />
                </div>
              ) : (
                /* Fallback: email input for dev mode */
                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Google Email (Dev Mode)</label>
                    <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your-email@gmail.com" className="w-full h-11 px-4 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-sm focus:outline-none" />
                  </div>
                  <button type="submit" disabled={isLoadingAuth} className="w-full h-13 bg-white hover:bg-zinc-100 text-[#1f1f1f] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.19-.48-.28-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
                    Sign in with Google (Dev)
                  </button>
                </form>
              )}

              {loginError && (
                <div className="text-[11px] font-mono text-red-400 bg-red-950/10 p-2.5 rounded-lg border border-red-900/30 flex items-center gap-1.5">
                  <AlertCircle size={13} /> {loginError}
                </div>
              )}

              <div className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">🔒 Protected by Google Secure Single Sign-On</div>
            </motion.div>
          ) : activeInvite ? (
            /* REGISTRATION FORM */
            <motion.form key="register" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handeRegisterSubmit} className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30">
                    <img src={authenticatedGoogleUser.picture} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1 text-emerald-400"><CheckCircle2 size={13} /> Bound to Google</div>
                    <div className="text-slate-400 font-mono text-[10.5px] leading-none mt-0.5">{authenticatedGoogleUser.email}</div>
                  </div>
                </div>
                <button type="button" onClick={handleDisconnect} className="text-[10px] uppercase font-mono text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 px-2 py-1 rounded bg-slate-950/50 cursor-pointer">Disconnect</button>
              </div>

              <div className="bg-[#10141d] border border-cyan-500/30 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed space-y-1.5">
                <span className="inline-flex items-center gap-1.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/20 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">Invite Token Authorized</span>
                <p>👋 <strong className="text-cyan-400">Invite Validated:</strong> You have been invited as <strong className="text-slate-100">{activeInvite.name}</strong> to join <strong className="text-cyan-300">void/tooburnt</strong>!</p>
                <p className="text-slate-400 text-[11px] font-mono">Rank: <strong className="text-cyan-400">{activeInvite.rank || 'Recruit'}</strong></p>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">Main Character Name (Locked)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input type="text" disabled value={name} className="w-full h-11 pl-10 pr-4 bg-[#050608]/80 border border-slate-900 rounded-xl text-cyan-400 font-bold text-sm cursor-not-allowed focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">Primary RPG Class (Locked)</label>
                <input type="text" disabled value={selectedClass} className="w-full h-11 px-3 bg-[#050608]/80 border border-slate-900 rounded-xl text-slate-350 text-xs cursor-not-allowed focus:outline-none" />
              </div>

              <div className="border-t border-slate-900 pt-3.5">
                <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Alt Character Names</span><span className="text-slate-500 text-[9.5px] font-normal">Optional</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input type="text" value={newAltName} onChange={(e) => setNewAltName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAltName(e); } }} placeholder="e.g. ShadowBladeAlt" className="w-full h-10 pl-10 pr-4 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none" />
                  </div>
                  <button type="button" onClick={handleAddAltName} className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase rounded-xl cursor-pointer flex items-center gap-1.5 border border-slate-750"><Plus size={14} /> Add</button>
                </div>
                {altNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-slate-950/40 border border-slate-850/60 rounded-xl">
                    {altNames.map((alt, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 bg-cyan-950/30 border border-cyan-800/30 px-2.5 py-1 rounded-lg text-slate-300 text-[10.2px] font-mono">
                        {alt}<button type="button" onClick={() => handleRemoveAltName(index)} className="text-slate-505 hover:text-red-400 font-bold text-[10px]">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {formError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] font-mono text-red-400 bg-red-950/10 p-2.5 rounded-lg border border-red-900/30 flex items-start gap-1.5">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" /><span>{formError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 mt-4 active:scale-[0.985]">
                <Sword size={15} /> Complete Registration & Play
              </button>
            </motion.form>
          ) : (
            /* RESTRICTED - NO INVITE */
            <motion.div key="restricted" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 text-left">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30">
                    <img src={authenticatedGoogleUser.picture} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1 text-emerald-400"><CheckCircle2 size={13} /> Bound to Google</div>
                    <div className="text-slate-400 font-mono text-[10.5px] leading-none mt-0.5">{authenticatedGoogleUser.email}</div>
                  </div>
                </div>
                <button type="button" onClick={handleDisconnect} className="text-[10px] uppercase font-mono text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 px-2 py-1 rounded bg-slate-950/50 cursor-pointer">Disconnect</button>
              </div>

              <div className="bg-red-950/15 border border-red-500/20 rounded-xl p-4 text-xs text-slate-350 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-red-405 font-mono font-bold uppercase text-[10px]"><AlertCircle size={14} className="text-red-400" /> Enrollment Restricted</div>
                <p>This Google account (<span className="text-cyan-400 font-mono">{authenticatedGoogleUser.email}</span>) is not registered on the <strong className="text-cyan-300">void/tooburnt</strong> roster.</p>
                <p className="text-slate-400 text-[11.5px]">You need a valid invite code from a Guild Officer.</p>
              </div>

              <div className="bg-[#0b0d12] border border-slate-850 p-4 rounded-xl space-y-3">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">Have an Invite Token?</span>
                <div className="flex gap-2">
                  <input type="text" value={inviteCodeInput} onChange={(e) => { setInviteCodeInput(e.target.value); setInviteFeedback(null); }} placeholder="Paste invite code" className="flex-1 h-10 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-200 font-mono text-xs focus:outline-none" />
                  <button type="button" onClick={async () => {
                    const codeTrim = inviteCodeInput.trim();
                    if (!codeTrim) return;
                    try {
                      const found = await invitesService.verifyCode(codeTrim);
                      setActiveInvite(found); setName(found.name); setSelectedClass(found.class);
                      setInviteFeedback({ type: 'success', message: 'Invite verified! Complete registration below.' });
                    } catch { setInviteFeedback({ type: 'error', message: 'Invalid code.' }); }
                  }} className="h-10 px-4 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-black text-xs uppercase rounded-xl cursor-pointer shrink-0">Verify</button>
                </div>
                {inviteFeedback && (
                  <div className={`text-[10px] font-mono p-2 rounded-lg border ${inviteFeedback.type === 'success' ? 'text-emerald-400 bg-emerald-950/10 border-emerald-900/30' : 'text-red-400 bg-red-950/10 border-red-900/30'}`}>{inviteFeedback.message}</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center border-t border-slate-900 pt-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles size={11} className="text-cyan-400/50 animate-pulse" /> Official void/tooburnt Server S-1
          </p>
        </div>
      </motion.div>
    </div>
  );
}
