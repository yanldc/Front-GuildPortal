import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Calendar, Search, Clock, Plus, X, RefreshCw } from 'lucide-react';
import { Member, GuildEvent, GuildEventType } from '../../types';
import { eventsService } from '../../services/events';
import EventCard from './EventCard';
import EventForm from './EventForm';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface EventsScreenProps {
  currentUser: Member;
  members: Member[];
  events: GuildEvent[];
  onRsvpChange: (eventId: string, isRsvped: boolean) => void;
  onUpdateEvents?: (updatedEvents?: GuildEvent[]) => void;
}

export default function EventsScreen({ currentUser, members = [], events, onRsvpChange, onUpdateEvents }: EventsScreenProps) {
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const localDayName = daysMap[new Date().getDay()];
  const [selectedDayTab, setSelectedDayTab] = useState<string>(localDayName);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedRsvps, setExpandedRsvps] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editWeekday, setEditWeekday] = useState('Every day');
  const [editDescription, setEditDescription] = useState('');
  const [editRewardsInput, setEditRewardsInput] = useState('');
  const [editType, setEditType] = useState<GuildEventType>('world_boss');

  const isAdmin = currentUser.role === 'admin';

  const filterTypes = [{ id: 'all', label: 'All' }, { id: 'world_boss', label: 'World Boss' }, { id: 'rift', label: 'Rift' }, { id: 'guild_dungeon', label: 'Guild Dungeon' }, { id: 'ancient_fortress', label: 'Ancient Fortress' }, { id: 'clash', label: 'Clash' }, { id: 'abyss_boss', label: 'Abyss Boss' }];

  const getFilteredEvents = () => {
    return events.filter(evt => {
      const evtWeekday = evt.weekday || 'Every day';
      const dayMatch = selectedDayTab === 'all' ? true : selectedDayTab === 'Every day' ? evtWeekday === 'Every day' : (evtWeekday === 'Every day' || evtWeekday === selectedDayTab);
      const searchMatch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || evt.description.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = selectedType === 'all' || evt.type === selectedType;
      // Guild visibility: admins see all, members only see events for their guild or 'any'
      const allowedGuilds = evt.allowedGuilds || ['any'];
      const guildMatch = currentUser.role === 'admin' || allowedGuilds.includes('any') || allowedGuilds.includes(currentUser.guild || 'RuinToo');
      return dayMatch && searchMatch && typeMatch && guildMatch;
    });
  };

  const currentFilteredList = getFilteredEvents();

  const handleCreateEvent = async (data: Omit<GuildEvent, 'id' | 'status' | 'rsvps'>) => {
    await eventsService.create({ ...data, status: 'upcoming', rsvps: [] } as GuildEvent);
    onUpdateEvents?.();
    setShowAddForm(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    await eventsService.delete(id);
    onUpdateEvents?.();
  };

  const startEditing = (evt: GuildEvent) => {
    setEditingId(evt.id); setEditTitle(evt.title); setEditType(evt.type); setEditDescription(evt.description);
    setEditWeekday(evt.weekday || 'Every day'); setEditTime(evt.time || '22:30'); setEditRewardsInput(evt.rewards.join(', '));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const rewardsArray = editRewardsInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
    await eventsService.update(editingId, {
      title: editTitle.trim(),
      type: editType,
      description: editDescription.trim(),
      weekday: editWeekday,
      time: editTime,
      date: editWeekday === 'Every day' ? `Daily at ${editTime}` : `${editWeekday} at ${editTime}`,
      rewards: rewardsArray.length ? rewardsArray : ['GP Coins'],
    });
    setEditingId(null);
    onUpdateEvents?.();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2"><Calendar className="text-cyan-400" size={24} /> Weekly Event Schedule</h2>
          <p className="text-slate-400 text-xs mt-1">Weekly and daily scheduled events. Confirm RSVPs to gain loot priority and GP.</p>
          <div className="mt-1.5 inline-flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400"><span className="text-cyan-400">ℹ️</span> Times in <strong className="text-slate-300">EST</strong> (converted to <strong className="text-cyan-400">BRT 🇧🇷</strong>).</div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 h-9 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer">{showAddForm ? <X size={13} /> : <Plus size={13} />}{showAddForm ? 'Close' : 'New Event'}</button>
          </div>
        )}
      </div>

      {/* Create Form */}
      <AnimatePresence>{showAddForm && isAdmin && <EventForm onSubmit={handleCreateEvent} onClose={() => setShowAddForm(false)} />}</AnimatePresence>

      {/* Day Filter + Search */}
      <div className="bg-[#0a0c10] border border-slate-850/80 p-3 sm:p-4 rounded-2xl space-y-4">
        <div className="flex flex-col gap-3">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock size={11} className="text-slate-500" /> Filter by Day</label>
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setSelectedDayTab('all')} className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer ${selectedDayTab === 'all' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black' : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400'}`}>🗓️ All</button>
            <button onClick={() => setSelectedDayTab('Every day')} className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer ${selectedDayTab === 'Every day' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-zinc-50 font-black' : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400'}`}>⭐ Daily</button>
            {WEEKDAYS.map(day => {
              const isToday = day === localDayName;
              return (<button key={day} onClick={() => setSelectedDayTab(day)} className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer relative flex items-center gap-1.5 ${selectedDayTab === day ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black' : isToday ? 'bg-[#1a2333]/75 border border-cyan-500/25 text-slate-100' : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400'}`}>
                {day}{isToday && <span className="absolute top-1 right-1 flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span></span>}
              </button>);
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-900">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-9 pr-4 bg-[#07080c] border border-slate-850 focus:border-cyan-500/30 rounded-xl text-slate-200 text-xs focus:outline-none" />
          </div>
          <div className="md:col-span-4 flex items-center gap-1.5">
            <label className="text-[10px] font-mono text-slate-500 uppercase shrink-0">Type:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full h-10 px-2.5 bg-[#07080c] border border-slate-855 rounded-xl text-slate-300 text-xs focus:outline-none">
              {filterTypes.map(t => (<option key={t.id} value={t.id}>{t.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {currentFilteredList.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-850 rounded-2xl bg-[#0a0c10]/30">
              <Calendar size={36} className="mx-auto text-slate-600 mb-2" /><p className="text-slate-400 text-xs font-bold uppercase font-mono">No events found</p>
            </div>
          ) : (
            currentFilteredList.map(evt => {
              if (editingId === evt.id && isAdmin) {
                return (
                  <div key={evt.id} className="p-5 bg-[#0d101a] border border-cyan-500 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2"><span className="text-xs font-bold text-cyan-300 font-mono uppercase">Editing</span><button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-red-400"><X size={15} /></button></div>
                    <div className="space-y-3 text-xs">
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none text-slate-200" />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={editType} onChange={(e) => setEditType(e.target.value as GuildEventType)} className="h-8 px-1.5 bg-slate-950 border border-slate-800 rounded focus:outline-none text-slate-300 font-mono">
                          <option value="world_boss">World Boss</option><option value="rift">Rift</option><option value="guild_dungeon">Guild Dungeon</option><option value="ancient_fortress">Ancient Fortress</option><option value="clash">Clash</option><option value="abyss_boss">Abyss Boss</option>
                        </select>
                        <select value={editWeekday} onChange={(e) => setEditWeekday(e.target.value)} className="h-8 px-1.5 bg-slate-950 border border-slate-800 rounded focus:outline-none text-slate-300">
                          <option value="Every day">Every day</option>{WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <input type="text" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none font-mono text-slate-200" />
                      <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none text-slate-200" />
                      <input type="text" value={editRewardsInput} onChange={(e) => setEditRewardsInput(e.target.value)} placeholder="Rewards (comma)" className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none text-slate-200" />
                      <div className="flex gap-2 justify-end pt-1">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] uppercase font-bold rounded">Cancel</button>
                        <button onClick={handleSaveEdit} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 text-[10px] uppercase font-black rounded cursor-pointer">Save</button>
                      </div>
                    </div>
                  </div>
                );
              }
              return <EventCard key={evt.id} evt={evt} currentUser={currentUser} members={members} isAdmin={isAdmin} onRsvpChange={onRsvpChange} onEdit={startEditing} onDelete={handleDeleteEvent} expandedRsvps={expandedRsvps} setExpandedRsvps={setExpandedRsvps} />;
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
