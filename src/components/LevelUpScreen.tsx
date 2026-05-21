import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Clock, 
  User, 
  Shield, 
  Trash2, 
  CheckCircle, 
  Sword, 
  UserPlus, 
  X, 
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  Users,
  Grid,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { Member, LevelUpRequest, LevelUpHelper, LevelUpEnroll, CLASSES_RAVEN2 } from '../types';

interface LevelUpScreenProps {
  currentUser: Member;
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const SELECTABLE_HOURS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

const convertEstToBrt = (timeStr: string): string => {
  if (!timeStr) return '';
  const cleanStr = timeStr.trim();
  
  // Handled for range: '20:00 - 23:00' or '20:00 - 23:00 EST'
  const rangeMatch = cleanStr.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})(?:\s+EST)?\s*$/i);
  if (rangeMatch) {
    const startH = parseInt(rangeMatch[1], 10);
    const startM = rangeMatch[2];
    const endH = parseInt(rangeMatch[3], 10);
    const endM = rangeMatch[4];
    
    // EST to BRT/Brasília time is +1 hour difference
    const startBrtH = (startH + 1) % 24;
    const endBrtH = (endH + 1) % 24;
    
    const fmtStartBrtH = startBrtH.toString().padStart(2, '0');
    const fmtEndBrtH = endBrtH.toString().padStart(2, '0');
    
    return `${fmtStartBrtH}:${startM} - ${fmtEndBrtH}:${endM} BRT`;
  }

  // Handle single time, e.g., '20:00' or '20:00 EST'
  const match = cleanStr.replace(/\s*EST/gi, '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return timeStr;
  }
  const hours = parseInt(match[1], 10);
  const minutes = match[2];
  
  // EST to BRT is +1 hour difference
  const brtHours = (hours + 1) % 24;
  const formattedHours = brtHours.toString().padStart(2, '0');
  return `${formattedHours}:${minutes} BRT`;
};

export default function LevelUpScreen({ currentUser }: LevelUpScreenProps) {
  // Day Tab state - default to 'all' or current day of the week
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const localDayName = daysMap[new Date().getDay()];
  const [selectedDayTab, setSelectedDayTab] = useState<string>('all');

  // -- Setup Requests State --
  const [requests, setRequests] = useState<LevelUpRequest[]>(() => {
    try {
      const saved = localStorage.getItem('raven2_levelup_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    // Default pre-populated list so it doesn't render completely empty
    const defaultRequests: LevelUpRequest[] = [
      {
        id: 'req1',
        title: 'Need Tank and Heal for World Rift Floor 5',
        time: '21:30 BRT',
        weekday: 'Wednesday',
        createdBy: 'm4',
        createdByName: 'ChronoMage',
        class: 'Elementalist',
        slots: [
          {
            joinedById: 'm5',
            joinedByName: 'HolyShield',
            characterName: 'HolyShield',
            isAlt: false
          },
          {
            joinedById: 'm5',
            joinedByName: 'HolyShield',
            characterName: 'AltDivine_Shield',
            isAlt: true
          }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: 'req2',
        title: 'Elite Guild Dungeon T3 Quest Team',
        time: '19:00 BRT',
        weekday: 'Every day',
        createdBy: 'm3',
        createdByName: 'ShadowVixen',
        class: 'Assassin',
        slots: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'req3',
        title: 'Vanguard Training Boss Run',
        time: '15:00 BRT',
        weekday: 'Saturday',
        createdBy: 'm2',
        createdByName: 'BloodRage',
        class: 'Berserker',
        slots: [
          {
            joinedById: 'm1',
            joinedByName: 'Yan Lemke',
            characterName: 'Yan Lemke',
            isAlt: false
          }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      }
    ];
    localStorage.setItem('raven2_levelup_requests', JSON.stringify(defaultRequests));
    return defaultRequests;
  });

  // -- Setup Helpers State --
  const [helpers, setHelpers] = useState<LevelUpHelper[]>(() => {
    try {
      const saved = localStorage.getItem('raven2_levelup_helpers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    // Default pre-populated list
    const defaultHelpers: LevelUpHelper[] = [
      {
        id: 'help1',
        memberId: 'm1',
        memberOriginalName: 'Yan Lemke',
        characterName: 'Yan Lemke (Main)',
        class: 'Vanguard',
        isAlt: false,
        availability: 'After 20:00 BRT',
        weekday: 'Every day',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'help2',
        memberId: 'm2',
        memberOriginalName: 'BloodRage',
        characterName: 'BloodBerserkerAlt (Alt)',
        class: 'Berserker',
        isAlt: true,
        availability: 'All day long',
        weekday: 'Saturday',
        createdAt: new Date(Date.now() - 1005 * 60 * 60).toISOString()
      },
      {
        id: 'help3',
        memberId: 'm3',
        memberOriginalName: 'ShadowVixen',
        characterName: 'ShadowAlt_Healer (Alt)',
        class: 'Divine Cleric',
        isAlt: true,
        availability: '18:00 - 22:00 BRT',
        weekday: 'Wednesday',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      }
    ];
    localStorage.setItem('raven2_levelup_helpers', JSON.stringify(defaultHelpers));
    return defaultHelpers;
  });

  // Form states - Request Help
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqTime, setReqTime] = useState('20:00');
  const [reqWeekday, setReqWeekday] = useState('Every day');
  const [selectedReqChar, setSelectedReqChar] = useState('main'); // 'main', 'alt-existing:[name]', 'alt-custom'
  const [customReqAltName, setCustomReqAltName] = useState('');
  const [selectedReqClass, setSelectedReqClass] = useState(currentUser.class || CLASSES_RAVEN2[0]);

  // Form states - Register Helper
  const [showHelperForm, setShowHelperForm] = useState(false);
  const [selectedHelperChar, setSelectedHelperChar] = useState('main'); // 'main', 'alt-existing:[name]', 'alt-custom'
  const [customHelperAltName, setCustomHelperAltName] = useState('');
  const [selectedHelperClass, setSelectedHelperClass] = useState(CLASSES_RAVEN2[0]);
  const [helperStartHour, setHelperStartHour] = useState('20:00');
  const [helperEndHour, setHelperEndHour] = useState('23:00');
  const [helperWeekday, setHelperWeekday] = useState('Every day');

  // Slot Join Modal states
  const [joiningReqId, setJoiningReqId] = useState<string | null>(null);
  const [joinCharSelection, setJoinCharSelection] = useState('main'); // 'main', 'alt-existing:[name]', 'alt-custom'
  const [customJoinAltName, setCustomJoinAltName] = useState('');

  // LocalStorage synchronous actions
  const saveRequests = (newList: LevelUpRequest[]) => {
    setRequests(newList);
    localStorage.setItem('raven2_levelup_requests', JSON.stringify(newList));
  };

  const saveHelpers = (newList: LevelUpHelper[]) => {
    setHelpers(newList);
    localStorage.setItem('raven2_levelup_helpers', JSON.stringify(newList));
  };

  // Toggles for forms that auto-default to the currently selected filter day
  const handleToggleRequestForm = () => {
    const nextShow = !showRequestForm;
    setShowRequestForm(nextShow);
    if (nextShow) {
      setReqWeekday(selectedDayTab === 'all' ? 'Every day' : selectedDayTab);
    }
  };

  const handleToggleHelperForm = () => {
    const nextShow = !showHelperForm;
    setShowHelperForm(nextShow);
    if (nextShow) {
      setHelperWeekday(selectedDayTab === 'all' ? 'Every day' : selectedDayTab);
    }
  };

  // Create Help Request Card submit
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqTime.trim()) return;

    const targetDay = reqWeekday;

    let requesterName = currentUser.name;
    let requesterClass = currentUser.class || CLASSES_RAVEN2[0];

    if (selectedReqChar === 'main') {
      requesterName = currentUser.name;
      requesterClass = currentUser.class || CLASSES_RAVEN2[0];
    } else if (selectedReqChar.startsWith('alt-existing:')) {
      requesterName = selectedReqChar.replace('alt-existing:', '');
      requesterClass = selectedReqClass;
    } else {
      if (!customReqAltName.trim()) return;
      requesterName = customReqAltName.trim();
      requesterClass = selectedReqClass;
    }

    const newReq: LevelUpRequest = {
      id: 'req-' + Date.now(),
      title: reqTitle.trim(),
      time: reqTime.trim(),
      weekday: targetDay,
      createdBy: currentUser.id,
      createdByName: requesterName,
      class: requesterClass,
      slots: [],
      createdAt: new Date().toISOString()
    };

    saveRequests([...requests, newReq]);
    setReqTitle('');
    setReqTime('20:00');
    setReqWeekday('Every day');
    setSelectedReqChar('main');
    setCustomReqAltName('');
    setSelectedReqClass(currentUser.class || CLASSES_RAVEN2[0]);
    setShowRequestForm(false);

    // Automatically focus the active weekend tab on the selected day
    setSelectedDayTab(targetDay);
  };

  // Delete Help Request Card
  const handleDeleteRequest = (reqId: string) => {
    const updated = requests.filter((r) => r.id !== reqId);
    saveRequests(updated);
  };

  // Join a request slot
  const handleOpenJoinModal = (reqId: string) => {
    setJoiningReqId(reqId);
    setCustomJoinAltName('');
    setJoinCharSelection('main');
  };

  const handleConfirmJoin = () => {
    if (!joiningReqId) return;

    let characterName = currentUser.name;
    let isAlt = false;

    if (joinCharSelection === 'main') {
      characterName = currentUser.name;
      isAlt = false;
    } else if (joinCharSelection.startsWith('alt-existing:')) {
      characterName = joinCharSelection.replace('alt-existing:', '');
      isAlt = true;
    } else {
      if (!customJoinAltName.trim()) return;
      characterName = customJoinAltName.trim();
      isAlt = true;
    }

    const updated = requests.map((req) => {
      if (req.id === joiningReqId) {
        if (req.slots.length >= 4) return req;

        const newEnroll: LevelUpEnroll = {
          joinedById: currentUser.id,
          joinedByName: currentUser.name,
          characterName,
          isAlt
        };

        return {
          ...req,
          slots: [...req.slots, newEnroll]
        };
      }
      return req;
    });

    saveRequests(updated);
    setJoiningReqId(null);
  };

  // Cancel/leave a slot
  const handleLeaveSlot = (reqId: string, charName: string) => {
    const updated = requests.map((req) => {
      if (req.id === reqId) {
        return {
          ...req,
          slots: req.slots.filter((slot) => slot.characterName !== charName)
        };
      }
      return req;
    });
    saveRequests(updated);
  };

  // Register Helper submit
  const handleRegisterHelper = (e: React.FormEvent) => {
    e.preventDefault();

    let characterName = currentUser.name;
    let isAlt = false;

    if (selectedHelperChar === 'main') {
      characterName = currentUser.name + " (Main)";
      isAlt = false;
    } else if (selectedHelperChar.startsWith('alt-existing:')) {
      characterName = selectedHelperChar.replace('alt-existing:', '') + " (Alt)";
      isAlt = true;
    } else {
      if (!customHelperAltName.trim()) return;
      characterName = customHelperAltName.trim() + " (Alt)";
      isAlt = true;
    }

    const targetDay = helperWeekday;

    const newHelper: LevelUpHelper = {
      id: 'help-' + Date.now(),
      memberId: currentUser.id,
      memberOriginalName: currentUser.name,
      characterName,
      class: selectedHelperClass,
      isAlt,
      availability: `${helperStartHour} - ${helperEndHour}`,
      weekday: targetDay,
      createdAt: new Date().toISOString()
    };

    saveHelpers([...helpers, newHelper]);
    setHelperStartHour('20:00');
    setHelperEndHour('23:00');
    setCustomHelperAltName('');
    setHelperWeekday('Every day');
    setShowHelperForm(false);
    setSelectedHelperChar('main');

    // Automatically focus the active weekend tab on the selected day
    setSelectedDayTab(targetDay);
  };

  // Remove helper listing
  const handleRemoveHelper = (helpId: string) => {
    const updated = helpers.filter((h) => h.id !== helpId);
    saveHelpers(updated);
  };

  // Match list by selected weekday tab
  const getFilteredRequests = () => {
    if (selectedDayTab === 'all') return requests;
    return requests.filter((r) => r.weekday === selectedDayTab || r.weekday === 'Every day');
  };

  const getFilteredHelpers = () => {
    if (selectedDayTab === 'all') return helpers;
    return helpers.filter((h) => h.weekday === selectedDayTab || h.weekday === 'Every day');
  };

  // Filter lists
  const currentRequests = getFilteredRequests();
  const currentHelpers = getFilteredHelpers();

  const userAlts = currentUser.altNames || [];

  return (
    <div className="space-y-6 text-left">
      
      {/* Intro Banner */}
      <div className="bg-[#0a0c10] border border-cyan-500/15 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              Power Leveling Hub
            </span>
            <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
              <Sparkles size={11.5} /> Active Cooperation
            </span>
          </div>
          <h2 className="text-2xl font-black font-sans text-slate-100 tracking-tight uppercase flex items-center gap-2">
            Lv UP <span className="text-cyan-400 tracking-normal text-xs font-normal lowercase bg-cyan-950/40 border border-cyan-800/20 px-2 py-0.5 rounded font-sans">scheduling matches</span>
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Specify which days of the week you need assistance or are available to boost! Filter by any day of the week below to see matched assistance requests and available high-level reserves.
          </p>
        </div>

        <button
          onClick={handleToggleRequestForm}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-1.5 shrink-0"
        >
          {showRequestForm ? 'Cancel Form' : 'Request Help +'}
        </button>
      </div>

      {/* Form: Requisição de Ajuda */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateRequest} className="bg-[#0c0e14] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350">
                  Create Help Request (Matchmaking)
                </h3>
                <span className="text-[10px] text-slate-500 uppercase font-mono">Step 1 of 2</span>
              </div>              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Day of the Week <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={reqWeekday}
                    onChange={(e) => setReqWeekday(e.target.value)}
                    className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/45 rounded-xl text-slate-100 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Every day">Every day (Flexible)</option>
                    {WEEKDAYS.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-500 mt-1.5 font-mono">
                    ℹ️ O painel ativará a aba do dia selecionado automaticamente.
                  </p>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Title / Objective of Request <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    placeholder="e.g., Main Quest Boss 52 or Elite Dungeon T2"
                    className="w-full h-11 px-4 bg-[#050608] border border-slate-800 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Required Schedule / Specific Time <span className="text-cyan-405">*</span>
                  </label>
                  <select
                    value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)}
                    className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-200 text-xs focus:outline-none cursor-pointer font-mono"
                  >
                    {SELECTABLE_HOURS.map((hr) => (
                      <option key={hr} value={hr}>{hr} EST</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-emerald-400 mt-1.5 font-mono">
                    🇧🇷 {convertEstToBrt(reqTime)}
                  </p>
                </div>

                {/* Character selection */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Choose Requester Character <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={selectedReqChar}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedReqChar(val);
                      if (val === 'main') {
                        setSelectedReqClass(currentUser.class || CLASSES_RAVEN2[0]);
                      }
                    }}
                    className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="main">{currentUser.name} (Main Char)</option>
                    {userAlts.map((alt) => (
                      <option key={alt} value={`alt-existing:${alt}`}>
                        {alt} (Alt Account)
                      </option>
                    ))}
                    <option value="custom">-- Enter Another Alt --</option>
                  </select>
                </div>

                {/* Character Class selection */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Requester Class <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={selectedReqClass}
                    onChange={(e) => setSelectedReqClass(e.target.value)}
                    disabled={selectedReqChar === 'main'}
                    className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-200 text-xs focus:outline-none cursor-pointer disabled:opacity-60"
                  >
                    {CLASSES_RAVEN2.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Requester Alt Name input */}
                {selectedReqChar === 'custom' && (
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Enter Alt Character Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={selectedReqChar === 'custom'}
                      value={customReqAltName}
                      onChange={(e) => setCustomReqAltName(e.target.value)}
                      placeholder="e.g., RavenSniperAlt"
                      className="w-full h-11 px-4 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Publish Request
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HORIZONTAL RIBBON FOR DAYS OF THE WEEK FILTER */}
      <div className="bg-[#0a0c10] border border-slate-850/80 p-3 sm:p-4 rounded-2xl space-y-3">
        <label className="block text-[10px] font-mono text-slate-405 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays size={12} className="text-cyan-400" /> Filter Help Hub by Day of the Week
        </label>
        
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 nodrag scrollbar-none">
          {/* All Events filter */}
          <button
            onClick={() => setSelectedDayTab('all')}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap min-w-[80px] ${
              selectedDayTab === 'all'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black border-none'
                : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400 border border-slate-800/80'
            }`}
          >
            🗓️ All Days
          </button>

          {/* Daily filter */}
          <button
            onClick={() => setSelectedDayTab('Every day')}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap relative flex items-center gap-1.5 ${
              selectedDayTab === 'Every day'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-zinc-50 font-black'
                : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400 border border-slate-800/80'
            }`}
          >
            ⭐ Daily / Flexible
            {(() => {
              const reqCount = requests.filter(r => r.weekday === 'Every day').length;
              const helperCount = helpers.filter(h => h.weekday === 'Every day').length;
              const totalCount = reqCount + helperCount;
              return totalCount > 0 ? (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  selectedDayTab === 'Every day' ? 'bg-zinc-900 text-purple-400' : 'bg-slate-800 text-slate-350'
                }`}>
                  {totalCount}
                </span>
              ) : null;
            })()}
          </button>

          {/* Weekday buttons */}
          {WEEKDAYS.map((day) => {
            const isToday = day === localDayName;
            
            // Calculate active level up items for badge count
            const reqCount = requests.filter(r => r.weekday === day).length;
            const helperCount = helpers.filter(h => h.weekday === day).length;
            const totalCount = reqCount + helperCount;

            return (
              <button
                key={day}
                onClick={() => setSelectedDayTab(day)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap relative flex items-center gap-1.5 ${
                  selectedDayTab === day
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black border-none'
                    : isToday 
                    ? 'bg-[#1a2333]/75 border border-cyan-500/25 text-slate-100 hover:bg-[#1a2333]'
                    : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400 border border-slate-800/80'
                }`}
              >
                {day}
                {isToday && (
                  <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-1 rounded font-semibold uppercase leading-none">
                    Today
                  </span>
                )}
                {totalCount > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    selectedDayTab === day ? 'bg-zinc-900 text-cyan-400' : 'bg-slate-800 text-slate-350'
                  }`}>
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: QUEM PEDIU AJUDA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sword className="text-cyan-400" size={16} /> 1. Matchmaking Requests ({currentRequests.length})
          </h3>
          <span className="text-[10.5px] font-mono text-slate-500">
            Selected Day: <strong className="text-cyan-400 uppercase">{selectedDayTab}</strong>
          </span>
        </div>

        {currentRequests.length === 0 ? (
          <div className="bg-[#0a0c10]/40 border border-dashed border-slate-850 p-10 rounded-2xl text-center space-y-2">
            <p className="text-slate-500 font-mono uppercase text-[10.5px]">
              No matching help requests found for this day.
            </p>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Change the day filter or submit a new help schedule using "Request Help +" above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-6 gap-4">
            {currentRequests.map((req) => {
              const isCreator = req.createdBy === currentUser.id;
              const slotsFilled = req.slots.length;
              const isUserAlreadyJoined = req.slots.some((s) => s.joinedById === currentUser.id);

              return (
                <div 
                  key={req.id} 
                  className={`bg-[#0a0c10] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-slate-750 relative ${
                    req.createdBy === currentUser.id ? 'border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.02)]' : 'border-slate-850'
                  }`}
                >
                  {/* Delete button of group request */}
                  {(isCreator || currentUser.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="absolute top-4 right-4 p-1.5 bg-slate-950/80 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete this help card"
                    >
                      <Trash2 size={13.5} />
                    </button>
                  )}

                  {/* Top content */}
                  <div className="space-y-3 text-left">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 pr-8">
                        <span className="text-[11px] text-slate-500 font-mono">Requestor:</span>
                        <strong className="text-slate-300 text-xs font-semibold">{req.createdByName}</strong>
                        <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded leading-none uppercase">
                          {req.class}
                        </span>
                        
                        <span className={`text-[9px] font-mono border px-2 py-0.5 rounded ml-auto ${
                          req.weekday === 'Every day' 
                          ? 'bg-purple-950/20 text-purple-400 border-purple-800/30' 
                          : 'bg-cyan-950/20 text-cyan-400 border-cyan-800/30'
                        }`}>
                          📅 {req.weekday}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 hover:text-cyan-400 transition-colors pr-6">
                        {req.title}
                      </h4>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 bg-[#0f121d] border border-cyan-500/10 rounded-xl px-3.5 py-1.5 text-xs text-cyan-300 font-mono w-fit">
                        <Clock size={13} className="text-cyan-400 shrink-0" />
                        <span>{req.time.includes('EST') || req.time.includes('BRT') ? req.time : `${req.time} EST`}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 pl-1">
                        🇧🇷 {convertEstToBrt(req.time)}
                      </span>
                    </div>

                    {/* Slots Helper Status */}
                    <div className="pt-2.5 border-t border-slate-900 space-y-2">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          Assistant Slots ({slotsFilled}/4)
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          any member or alt can join
                        </span>
                      </div>

                      {/* Explicit Slots Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map((index) => {
                          const slot = req.slots[index];

                          if (slot) {
                            const isMySlotValue = slot.joinedById === currentUser.id;
                            return (
                              <div 
                                key={index} 
                                className="bg-[#10141e] border border-teal-500/20 px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-1.5 text-xs text-slate-300 font-sans"
                              >
                                <div className="truncate flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                  <div className="truncate">
                                    <div className="font-semibold text-slate-100 truncate text-[11.5px] leading-tight">
                                      {slot.characterName}
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-mono truncate leading-none">
                                      {slot.isAlt ? `Alt of ${slot.joinedByName}` : `owner: ${slot.joinedByName}`}
                                    </div>
                                  </div>
                                </div>
                                {isMySlotValue && (
                                  <button
                                    onClick={() => handleLeaveSlot(req.id, slot.characterName)}
                                    className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400 transition-colors focus:outline-none font-mono text-[9px] uppercase font-bold"
                                    title="Leave this slot"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          } else {
                            // Empty slot
                            return (
                              <button
                                key={index}
                                onClick={() => handleOpenJoinModal(req.id)}
                                className="bg-[#050609] border border-dashed border-slate-800 hover:border-cyan-500/25 px-2.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] text-slate-550 hover:text-cyan-405 leading-none transition-all cursor-pointer h-10 select-none"
                              >
                                <UserPlus size={12} className="text-slate-600 animate-pulse" />
                                <span>Open Slot (Click to join)</span>
                              </button>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-550">
                      <Users size={12} />
                      <span>{4 - slotsFilled} slots free</span>
                    </div>

                    {slotsFilled < 4 ? (
                      <button
                        onClick={() => handleOpenJoinModal(req.id)}
                        className={`text-xs font-bold uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                          isUserAlreadyJoined
                            ? 'bg-cyan-950/20 text-cyan-450 border border-cyan-800/35 hover:bg-cyan-950/40'
                            : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800'
                        }`}
                      >
                        <UserPlus size={13} />
                        {isUserAlreadyJoined ? 'Register Alt +' : 'Join Party'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono uppercase bg-emerald-950/20 text-emerald-405 border border-emerald-900/30 px-2.5 py-1 rounded">
                        Party Full ✓
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: DISPONÍVEIS PARA AJUDA */}
      <div className="space-y-6 pt-4">
        
        {/* Available to Help Header Banner */}
        <div className="bg-[#080a11] border border-slate-850 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/70 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <CheckCircle className="text-emerald-405" size={16} /> 2. Available Veterans & Alts ({currentHelpers.length})
              </h3>
              <p className="text-slate-500 text-xs">
                Guild members and auxiliary alt accounts registered to help level up or do hard content on specified schedules.
              </p>
            </div>

            <button
              onClick={handleToggleHelperForm}
              className="bg-slate-800 hover:bg-slate-750 border border-slate-755 text-emerald-400 font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
            >
              {showHelperForm ? 'Close Form' : 'Register Availability +'}
            </button>
          </div>

          {/* Helper Register Form */}
          <AnimatePresence>
            {showHelperForm && (
              <motion.form
                onSubmit={handleRegisterHelper}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-[#0c0f16] border border-slate-800/60 p-4 rounded-xl space-y-4 text-left"
              >
                <div className="flex items-center gap-1 bg-cyan-950/10 border border-cyan-800/10 p-2 rounded-lg text-xs text-cyan-400 font-medium">
                  <Info size={13} className="shrink-0" />
                  <span>Register your main character or one of your alt accounts, specifying the times you are available to play.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Select character */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Choose Character <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={selectedHelperChar}
                      onChange={(e) => setSelectedHelperChar(e.target.value)}
                      className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="main">{currentUser.name} (Main Char)</option>
                      {userAlts.map((alt) => (
                        <option key={alt} value={`alt-existing:${alt}`}>
                          {alt} (Alt Account)
                        </option>
                      ))}
                      <option value="custom">-- Enter Class of Another Alt --</option>
                    </select>
                  </div>

                  {/* Character class */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Assistant Class <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={selectedHelperClass}
                      onChange={(e) => setSelectedHelperClass(e.target.value)}
                      className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer"
                    >
                      {CLASSES_RAVEN2.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Helper Weekday */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Target Weekday <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={helperWeekday}
                      onChange={(e) => setHelperWeekday(e.target.value)}
                      className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Every day">Every day (Flexible)</option>
                      {WEEKDAYS.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-500 mt-1.5 font-mono">
                      ℹ️ O painel ativará a aba do dia selecionado automaticamente.
                    </p>
                  </div>

                  {/* Available times */}
                  <div>
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Availability Range (EST) <span className="text-cyan-400">*</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select
                          value={helperStartHour}
                          onChange={(e) => setHelperStartHour(e.target.value)}
                          className="w-full h-11 px-2.5 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer font-mono"
                        >
                          {SELECTABLE_HOURS.map((hr) => (
                            <option key={hr} value={hr}>{hr} EST</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          value={helperEndHour}
                          onChange={(e) => setHelperEndHour(e.target.value)}
                          className="w-full h-11 px-2.5 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-350 text-xs focus:outline-none cursor-pointer font-mono"
                        >
                          {SELECTABLE_HOURS.map((hr) => (
                            <option key={hr} value={hr}>{hr} EST</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-1.5 font-mono">
                      🇧🇷 {convertEstToBrt(`${helperStartHour} - ${helperEndHour}`)}
                    </p>
                  </div>
                </div>

                {/* If custom helper name is chosen */}
                {selectedHelperChar === 'custom' && (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 max-w-sm">
                    <label className="block text-[10px] font-mono text-slate-405 uppercase tracking-wider mb-1">
                      Enter Alt Character Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required={selectedHelperChar === 'custom'}
                      value={customHelperAltName}
                      onChange={(e) => setCustomHelperAltName(e.target.value)}
                      placeholder="e.g., RavenSniperAlt"
                      className="w-full h-10 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-505 rounded-xl text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900/60">
                  <button
                    type="button"
                    onClick={() => setShowHelperForm(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Confirm Registration
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Grid list of active helpers available */}
          {currentHelpers.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-850 bg-[#06080b]/50 rounded-xl">
              <p className="text-slate-550 font-mono text-[10px] uppercase">No active helpers listed for this day.</p>
              <p className="text-[11px] text-slate-600 mt-1">Change the week day filter above or sign up to help!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentHelpers.map((help) => {
                const isOwner = help.memberId === currentUser.id;
                return (
                  <div 
                    key={help.id} 
                    className={`bg-[#05070c] border p-4 rounded-xl flex flex-col justify-between space-y-3 transition-colors ${
                      help.memberId === currentUser.id ? 'border-emerald-500/20 bg-[#070b12]' : 'border-slate-850'
                    }`}
                  >
                    <div className="text-left space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-slate-200 text-xs font-bold font-sans block truncate max-w-[170px]" title={help.characterName}>
                            {help.characterName}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Class: <span className="text-slate-350">{help.class}</span>
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {help.isAlt ? (
                            <span className="text-[8px] font-mono bg-cyan-950/20 text-cyan-405 border border-cyan-800/10 px-1.5 py-0.5 rounded uppercase leading-none font-bold">
                              ALT Character
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono bg-emerald-950/20 text-emerald-455 border border-emerald-800/10 px-1.5 py-0.5 rounded uppercase leading-none font-bold">
                              MAIN Account
                            </span>
                          )}

                          <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1 py-0.5 rounded leading-none uppercase">
                            📅 {help.weekday}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#0b0e16] p-2.5 rounded-lg border border-slate-850 text-slate-350 text-[11px] leading-relaxed space-y-1">
                        <div className="flex items-center gap-1 text-[9px] text-slate-550 uppercase tracking-wider font-mono">
                          <Clock size={11} className="text-cyan-400 shrink-0" /> Available Hours:
                        </div>
                        <p className="text-slate-200 italic leading-snug">
                          {help.availability.includes('EST') || help.availability.includes('BRT') ? help.availability : `${help.availability} EST`}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500">
                          🇧🇷 {convertEstToBrt(help.availability)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between text-[10px] text-slate-550 font-mono">
                      <span>Offered by: {help.memberOriginalName}</span>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveHelper(help.id)}
                          className="hover:text-red-400 text-[10px] font-bold uppercase hover:bg-red-500/5 px-2 py-0.5 border border-transparent hover:border-red-900/30 rounded transition-all cursor-pointer focus:outline-none"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SLOT SELECTION MODAL (POPUP) */}
      <AnimatePresence>
        {joiningReqId !== null && (() => {
          const targetReq = requests.find((r) => r.id === joiningReqId);
          if (!targetReq) return null;

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0b0d12] border border-cyan-500/15 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4"
              >
                {/* Close Button */}
                <button
                  onClick={() => setJoiningReqId(null)}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                <div className="space-y-1.5 text-left">
                  <span className="text-[10px] font-mono uppercase bg-cyan-950/40 text-cyan-400 border border-cyan-800/20 px-2 py-0.5 rounded leading-none mr-1.5 font-bold">
                    Party Enrollment
                  </span>
                  <h3 className="text-sm font-bold text-slate-250 uppercase tracking-wide">
                    Join Assistant Slot
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Join the party to cooperate with <strong className="text-slate-205">{targetReq.createdByName}</strong> on <span className="text-purple-400 font-bold">{targetReq.weekday}</span>:
                    <span className="block mt-1 italic text-[11px] bg-[#121622] rounded py-1 px-2 text-cyan-300 font-mono">
                      "{targetReq.title}"
                    </span>
                  </p>
                </div>

                <div className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                      Which of your characters will participate?
                    </label>
                    <select
                      value={joinCharSelection}
                      onChange={(e) => setJoinCharSelection(e.target.value)}
                      className="w-full h-11 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-205 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="main">{currentUser.name} (Main Char)</option>
                      {userAlts.map((alt) => (
                        <option key={alt} value={`alt-existing:${alt}`}>
                          {alt} (Alt Account)
                        </option>
                      ))}
                      <option value="custom">-- Enter Another Alt Character --</option>
                    </select>
                  </div>

                  {joinCharSelection === 'custom' && (
                    <div className="animated-fade-in space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Character / Alt Assistant Name
                      </label>
                      <input
                        type="text"
                        required
                        value={customJoinAltName}
                        onChange={(e) => setCustomJoinAltName(e.target.value)}
                        placeholder="e.g., ShadowArcherAlt"
                        className="w-full h-10 px-3 bg-[#050608] border border-slate-800 focus:border-cyan-500/40 rounded-xl text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setJoiningReqId(null)}
                    className="flex-1 h-11 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 font-mono cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmJoin}
                    className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Confirm Slot
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
