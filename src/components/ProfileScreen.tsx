import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User, Sword, Plus, HelpCircle, Save, CheckCircle2, RefreshCw, Key, Award, Activity, Grid, Landmark, Layers } from 'lucide-react';
import { Member, CLASSES_RAVEN2, GearItem, RPGProfile } from '../types';
import GearRow from './profile/GearRow';

interface ProfileScreenProps {
  currentUser: Member;
  onUpdateProfile: (updatedUser: Member) => void | Promise<void>;
}

// Preset Constants
const WEAPON_PRESETS = [
  'Blue/rare',
  'Spec C.',
  'Ravens',
  'Frost',
  'Ruin',
  'Guild Weapon',
  'Ashen Dawn',
  'Parnaq Weapon',
  'Crafted Legendar',
  'Parnaq Legendary'
];

const ARMOR_PRESETS = [
  'Blue',
  'Spec C',
  'Night Stalker',
  'Dark Saint',
  'Shadow Veil',
  'Holy King',
  'Twilight Protector',
  'Phantom Arbiter',
  'Oblivion',
  'Torment',
  'Aurora',
  'Parnas',
  'Legendary'
];

const JEWELRY_PRESETS = [
  'Blue',
  'Spec C',
  'Ravens',
  'Absolute',
  'West Wind',
  'Undying',
  'Frozen Earth',
  'Ruin',
  'Parnaqs',
  'Legendary'
];

const SYMBOL_PRESETS = [
  'grey',
  'green',
  'blue',
  'purple',
  'gold'
];

export default function ProfileScreen({ currentUser, onUpdateProfile }: ProfileScreenProps) {
  // Base Sign-up fields
  const [name, setName] = useState(currentUser.name);
  const [selectedClass, setSelectedClass] = useState(currentUser.class);
  const [guild, setGuild] = useState<string>(currentUser.guild || 'RuinToo');
  const [altNames, setAltNames] = useState<string[]>(currentUser.altNames || []);
  const [newAltName, setNewAltName] = useState('');

  // Stats (First row)
  const [level, setLevel] = useState<number>(currentUser.level || 60);
  const [atk, setAtk] = useState<number>(currentUser.rpgProfile?.atk || 0);
  const [def, setDef] = useState<number>(currentUser.rpgProfile?.def || 0);
  const [acc, setAcc] = useState<number>(currentUser.rpgProfile?.acc || 0);

  // Collections (Second row)
  const [itemsColl, setItemsColl] = useState<string>((currentUser.rpgProfile?.itemsCollection || '0').replace('%', ''));
  const [garmentColl, setGarmentColl] = useState<string>((currentUser.rpgProfile?.garmentCollection || '0').replace('%', ''));
  const [familiarColl, setFamiliarColl] = useState<string>((currentUser.rpgProfile?.familiarCollection || '0').replace('%', ''));

  // Floors (Third row)
  const [riftFloor, setRiftFloor] = useState<string>(currentUser.rpgProfile?.riftFloor || 'F1');
  const [towerFloor, setTowerFloor] = useState<string>(currentUser.rpgProfile?.towerFloor || 'F1');
  const [mainQuest, setMainQuest] = useState<string>(currentUser.rpgProfile?.mainQuest || '');

  // Gear Presets & Refinement states
  const initGearItem = (item?: GearItem, defaultPreset = 'Blue'): GearItem => ({
    preset: item?.preset || defaultPreset,
    refinement: item?.refinement || '+0'
  });

  // Gear items state
  const [mainWeapon, setMainWeapon] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.mainWeapon, 'Blue/rare'));
  const [gloves, setGloves] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.gloves, 'Blue'));
  const [cape, setCape] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.cape, 'Blue'));
  const [helmet, setHelmet] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.helmet, 'Blue'));
  const [chest, setChest] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.chest, 'Blue'));
  const [pants, setPants] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.pants, 'Blue'));
  const [boots, setBoots] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.boots, 'Blue'));

  // Accessories states
  const [lEarrings, setLEarrings] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.lEarrings, 'Blue'));
  const [rEarrings, setREarrings] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.rEarrings, 'Blue'));
  const [necklace, setNecklace] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.necklace, 'Blue'));
  const [belt, setBelt] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.belt, 'Blue'));
  const [lBracelet, setLBracelet] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.lBracelet, 'Blue'));
  const [rBracelet, setRBracelet] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.rBracelet, 'Blue'));
  const [lRing, setLRing] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.lRing, 'Blue'));
  const [rRing, setRRing] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.rRing, 'Blue'));
  const [toten, setToten] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.toten, 'Blue'));
  const [seal, setSeal] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.seal, 'Blue'));

  // Symbols states
  const [riftHunterSymbol, setRiftHunterSymbol] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.riftHunterSymbol, 'grey'));
  const [honorableSymbol, setHonorableSymbol] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.honorableSymbol, 'grey'));
  const [dimensionalWanderersSymbol, setDimensionalWanderersSymbol] = useState<GearItem>(initGearItem(currentUser.rpgProfile?.dimensionalWanderersSymbol, 'grey'));

  // UI status
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddAltName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAlt = newAltName.trim();
    if (!cleanAlt) return;

    if (altNames.some(alt => alt.toLowerCase() === cleanAlt.toLowerCase())) {
      setErrorString('This Alternative Name is already listed.');
      return;
    }
    if (cleanAlt.toLowerCase() === name.trim().toLowerCase()) {
      setErrorString('Alt Characters cannot have your exact main name.');
      return;
    }

    setAltNames([...altNames, cleanAlt]);
    setNewAltName('');
    setErrorString(null);
  };

  const handleRemoveAltName = (index: number) => {
    setAltNames(altNames.filter((_, idx) => idx !== index));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorString('Character main Name is required.');
      return;
    }

    const updatedProfile: RPGProfile = {
      atk, def, acc,
      itemsCollection: itemsColl, garmentCollection: garmentColl, familiarCollection: familiarColl,
      riftFloor, towerFloor, mainQuest,
      mainWeapon, gloves, cape, helmet, chest, pants, boots,
      lEarrings, rEarrings, necklace, belt, lBracelet, rBracelet, lRing, rRing, toten, seal,
      riftHunterSymbol, honorableSymbol, dimensionalWanderersSymbol
    };

    const updatedUser: Member = {
      ...currentUser,
      name: name.trim(),
      class: selectedClass,
      level: Number(level) || currentUser.level,
      altNames, guild,
      rpgProfile: updatedProfile
    };

    setSubmitting(true);
    try {
      await onUpdateProfile(updatedUser);
      setSuccessMsg(true);
      setErrorString(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch {
      setErrorString('Failed to save profile. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      
      {/* Header Notification & Success and Error Prompts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-950/40 border border-emerald-500/35 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <CheckCircle2 className="text-emerald-400 animate-bounce" size={16} />
            <div>
              <strong className="font-bold uppercase tracking-wider block text-emerald-400">Profile Updated Successfully!</strong>
              Your RPG attributes, collections, and combat gear setup has been saved to the clan database.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorString && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-950/30 border border-red-950 text-red-400 text-xs rounded-xl"
          >
            ✕ {errorString}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#0a0c10] border border-cyan-500/15 rounded-2xl p-5 sm:p-7 relative overflow-hidden">
        {/* Ambient decorative grid */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 border-b border-slate-900 pb-5 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center">
            <User className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-100 tracking-wider">
              My Profile & Character Setup
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Securely linked to Google Account: <span className="text-cyan-400">{currentUser.email || 'simulated_google@gmail.com'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-6">

          {/* SECTION 1: REGISTRATION DATA & ALTS */}
          <div className="bg-[#08090d]/80 rounded-xl p-4 sm:p-5 border border-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2">
              <Shield size={12} /> Account Registration Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Character Name */}
              <div>
                <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Main Character Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              {/* Class choice */}
              <div>
                <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Primary RPG Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-300 text-xs focus:outline-none font-sans"
                >
                  {CLASSES_RAVEN2.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guild Choice */}
              <div>
                <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Guild / Clan Preset
                </label>
                <select
                  value={guild}
                  onChange={(e) => setGuild(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-305 text-xs focus:outline-none font-sans"
                >
                  <option value="RuinToo">RuinToo</option>
                  <option value="Burnout">Burnout</option>
                </select>
              </div>
            </div>

            {/* Alt Names Input Array with ADD button */}
            <div className="pt-2">
              <label className="block text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Alternative Characters (Alts)
              </label>
              
              <div className="flex gap-2">
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
                  placeholder="Alt character name"
                  className="flex-grow h-10 px-3.5 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAltName}
                  className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Add Alt Name
                </button>
              </div>

              {altNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-slate-950 rounded-lg border border-slate-900">
                  {altNames.map((alt, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-cyan-950/20 border border-cyan-500/10 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300"
                    >
                      {alt}
                      <button
                        type="button"
                        onClick={() => handleRemoveAltName(idx)}
                        className="text-slate-500 hover:text-red-400 font-bold focus:outline-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* SECTION 2: STATS, COLLECTIONS & FLOORS */}
          <div className="bg-[#08090d]/80 rounded-xl p-4 sm:p-5 border border-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2">
              <Activity size={12} /> Level and Combat Attributes
            </h3>

            {/* Same Line: level, Atk, def, acc */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
              <div>
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider mb-1 truncate">
                  Lv (Level)
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full h-10 px-2.5 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider mb-1 truncate">
                  ATK
                </label>
                <input
                  type="number"
                  min={0}
                  value={atk}
                  onChange={(e) => setAtk(Number(e.target.value))}
                  className="w-full h-10 px-2.5 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider mb-1 truncate">
                  DEF
                </label>
                <input
                  type="number"
                  min={0}
                  value={def}
                  onChange={(e) => setDef(Number(e.target.value))}
                  className="w-full h-10 px-2.5 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider mb-1 truncate">
                  ACC
                </label>
                <input
                  type="number"
                  min={0}
                  value={acc}
                  onChange={(e) => setAcc(Number(e.target.value))}
                  className="w-full h-10 px-2.5 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Line below: Collections: items, garment, familiar */}
            <div className="pt-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 text-cyan-400/90">
                <Grid size={11} /> Roster Collections Progression
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Items Collection
                  </label>
                  <input
                    type="text"
                    value={itemsColl}
                    onChange={(e) => setItemsColl(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Garment Collection
                  </label>
                  <input
                    type="text"
                    value={garmentColl}
                    onChange={(e) => setGarmentColl(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Familiar Collection
                  </label>
                  <input
                    type="text"
                    value={familiarColl}
                    onChange={(e) => setFamiliarColl(e.target.value)}
                    placeholder="e.g. 210"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Line below: Floors: Rift, tower */}
            <div className="pt-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 text-cyan-400/90">
                <Landmark size={11} /> Floors Reached
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Rift Floor
                  </label>
                  <input
                    type="text"
                    value={riftFloor}
                    onChange={(e) => setRiftFloor(e.target.value)}
                    placeholder="e.g. F12"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Tower Floor
                  </label>
                  <input
                    type="text"
                    value={towerFloor}
                    onChange={(e) => setTowerFloor(e.target.value)}
                    placeholder="e.g. Floor 8"
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Line below: Main Quest */}
            <div className="pt-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 text-cyan-400/90">
                <Layers size={11} /> Main Quest Progression
              </label>
              <div>
                <input
                  type="text"
                  value={mainQuest}
                  onChange={(e) => setMainQuest(e.target.value)}
                  placeholder="e.g. Chapter 4 - Act II: The Seal"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-850/80 focus:border-cyan-500/50 rounded-xl text-slate-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>


          {/* SECTION 3: WEAPONS & ARMOR GEAR */}
          <div className="bg-[#08090d]/80 rounded-xl p-4 sm:p-5 border border-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
              <span className="flex items-center gap-1.5"><Sword size={13} /> Weapon & Armor Gear Set</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">Select Pre-set & Ref refinement</span>
            </h3>

            {/* Main weapon row */}
            <div className="p-3 bg-cyan-950/10 border border-cyan-500/10 rounded-xl">
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-12 md:col-span-4 text-xs font-bold text-slate-200 tracking-wider flex items-center gap-1.5">
                  🛡️ <span className="uppercase text-cyan-300">Main Weapon</span>
                </div>
                
                {/* Preset Dropdown */}
                <div className="col-span-8 md:col-span-5">
                  <select
                    value={mainWeapon.preset}
                    onChange={(e) => setMainWeapon({ ...mainWeapon, preset: e.target.value })}
                    className="w-full h-9 px-2 bg-slate-950 border border-slate-850 rounded text-slate-300 text-xs focus:outline-none font-mono"
                  >
                    {WEAPON_PRESETS.map((pst) => (
                      <option key={pst} value={pst}>{pst}</option>
                    ))}
                  </select>
                </div>

                {/* Refinement input */}
                <div className="col-span-4 md:col-span-3 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Ref:</span>
                  <input
                    type="text"
                    value={mainWeapon.refinement}
                    onChange={(e) => setMainWeapon({ ...mainWeapon, refinement: e.target.value })}
                    placeholder="+9"
                    className="w-full h-9 px-2.5 bg-slate-950 border border-slate-850 rounded text-slate-200 text-xs focus:outline-none text-center font-mono font-bold text-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Armor Rows */}
            <div className="space-y-2 pt-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Defense Pieces Setup</label>
              {[
                { label: 'Gloves', value: gloves, setter: setGloves },
                { label: 'Cape', value: cape, setter: setCape },
                { label: 'Helmet', value: helmet, setter: setHelmet },
                { label: 'Chest', value: chest, setter: setChest },
                { label: 'Pants', value: pants, setter: setPants },
                { label: 'Boots', value: boots, setter: setBoots }
              ].map((arm, index) => (
                <GearRow key={index} label={arm.label} value={arm.value} onChange={arm.setter} presets={ARMOR_PRESETS} />
              ))}
            </div>
          </div>


          {/* SECTION 4: JEWELRY & ACCESSORIES */}
          <div className="bg-[#08090d]/80 rounded-xl p-4 sm:p-5 border border-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
              <span className="flex items-center gap-1.5"><Award size={13} strokeWidth={2.5} /> Jewelry & Accessories</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">Presets with Ref refinement</span>
            </h3>

            {/* Loop for Jewelry pieces */}
            <div className="space-y-2">
              {[
                { label: 'Left Earrings', value: lEarrings, setter: setLEarrings },
                { label: 'Right Earrings', value: rEarrings, setter: setREarrings },
                { label: 'Necklace', value: necklace, setter: setNecklace },
                { label: 'Belt', value: belt, setter: setBelt },
                { label: 'Left Bracelet', value: lBracelet, setter: setLBracelet },
                { label: 'Right Bracelet', value: rBracelet, setter: setRBracelet },
                { label: 'Left Ring', value: lRing, setter: setLRing },
                { label: 'Right Ring', value: rRing, setter: setRRing },
                { label: 'Toten', value: toten, setter: setToten },
                { label: 'Seal', value: seal, setter: setSeal }
              ].map((jwl, index) => (
                <GearRow key={index} label={jwl.label} value={jwl.value} onChange={jwl.setter} presets={JEWELRY_PRESETS} refinementPlaceholder="+3" />
              ))}
            </div>
          </div>


          {/* SECTION 5: SYMBOLS */}
          <div className="bg-[#08090d]/80 rounded-xl p-4 sm:p-5 border border-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
              <span className="flex items-center gap-1.5"><Layers size={13} /> Sacred Guild Symbols</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">Rank Preset & Upgrades</span>
            </h3>

            {/* Symbols setup */}
            <div className="space-y-2">
              {[
                { label: 'Rift Hunter', value: riftHunterSymbol, setter: setRiftHunterSymbol },
                { label: 'Honorable', value: honorableSymbol, setter: setHonorableSymbol },
                { label: 'Dimensional Wanderers', value: dimensionalWanderersSymbol, setter: setDimensionalWanderersSymbol }
              ].map((sym, index) => (
                <GearRow key={index} label={sym.label} value={sym.value} onChange={sym.setter} presets={SYMBOL_PRESETS} refinementLabel="LV:" refinementPlaceholder="Lv.5" />
              ))}
            </div>
          </div>


          {/* SUBMIT FORM ACTION SECTION */}
          <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} /> {submitting ? '⟳ Saving...' : 'Update Character Parameters'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
