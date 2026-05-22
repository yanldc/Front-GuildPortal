import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { Sparkles, Sword, CheckCircle, CalendarDays } from 'lucide-react';
import { Member, LevelUpRequest, LevelUpHelper, LevelUpEnroll, CLASSES_RAVEN2 } from '../../types';
import { levelupService } from '../../services/levelup';
import RequestCard from './RequestCard';
import HelperCard from './HelperCard';
import RequestForm from './RequestForm';
import HelperForm from './HelperForm';
import JoinSlotModal from './JoinSlotModal';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface LevelUpScreenProps {
  currentUser: Member;
}

export default function LevelUpScreen({ currentUser }: LevelUpScreenProps) {
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const localDayName = daysMap[new Date().getDay()];
  const [selectedDayTab, setSelectedDayTab] = useState<string>('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showHelperForm, setShowHelperForm] = useState(false);
  const [joiningReqId, setJoiningReqId] = useState<string | null>(null);

  const [requests, setRequests] = useState<LevelUpRequest[]>([]);
  const [helpers, setHelpers] = useState<LevelUpHelper[]>([]);

  const fetchRequests = useCallback(async () => {
    try { setRequests(await levelupService.listRequests()); } catch (e) { console.error(e); }
  }, []);

  const fetchHelpers = useCallback(async () => {
    try { setHelpers(await levelupService.listHelpers()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchRequests(); fetchHelpers(); }, [fetchRequests, fetchHelpers]);

  const getFiltered = <T extends { weekday: string }>(list: T[]) => selectedDayTab === 'all' ? list : list.filter(i => i.weekday === selectedDayTab || i.weekday === 'Every day');
  const currentRequests = getFiltered(requests);
  const currentHelpers = getFiltered(helpers);

  const handleCreateRequest = async (data: Omit<LevelUpRequest, 'id' | 'slots' | 'createdAt'>) => {
    await levelupService.createRequest({ ...data, slots: [] } as any);
    fetchRequests();
    setSelectedDayTab(data.weekday);
  };

  const handleRegisterHelper = async (data: { characterName: string; class: string; isAlt: boolean; availability: string; weekday: string }) => {
    await levelupService.createHelper({ ...data, memberId: currentUser.id, memberOriginalName: currentUser.name } as any);
    fetchHelpers();
    setSelectedDayTab(data.weekday);
  };

  const handleConfirmJoin = async (characterName: string, isAlt: boolean) => {
    if (!joiningReqId) return;
    await levelupService.joinSlot(joiningReqId, { characterName, isAlt });
    fetchRequests();
    setJoiningReqId(null);
  };

  const handleLeaveSlot = async (reqId: string, _charName: string) => {
    await levelupService.leaveSlot(reqId);
    fetchRequests();
  };

  const handleDeleteRequest = async (id: string) => {
    await levelupService.deleteRequest(id);
    fetchRequests();
  };

  const handleDeleteHelper = async (id: string) => {
    await levelupService.deleteHelper(id);
    fetchHelpers();
  };

  const targetReq = joiningReqId ? requests.find(r => r.id === joiningReqId) : null;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-[#0a0c10] border border-cyan-500/15 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-wider font-semibold">Power Leveling Hub</span>
            <span className="text-emerald-400 font-mono text-xs flex items-center gap-1"><Sparkles size={11.5} /> Active Cooperation</span>
          </div>
          <h2 className="text-2xl font-black font-sans text-slate-100 tracking-tight uppercase flex items-center gap-2">Lv UP <span className="text-cyan-400 tracking-normal text-xs font-normal lowercase bg-cyan-950/40 border border-cyan-800/20 px-2 py-0.5 rounded font-sans">scheduling matches</span></h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">Specify which days of the week you need assistance or are available to boost!</p>
        </div>
        <button onClick={() => setShowRequestForm(!showRequestForm)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-1.5 shrink-0">
          {showRequestForm ? 'Cancel Form' : 'Request Help +'}
        </button>
      </div>

      {/* Request Form */}
      <AnimatePresence>
        {showRequestForm && <RequestForm currentUser={currentUser} defaultWeekday={selectedDayTab === 'all' ? 'Every day' : selectedDayTab} onSubmit={handleCreateRequest} onClose={() => setShowRequestForm(false)} />}
      </AnimatePresence>

      {/* Day Filter */}
      <div className="bg-[#0a0c10] border border-slate-850/80 p-3 sm:p-4 rounded-2xl space-y-3">
        <label className="block text-[10px] font-mono text-slate-405 uppercase tracking-wider flex items-center gap-1.5"><CalendarDays size={12} className="text-cyan-400" /> Filter by Day</label>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setSelectedDayTab('all')} className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${selectedDayTab === 'all' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black' : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400 border border-slate-800/80'}`}>🗓️ All Days</button>
          <button onClick={() => setSelectedDayTab('Every day')} className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${selectedDayTab === 'Every day' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-zinc-50 font-black' : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400 border border-slate-800/80'}`}>⭐ Daily</button>
          {WEEKDAYS.map((day) => {
            const isToday = day === localDayName;
            const count = requests.filter(r => r.weekday === day).length + helpers.filter(h => h.weekday === day).length;
            return (
              <button key={day} onClick={() => setSelectedDayTab(day)} className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap relative flex items-center gap-1.5 ${selectedDayTab === day ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black' : isToday ? 'bg-[#1a2333]/75 border border-cyan-500/25 text-slate-100' : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400 border border-slate-800/80'}`}>
                {day}
                {isToday && <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-1 rounded font-semibold uppercase leading-none">Today</span>}
                {count > 0 && <span className={`text-[9px] px-1.5 rounded font-mono ${selectedDayTab === day ? 'bg-zinc-900 text-cyan-400' : 'bg-slate-800 text-slate-350'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"><Sword className="text-cyan-400" size={16} /> 1. Matchmaking Requests ({currentRequests.length})</h3>
          <span className="text-[10.5px] font-mono text-slate-500">Day: <strong className="text-cyan-400 uppercase">{selectedDayTab}</strong></span>
        </div>
        {currentRequests.length === 0 ? (
          <div className="bg-[#0a0c10]/40 border border-dashed border-slate-850 p-10 rounded-2xl text-center"><p className="text-slate-500 font-mono uppercase text-[10.5px]">No requests for this day.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentRequests.map(req => <RequestCard key={req.id} req={req} currentUser={currentUser} onDelete={handleDeleteRequest} onOpenJoin={setJoiningReqId} onLeaveSlot={handleLeaveSlot} />)}
          </div>
        )}
      </div>

      {/* Helpers Section */}
      <div className="space-y-6 pt-4">
        <div className="bg-[#080a11] border border-slate-850 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/70 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"><CheckCircle className="text-emerald-405" size={16} /> 2. Available Veterans & Alts ({currentHelpers.length})</h3>
              <p className="text-slate-500 text-xs">Guild members registered to help on specified schedules.</p>
            </div>
            <button onClick={() => setShowHelperForm(!showHelperForm)} className="bg-slate-800 hover:bg-slate-750 border border-slate-755 text-emerald-400 font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse">
              {showHelperForm ? 'Close Form' : 'Register Availability +'}
            </button>
          </div>

          <AnimatePresence>
            {showHelperForm && <HelperForm currentUser={currentUser} defaultWeekday={selectedDayTab === 'all' ? 'Every day' : selectedDayTab} onSubmit={handleRegisterHelper} onClose={() => setShowHelperForm(false)} />}
          </AnimatePresence>

          {currentHelpers.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-850 bg-[#06080b]/50 rounded-xl"><p className="text-slate-550 font-mono text-[10px] uppercase">No helpers for this day.</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentHelpers.map(help => <HelperCard key={help.id} help={help} currentUser={currentUser} onRemove={handleDeleteHelper} />)}
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {targetReq && <JoinSlotModal targetReq={targetReq} currentUser={currentUser} onClose={() => setJoiningReqId(null)} onConfirm={handleConfirmJoin} />}
      </AnimatePresence>
    </div>
  );
}
