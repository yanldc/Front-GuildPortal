import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User, Sword, Plus, Trash2, Mail, Users, ArrowRight, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
import { Member, CLASSES_RAVEN2, UserRank, UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (user: Member) => void;
  members: Member[];
}

export default function LoginScreen({ onLogin, members }: LoginScreenProps) {
  // Authentication states
  const [authenticatedGoogleUser, setAuthenticatedGoogleUser] = useState<{
    email: string;
    name: string;
    picture: string;
  } | null>(null);

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [isEnteringCustomEmail, setIsEnteringCustomEmail] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Invite token/code validation states
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeInvite, setActiveInvite] = useState<any | null>(() => {
    // Check URL parameters for invite code on load
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('invite');
      if (code) {
        const savedPending = localStorage.getItem('raven2_pending_invites');
        const pendingList = savedPending ? JSON.parse(savedPending) : [];
        const found = pendingList.find((i: any) => i.code.toUpperCase() === code.toUpperCase());
        return found || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  // Register Form Fields (displayed ONLY after Google Auth is successful for a brand-new user)
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASSES_RAVEN2[0]);
  const [altNames, setAltNames] = useState<string[]>([]);
  const [newAltName, setNewAltName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Simulated list of available Google Accounts on this browser/session
  const GOOGLE_ACCOUNTS_PRESET = [
    {
      email: 'yanlemkedecastro@gmail.com',
      name: 'Yan Lemke de Castro',
      picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yan',
      note: 'Primary Developer Account (Rank: Leader)'
    },
    {
      email: 'shadowvixen@guild.com',
      name: 'Shadow Vixen CSO',
      picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow',
      note: 'Pre-registered Account (Rank: Elite)'
    },
    {
      email: 'bloodrage@guild.com',
      name: 'Blood Rage Officer',
      picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Blood',
      note: 'Pre-registered Account (Rank: Officer)'
    }
  ];

  const handleSelectGoogleAccount = (acc: { email: string; name: string; picture: string }) => {
    setIsLoadingAuth(true);
    setShowAccountSelector(false);
    setFormError(null);

    // Simulate standard Google Token exchange delay
    setTimeout(() => {
      setAuthenticatedGoogleUser(acc);
      setIsLoadingAuth(false);

      // Immediately check if this email already exists in the roster!
      const existingMember = members.find(
        (m) => m.email && m.email.toLowerCase() === acc.email.toLowerCase()
      );

      if (existingMember) {
        // Already registered! Log in immediately with their existing points/altNames/roles intact!
        onLogin(existingMember);
      } else {
        // Not on the active roster. Check if they have been pre-registered in pending invites by email
        try {
          const savedPending = localStorage.getItem('raven2_pending_invites');
          const pendingList = savedPending ? JSON.parse(savedPending) : [];
          const foundByEmail = pendingList.find(
            (i: any) => i.email && i.email.toLowerCase() === acc.email.toLowerCase()
          );

          if (foundByEmail) {
            setActiveInvite(foundByEmail);
            setName(foundByEmail.name);
            setSelectedClass(foundByEmail.class);
          } else if (activeInvite) {
            // Already matched via URL token previously - prefill name and class
            setName(activeInvite.name);
            setSelectedClass(activeInvite.class);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }, 1200);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;

    const emailTrimed = customGoogleEmail.trim();
    const nameTrimed = customGoogleName.trim() || emailTrimed.split('@')[0];

    handleSelectGoogleAccount({
      email: emailTrimed,
      name: nameTrimed,
      picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(nameTrimed)}`
    });
    setIsEnteringCustomEmail(false);
    setCustomGoogleEmail('');
    setCustomGoogleName('');
  };

  const handleAddAltName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAlt = newAltName.trim();
    if (!cleanAlt) return;

    if (altNames.some(alt => alt.toLowerCase() === cleanAlt.toLowerCase())) {
      setFormError('This Alt Name has already been added.');
      return;
    }

    if (cleanAlt.toLowerCase() === name.trim().toLowerCase()) {
      setFormError('Alt Character Name cannot be identical to your main character.');
      return;
    }

    setAltNames([...altNames, cleanAlt]);
    setNewAltName('');
    setFormError(null);
  };

  const handleRemoveAltName = (indexToRemove: number) => {
    setAltNames(altNames.filter((_, idx) => idx !== indexToRemove));
  };

  const handeRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const mainCharName = name.trim();
    if (!mainCharName) {
      setFormError('Main Character Name is required.');
      return;
    }

    // Double check that the chosen character name is not already taken
    const nameExists = members.some(
      (m) => m.name.toLowerCase() === mainCharName.toLowerCase()
    );
    if (nameExists) {
      setFormError('This Character Name is already registered by another guild member.');
      return;
    }

    if (!authenticatedGoogleUser) {
      setFormError('Google Account authentication is missing. Please log in first.');
      return;
    }

    // Must have activeInvite to complete signup (restriction)
    if (!activeInvite) {
      setFormError('Roster enrollment restricted. You require a valid recruitment invite code to sign up.');
      return;
    }

    // Create member using invite's parameters
    const newMember: Member = {
      id: 'custom-' + Date.now(),
      name: mainCharName,
      email: authenticatedGoogleUser.email, // Securely bound directly to the authenticated Google account email
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(mainCharName)}`,
      class: selectedClass,
      level: 60,
      rank: activeInvite.rank || 'Recruit',
      role: activeInvite.role || 'member',
      points: activeInvite.points !== undefined ? activeInvite.points : 150,
      joinedAt: new Date().toISOString(),
      altNames: altNames
    };

    // Consume invite code from list in localStorage
    try {
      const saved = localStorage.getItem('raven2_pending_invites');
      if (saved) {
        const list = JSON.parse(saved);
        const filtered = list.filter((i: any) => i.code.toUpperCase() !== activeInvite.code.toUpperCase());
        localStorage.setItem('raven2_pending_invites', JSON.stringify(filtered));
      }
    } catch (err) {
      console.error('Error consuming invite:', err);
    }

    onLogin(newMember);
  };

  const handleDisconnect = () => {
    setAuthenticatedGoogleUser(null);
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-[#060709] bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-[#0b1619] via-[#08090a] to-[#040506] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Immersive background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative center crest */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none select-none">
        <Shield size={600} className="text-cyan-400" strokeWidth={0.5} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-[#0a0c10]/95 border border-cyan-500/15 p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.06)] backdrop-blur-md relative z-10 text-left"
      >
        {/* Guild Emblem Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#141822] border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-3 animate-pulse">
            <Shield className="text-cyan-400 w-7 h-7 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-sans tracking-wider text-slate-100 uppercase">
            GUILD PORTAL
          </h1>
          <p className="text-cyan-400/80 font-mono text-xs uppercase tracking-[0.25em] font-medium mt-1">
            Raven 2 • tooburnnt
          </p>
        </div>

        {/* LOADING AUTHENTICATION TOKEN STATE */}
        <AnimatePresence mode="wait">
          {isLoadingAuth ? (
            <motion.div
              key="loading-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest text-center animate-pulse">
                Exchanging secure Google Auth Token...
              </p>
            </motion.div>
          ) : !authenticatedGoogleUser ? (
            /* PHASE 1: COMPULSORY GOOGLE LOGIN BUTTON */
            <motion.div
              key="google-login-request"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="bg-[#0e1118] border border-cyan-500/10 p-4.5 rounded-xl text-slate-300 text-xs leading-relaxed space-y-2">
                <p>
                  🛡️ <strong className="text-slate-100">Official Access Rule:</strong> This portal is private to members of the <strong className="text-cyan-400">tooburnnt</strong> clan. All profiles and GP (Guild Points) are securely tied to Google accounts.
                </p>
                <p className="text-slate-400 text-[11px] font-mono">
                  You must authenticate through Google to check if you have an active character, or register a new one.
                </p>
              </div>

              {/* Standard Styled Premium Google Login Button */}
              <button
                type="button"
                onClick={() => setShowAccountSelector(true)}
                id="google-sign-in-btn"
                className="w-full h-13 bg-white hover:bg-zinc-100 text-[#1f1f1f] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] active:scale-[0.99]"
              >
                {/* Embedded SVG Google Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.19-.48-.28-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">
                🔒 Protected by Google Secure Single Sign-On
              </div>
            </motion.div>
          ) : (
            /* PHASE 2: NEW USER COMPILING REGISTRATION FORM LINKED TO THEIR LOGGED GOOGLE ACCOUNT */
            activeInvite ? (
              <motion.form
                key="registration-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handeRegisterSubmit}
                className="space-y-4"
              >
                {/* Linked Google Banner Status */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30">
                      <img
                        src={authenticatedGoogleUser.picture}
                        alt="Google User"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={13} /> Bound to Google
                      </div>
                      <div className="text-slate-400 font-mono text-[10.5px] leading-none mt-0.5">
                        {authenticatedGoogleUser.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 px-2 py-1 rounded bg-slate-950/50 transition-colors focus:outline-none cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="bg-[#10141d] border border-cyan-500/30 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed space-y-1.5 text-left">
                  <span className="inline-flex items-center gap-1.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/20 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold">
                    Invite Token Authorized
                  </span>
                  <p>
                    👋 <strong className="text-cyan-400">Invite Validated:</strong> You have been invited as <strong className="text-slate-100">{activeInvite.name}</strong> to join the ranks of <strong className="text-cyan-300">tooburnnt</strong>!
                  </p>
                  <p className="text-slate-400 text-[11px] font-mono">
                    Verify Alt names below. You will enroll on the roster as a <strong className="text-cyan-400">{activeInvite.rank || 'Recruit'}</strong> with <strong className="text-cyan-400">{activeInvite.points !== undefined ? activeInvite.points : 150} GP</strong>.
                  </p>
                </div>

                {/* Main character Name - locked to invite data */}
                <div>
                  <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Main Character Name (Locked by Invite)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      disabled
                      value={name}
                      className="w-full h-11 pl-10 pr-4 bg-[#050608]/80 border border-slate-900 rounded-xl text-cyan-400 font-bold text-sm cursor-not-allowed select-none focus:outline-none"
                    />
                  </div>
                </div>

                {/* RPG Class Choice - locked on invite data */}
                <div>
                  <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Primary RPG Class (Locked by Invite)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedClass}
                    className="w-full h-11 px-3 bg-[#050608]/80 border border-slate-900 rounded-xl text-slate-350 text-xs cursor-not-allowed select-none focus:outline-none"
                  />
                </div>

                {/* Alt Names (Array input with add button) */}
                <div className="border-t border-slate-900 pt-3.5">
                  <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Alternative Character Names (Alts)</span>
                    <span className="text-slate-500 text-[9.5px] font-normal font-sans">Optional / multiple allowed</span>
                  </label>

                  {/* Inline adder */}
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input
                        type="text"
                        value={newAltName}
                        onChange={(e) => setNewAltName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAltName(e);
                          }
                        }}
                        placeholder="e.g. ShadowBladeAlt"
                        className="w-full h-10 pl-10 pr-4 bg-[#08090d] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAltName}
                      className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-750"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {/* Added Badges Display */}
                  {altNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-slate-950/40 border border-slate-850/60 rounded-xl">
                      {altNames.map((alt, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 bg-cyan-950/30 border border-cyan-800/30 px-2.5 py-1 rounded-lg text-slate-300 text-[10.2px] font-mono"
                        >
                          {alt}
                          <button
                            type="button"
                            onClick={() => handleRemoveAltName(index)}
                            className="text-slate-505 hover:text-red-400 font-bold text-[10px] transition-colors focus:outline-none"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error messages */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[11px] font-mono text-red-400 bg-red-950/10 p-2.5 rounded-lg border border-red-900/30 flex items-start gap-1.5"
                    >
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit handler */}
                <button
                  type="submit"
                  id="submit-register-character"
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-[0.985]"
                >
                  <Sword size={15} /> Complete Registration & Play
                </button>
              </motion.form>
            ) : (
              /* RESTRICTED ACCESS SCREEN (NO ENTRY INVITE LINK / TOKEN FOUND) */
              <motion.div
                key="restricted-gate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                {/* Linked Google Banner Status */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30">
                      <img
                        src={authenticatedGoogleUser.picture}
                        alt="Google User"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={13} /> Bound to Google
                      </div>
                      <div className="text-slate-400 font-mono text-[10.5px] leading-none mt-0.5">
                        {authenticatedGoogleUser.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 px-2 py-1 rounded bg-slate-950/50 transition-colors focus:outline-none cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="bg-red-950/15 border border-red-500/20 rounded-xl p-4 text-xs text-slate-350 leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 text-red-405 font-mono font-bold uppercase text-[10px]">
                    <AlertCircle size={14} className="text-red-400" /> Enrollment Restricted
                  </div>
                  <p>
                    This private Google account (<span className="text-cyan-400 font-mono">{authenticatedGoogleUser.email}</span>) is not yet registered on the active <strong className="text-cyan-300">tooburnnt</strong> guild roster list.
                  </p>
                  <p className="text-slate-400 text-[11.5px] font-sans">
                    Self-service registration without official command authorization is disabled on this platform.
                  </p>
                </div>

                <div className="bg-[#0b0d12] border border-slate-850 p-4 rounded-xl space-y-3">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">
                    Do you have a Recruit Invite Token?
                  </span>
                  <p className="text-slate-450 text-[11px] leading-relaxed">
                    Paste the single-use invite hash or click the referral link provided by a Guild Command Officer (Admin) to authorize:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteCodeInput}
                      onChange={(e) => {
                        setInviteCodeInput(e.target.value);
                        setInviteFeedback(null);
                      }}
                      placeholder="e.g. ABCDFGH"
                      className="flex-1 h-10 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-200 font-mono text-xs focus:outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const codeTrim = inviteCodeInput.trim().toUpperCase();
                        if (!codeTrim) return;

                        try {
                          const savedPending = localStorage.getItem('raven2_pending_invites');
                          const pendingList = savedPending ? JSON.parse(savedPending) : [];
                          const found = pendingList.find((i: any) => i.code.toUpperCase() === codeTrim);

                          if (found) {
                            setActiveInvite(found);
                            setName(found.name);
                            setSelectedClass(found.class);
                            setInviteFeedback({ type: 'success', message: 'Invite code verified successfully! Now completing character profile binding.' });
                          } else {
                            setInviteFeedback({ type: 'error', message: 'Invalid token reference. Copy/paste carefully or request another link from a Guild Officer.' });
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="h-10 px-4 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer border border-cyan-400/20 shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center justify-center shrink-0"
                    >
                      Verify Code
                    </button>
                  </div>

                  {inviteFeedback && (
                    <div className={`text-[10px] font-mono p-2 rounded-lg border leading-tight ${
                      inviteFeedback.type === 'success' 
                        ? 'text-emerald-400 bg-emerald-950/10 border-emerald-900/30' 
                        : 'text-red-400 bg-red-950/10 border-red-900/30'
                    }`}>
                      {inviteFeedback.message}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* GOOGLE ACCOUNTS SIMULATED SELECTOR POPUP/MODAL */}
        <AnimatePresence>
          {showAccountSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0d0f14] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountSelector(false);
                    setIsEnteringCustomEmail(false);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm font-mono focus:outline-none cursor-pointer"
                >
                  ✕
                </button>

                <div className="text-center mb-5 pb-4 border-b border-slate-900">
                  {/* Google Icon logo */}
                  <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.13-.19-.48-.28-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Sign in with Google
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select an account to access tooburnnt guild portal
                  </p>
                </div>

                {!isEnteringCustomEmail ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {GOOGLE_ACCOUNTS_PRESET.map((acc, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectGoogleAccount(acc)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-[#141822] border border-slate-850 hover:border-cyan-500/30 transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-800 group-hover:border-cyan-505">
                            <img src={acc.picture} alt={acc.name} referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                              {acc.name}
                            </div>
                            <div className="text-[10.5px] font-mono text-slate-500">
                              {acc.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <ArrowRight size={12} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                          <span className="text-[8px] text-cyan-500/70 font-mono mt-1 pr-1">{acc.note}</span>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => setIsEnteringCustomEmail(true)}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/20 hover:bg-slate-900/60 border border-slate-800/60 border-dashed hover:border-cyan-500/20 text-slate-400 hover:text-cyan-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus size={14} /> Use another account
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                        Google Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="e.g. shadowhunter@gmail.com"
                        className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                        Google Display Name
                      </label>
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="e.g. Silver Blade"
                        className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEnteringCustomEmail(false)}
                        className="w-1/2 h-10 bg-slate-900 border border-slate-800 hover:bg-slate-820 rounded-xl text-slate-400 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-5 pt-3.5 border-t border-slate-900 text-center text-[9px] text-slate-500 uppercase tracking-widest">
                  Google Security Sandbox Verification
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-slate-900 pt-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles size={11} className="text-cyan-400/50 animate-pulse" /> Official tooburnnt Server S-1
          </p>
        </div>
      </motion.div>
    </div>
  );
}
