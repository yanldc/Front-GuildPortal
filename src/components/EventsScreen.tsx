import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Gift, 
  Clock,
  Skull,
  Award,
  Gamepad2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Member, GuildEvent, INITIAL_EVENTS, GuildEventType } from '../types';

interface EventsScreenProps {
  currentUser: Member;
  members: Member[];
  events: GuildEvent[];
  onRsvpChange: (eventId: string, isRsvped: boolean) => void;
  onUpdateEvents?: (updatedEvents: GuildEvent[]) => void;
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

const convertEstToBrt = (timeStr: string): string => {
  if (!timeStr) return '';
  const cleanStr = timeStr.trim();
  const match = cleanStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hours = parseInt(match[1], 10);
  const minutes = match[2];
  
  // EST/EDT to BRT is +1 hour difference
  const brtHours = (hours + 1) % 24;
  const formattedHours = brtHours.toString().padStart(2, '0');
  return `${formattedHours}:${minutes} BRT`;
};

export default function EventsScreen({ 
  currentUser, 
  members = [],
  events, 
  onRsvpChange, 
  onUpdateEvents 
}: EventsScreenProps) {
  
  // Day Tab state - default to current local day of the week!
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const localDayName = daysMap[new Date().getDay()];
  
  const [selectedDayTab, setSelectedDayTab] = useState<string>(localDayName);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Adicionar Evento collapsible panel state
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedRsvps, setExpandedRsvps] = useState<Record<string, boolean>>({});
  
  // Novo Evento Form States
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<GuildEventType>('world_boss');
  const [newDescription, setNewDescription] = useState('');
  const [newWeekday, setNewWeekday] = useState<string>('Every day');
  const [newTime, setNewTime] = useState('22:30');
  const [newMinLevel, setNewMinLevel] = useState<number>(60);
  const [newRewardsInput, setNewRewardsInput] = useState('');

  // Editing state - stores the ID of the event being edited inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<GuildEventType>('world_boss');
  const [editDescription, setEditDescription] = useState('');
  const [editWeekday, setEditWeekday] = useState<string>('Every day');
  const [editTime, setEditTime] = useState('');
  const [editMinLevel, setEditMinLevel] = useState<number>(60);
  const [editRewardsInput, setEditRewardsInput] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Automatic Migration/Seeding of the updated INITIAL_EVENTS on start
  useEffect(() => {
    // If the events in state are only old mock ones or miss the weekday fields, upgrade them
    const hasOldEvents = events.some(e => e.id === 'evt1' || e.id === 'evt2' || !e.weekday || e.weekday === 'Todos os dias');
    if (hasOldEvents && onUpdateEvents) {
      onUpdateEvents(INITIAL_EVENTS);
    }
  }, [events, onUpdateEvents]);

  const filterTypes = [
    { id: 'all', label: 'All' },
    { id: 'world_boss', label: 'World Boss' },
    { id: 'rift', label: 'Rift' },
    { id: 'guild_dungeon', label: 'Guild Dungeon' },
    { id: 'ancient_fortress', label: 'Ancient Fortress (PvP)' },
    { id: 'clash', label: 'Clash (PvP)' },
    { id: 'abyss_boss', label: 'Abyss Boss' }
  ];

  // Helper to resolve events occurring on a selected day (individual weekday or "Every day")
  const getEventsForDay = (day: string) => {
    return events.filter((evt) => {
      const evtWeekday = evt.weekday || 'Every day';
      
      // If we select a specific day, match either "Every day" or that specific day
      if (day === 'all') return true;
      if (day === 'Every day') return evtWeekday === 'Every day';
      
      return evtWeekday === 'Every day' || evtWeekday === day;
    });
  };

  // Filter events by Search & Type
  const getFilteredEvents = () => {
    const dayFiltered = getEventsForDay(selectedDayTab);
    return dayFiltered.filter((evt) => {
      const matchesSearch = 
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        evt.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || evt.type === selectedType;
      return matchesSearch && matchesType;
    });
  };

  const currentFilteredList = getFilteredEvents();

  const getEventIcon = (type: GuildEventType) => {
    switch (type) {
      case 'world_boss': return <Skull className="text-red-400" size={18} />;
      case 'rift': return <RefreshCw className="text-teal-400" size={18} />;
      case 'guild_dungeon': return <Gamepad2 className="text-purple-400" size={18} />;
      case 'ancient_fortress': return <ShieldAlert className="text-amber-500" size={18} />;
      case 'clash': return <ShieldAlert className="text-cyan-400" size={18} />;
      case 'abyss_boss': return <Skull className="text-purple-500" size={18} />;
      default: return <Award className="text-blue-400" size={18} />;
    }
  };

  const isUserRsvped = (evt: GuildEvent) => {
    return evt.rsvps.includes(currentUser.id);
  };

  // Admin: Create Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onUpdateEvents) return;

    const rewardsArray = newRewardsInput
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const newEvent: GuildEvent = {
      id: 'custom-evt-' + Date.now(),
      title: newTitle.trim(),
      type: newType,
      description: newDescription.trim() || 'No description.',
      weekday: newWeekday,
      time: newTime,
      date: newWeekday === 'Every day' ? `Daily at ${newTime}` : `${newWeekday} at ${newTime}`,
      status: 'upcoming',
      minLevel: Number(newMinLevel) || 1,
      rewards: rewardsArray.length ? rewardsArray : ['GP Coins'],
      rsvps: []
    };

    onUpdateEvents([...events, newEvent]);
    
    // Clear forms
    setNewTitle('');
    setNewDescription('');
    setNewRewardsInput('');
    setShowAddForm(false);
  };

  // Admin: Delete Event
  const handleDeleteEvent = (id: string) => {
    if (!onUpdateEvents) return;
    if (window.confirm('Are you sure you want to delete this fixed event?')) {
      onUpdateEvents(events.filter(e => e.id !== id));
    }
  };

  // Admin: Trigger Edit Form
  const startEditing = (evt: GuildEvent) => {
    setEditingId(evt.id);
    setEditTitle(evt.title);
    setEditType(evt.type);
    setEditDescription(evt.description);
    setEditWeekday(evt.weekday || 'Every day');
    setEditTime(evt.time || '22:30');
    setEditMinLevel(evt.minLevel);
    setEditRewardsInput(evt.rewards.join(', '));
  };

  // Admin: Save Inline Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateEvents || !editingId) return;

    const rewardsArray = editRewardsInput
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const updatedEvents = events.map((evt) => {
      if (evt.id === editingId) {
        return {
          ...evt,
          title: editTitle.trim(),
          type: editType,
          description: editDescription.trim(),
          weekday: editWeekday,
          time: editTime,
          date: editWeekday === 'Every day' ? `Daily at ${editTime}` : `${editWeekday} at ${editTime}`,
          minLevel: Number(editMinLevel) || 1,
          rewards: rewardsArray.length ? rewardsArray : ['GP Coins']
        };
      }
      return evt;
    });

    onUpdateEvents(updatedEvents);
    setEditingId(null);
  };

  // Admin: Reset to default schedule
  const handleResetToDefaults = () => {
    if (!onUpdateEvents) return;
    if (window.confirm('Do you want to reset the schedule to the default times (Daily Rift at 22:30, Boss T3 at 23:30)? This will overwrite custom events.')) {
      onUpdateEvents(INITIAL_EVENTS);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="text-cyan-400" size={24} /> Weekly Event Schedule
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Weekly and daily scheduled fixed events. Confirm RSVPs to gain loot priority and GP points.
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400">
            <span className="text-cyan-400">ℹ️</span> All times are scheduled in <strong className="text-slate-300">EST</strong> (converted to <strong className="text-cyan-400">BRT 🇧🇷</strong> below each card).
          </div>
        </div>

        {isAdmin && onUpdateEvents && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 h-9 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              {showAddForm ? <X size={13} /> : <Plus size={13} />}
              {showAddForm ? 'Close Panel' : 'New Fixed Event'}
            </button>
            <button
              onClick={handleResetToDefaults}
              title="Restore Default Clan Schedule"
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Admin Collapsible form to create a new fixed event */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateEvent} className="bg-[#0b0d13]/90 border border-cyan-500/20 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Sparkles size={12} /> Create New Fixed Guild Event
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daily Rift Secondary"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Event Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-10 px-2 bg-[#050609] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-cyan-500/40 font-mono"
                  >
                    <option value="world_boss">World Boss</option>
                    <option value="rift">Rift</option>
                    <option value="guild_dungeon">Guild Dungeon</option>
                    <option value="ancient_fortress">Ancient Fortress (PvP)</option>
                    <option value="clash">Clash (PvP)</option>
                    <option value="abyss_boss">Abyss Boss</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Day of the Week</label>
                    <select
                      value={newWeekday}
                      onChange={(e) => setNewWeekday(e.target.value)}
                      className="w-full h-10 px-2 bg-[#050609] border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-cyan-500/40"
                    >
                      <option value="Every day">Every day</option>
                      {WEEKDAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Time (Fixed, EST)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 22:30"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full h-10 px-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs text-center focus:outline-none focus:border-cyan-500/40 font-mono"
                    />
                    <div className="text-[9px] font-mono text-slate-500 mt-1 text-right">
                      🇧🇷 BRT: {convertEstToBrt(newTime) || '--:--'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Event Description</label>
                <textarea
                  placeholder="Information, Discord links, guild goals..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full h-16 p-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500/40 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Estimated Rewards <span className="text-slate-500 font-normal text-[9px]">(Separated by comma)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +50 GP Points, Rare Item, Materials"
                  value={newRewardsInput}
                  onChange={(e) => setNewRewardsInput(e.target.value)}
                  className="w-full h-10 px-3 bg-[#050609] border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 h-9 bg-slate-900 border border-slate-800 hover:bg-[#12151f] text-slate-400 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 h-9 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-lg cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                >
                  Save Event Parameters
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HORIZONTAL RIBBON FOR DAYS OF THE WEEK */}
      <div className="bg-[#0a0c10] border border-slate-850/80 p-3 sm:p-4 rounded-2xl space-y-4">
        
        <div className="flex flex-col gap-3">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={11} className="text-slate-500" /> Filter by Day of the Week
          </label>
          
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 nodrag scrollbar-none">
            {/* All Events filter */}
            <button
              onClick={() => setSelectedDayTab('all')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap min-w-[70px] ${
                selectedDayTab === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black scale-102 border-none'
                  : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400'
              }`}
            >
              🗓️ All
            </button>

            {/* Daily Events Filter */}
            <button
              onClick={() => setSelectedDayTab('Every day')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                selectedDayTab === 'Every day'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-zinc-50 font-black scale-102'
                  : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400'
              }`}
            >
              ⭐ Daily Fixed
            </button>

            {/* Mon to Sun buttons */}
            {WEEKDAYS.map((day) => {
              const matchedEvents = getEventsForDay(day);
              const count = matchedEvents.length;
              const isToday = day === localDayName;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayTab(day)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap relative flex items-center gap-1.5 ${
                    selectedDayTab === day
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-black scale-102 border-none'
                      : isToday 
                      ? 'bg-[#1a2333]/75 border border-cyan-500/25 text-slate-100 hover:bg-[#1a2333]'
                      : 'bg-[#121520]/50 hover:bg-[#121520] text-slate-400'
                  }`}
                >
                  {day.split('-')[0]}
                  {count > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                      selectedDayTab === day ? 'bg-zinc-900 text-cyan-300 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {count}
                    </span>
                  )}
                  {isToday && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Filters Row: Search and Class */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-900">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search by title, description or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-[#07080c] border border-slate-850 focus:border-cyan-500/30 rounded-xl text-slate-200 text-xs focus:outline-none"
            />
          </div>
          <div className="md:col-span-4 flex items-center gap-1.5">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 px-2.5 bg-[#07080c] border border-slate-855 rounded-xl text-slate-300 text-xs focus:outline-none"
            >
              {filterTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* GRID OF EVENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {currentFilteredList.length === 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-16 text-center border-2 border-dashed border-slate-850 rounded-2xl bg-[#0a0c10]/30"
            >
              <Calendar size={36} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-400 text-xs font-bold uppercase font-mono mb-1">No events found</p>
              <p className="text-slate-600 text-[11px]">No scheduled events match the current filter or weekday selection.</p>
            </motion.div>
          ) : (
            currentFilteredList.map((evt) => {
              const rsvped = isUserRsvped(evt);
              const isEditing = editingId === evt.id;

              if (isEditing && isAdmin) {
                // RENDER INLINE EDIT PANEL FOR ADMIN
                return (
                  <motion.div
                    layout
                    key={evt.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 bg-[#0d101a] border border-cyan-500 hover:border-cyan-400 rounded-2xl space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                       <span className="text-xs font-bold text-cyan-300 font-mono uppercase">Editing Event</span>
                       <button 
                        type="button" 
                        onClick={() => setEditingId(null)}
                        className="text-slate-400 hover:text-red-400"
                        title="Cancel Edition"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-300">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5">Event Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5">Type</label>
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as any)}
                            className="w-full h-8 px-1.5 bg-slate-950 border border-slate-800 rounded focus:outline-none font-mono"
                          >
                            <option value="world_boss">World Boss</option>
                            <option value="rift">Rift</option>
                            <option value="guild_dungeon">Guild Dungeon</option>
                            <option value="ancient_fortress">Ancient Fortress (PvP)</option>
                            <option value="clash">Clash (PvP)</option>
                            <option value="abyss_boss">Abyss Boss</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5 font-bold">Fixed Day</label>
                          <select
                            value={editWeekday}
                            onChange={(e) => setEditWeekday(e.target.value)}
                            className="w-full h-8 px-1.5 bg-slate-950 border border-slate-800 rounded focus:outline-none"
                          >
                            <option value="Every day">Every day</option>
                            {WEEKDAYS.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5">Time (EST)</label>
                        <input
                          type="text"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                          🇧🇷 {convertEstToBrt(editTime) || '--:--'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5">Rules / Instructions</label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 uppercase mb-0.5">Rewards (separated by comma)</label>
                        <input
                          type="text"
                          value={editRewardsInput}
                          onChange={(e) => setEditRewardsInput(e.target.value)}
                          className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-[#12151f] text-slate-400 text-[10px] uppercase font-bold rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 text-[10px] uppercase font-black tracking-wider rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Save size={11} /> Save Event
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // RENDER STANDARD CARD
              return (
                <motion.div
                  layout
                  key={evt.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-[#0a0c10] border rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                    evt.status === 'completed'
                      ? 'border-slate-900 opacity-60'
                      : rsvped
                      ? 'border-cyan-500/30 ring-1 ring-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                      : 'border-slate-850 hover:border-slate-700/80'
                  }`}
                >
                  
                  {/* Background flare on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.015] rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Header: Badge & Date */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#11141e] flex items-center justify-center border border-slate-850">
                          {getEventIcon(evt.type)}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                            {evt.type === 'world_boss' ? 'WORLD BOSS 🔴' : 
                             evt.type === 'rift' ? 'RIFT 🌀' : 
                             evt.type === 'guild_dungeon' ? 'GUILD DUNGEON 🏰' : 
                             evt.type === 'ancient_fortress' ? 'ANCIENT FORTRESS (PVP) ⚔️' : 
                             evt.type === 'clash' ? 'CLASH (PVP) 🛡️' : 
                             evt.type === 'abyss_boss' ? 'ABYSS BOSS ☠️' : 
                             'EVENT 📅'}
                          </span>
                          <span className="text-[9px] font-mono font-semibold text-slate-600 block mt-0.5">
                            Frequency: <span className="text-cyan-400/80">{evt.weekday || 'Every day'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                        <div className="flex items-center gap-1 bg-[#121620] border border-slate-850 px-2 py-1 rounded-lg font-mono text-[9px] text-cyan-400 font-bold shadow-sm">
                          <Clock size={10} />
                          {evt.time || '22:30'} EST
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 font-medium">
                          🇧🇷 {convertEstToBrt(evt.time || '22:30')}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide mb-1.5 text-left">{evt.title}</h3>
                      {isAdmin && (
                        <div className="flex items-center gap-0.5 opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap">
                          <button
                            onClick={() => startEditing(evt)}
                            className="p-1 px-1.5 bg-[#121620] hover:bg-slate-800 hover:text-cyan-400 rounded border border-slate-800 text-[10px] font-mono uppercase cursor-pointer"
                            title="Edit Event"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-1 text-slate-500 hover:text-red-500 cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 text-left">{evt.description}</p>

                    {/* Rewards */}
                    <div className="space-y-2 bg-[#08090d]/90 border border-slate-905 p-3.5 rounded-xl mb-4 text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Approximate rewards:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {evt.rewards.map((rew, i) => (
                            <span 
                              key={i} 
                              className="inline-flex items-center gap-1 bg-cyan-500/5 text-cyan-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-cyan-500/10"
                            >
                              <Gift size={9} /> {rew}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Confirmed Roster list for Admins only */}
                    {isAdmin && (
                      <div className="mt-4 pt-3.5 border-t border-slate-900 text-left">
                        <button 
                          onClick={() => setExpandedRsvps(prev => ({ ...prev, [evt.id]: !prev[evt.id] }))}
                          className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08] border border-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-1.5 font-semibold">
                            👑 Confirmed Players ({evt.rsvps.length})
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-slate-400 normal-case font-normal select-none">
                            {expandedRsvps[evt.id] ? (
                              <>Hide <ChevronUp size={11} className="text-cyan-400 shrink-0" /></>
                            ) : (
                              <>Show <ChevronDown size={11} className="text-cyan-400 shrink-0" /></>
                            )}
                          </span>
                        </button>

                        {expandedRsvps[evt.id] && (
                          <div className="mt-2.5 bg-[#040508]/40 border border-slate-900/60 p-2.5 rounded-lg">
                            {evt.rsvps.length === 0 ? (
                              <p className="text-[10px] text-slate-500 italic font-mono pl-1">No sign-ups for this event yet.</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {members.filter(m => evt.rsvps.includes(m.id)).map((m) => (
                                  <span 
                                    key={m.id} 
                                    className="inline-flex items-center gap-1.5 hover:border-cyan-500/25 transition-colors bg-[#08090d] border border-slate-850 text-slate-300 text-[10px] px-2 py-0.5 rounded-lg font-mono shadow-sm"
                                    title={`LVL ${m.level} • ${m.points} GP`}
                                  >
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                                    <span className="text-slate-200 font-medium">{m.name}</span>
                                    <span className="text-slate-500 text-[9px]">({m.class})</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Roster & Confirm CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-900 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs text-left">
                      <Users size={12} className="text-slate-500" />
                      <span>{evt.rsvps.length} Confirmed</span>
                    </div>

                    <button
                      onClick={() => onRsvpChange(evt.id, !rsvped)}
                      className={`h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        rsvped
                          ? 'bg-cyan-950/20 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-950/45'
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] font-black'
                      }`}
                    >
                      {rsvped ? '✓ RSVP Registered' : 'Confirm RSVP'}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
