import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Calendar, 
  Gavel, 
  UserCheck, 
  LogOut, 
  Menu, 
  X, 
  Coins, 
  LayoutDashboard,
  Award,
  TrendingUp
} from 'lucide-react';
import { Member } from '../types';

interface NavbarProps {
  currentUser: Member;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'auctions', label: 'Guild Auctions', icon: Gavel },
    { id: 'my_auctions', label: 'My Bids & Loot', icon: Award },
    { id: 'levelup', label: 'Lv UP', icon: TrendingUp },
    ...(currentUser.role === 'admin' 
      ? [{ id: 'admin', label: 'Admin Panel', icon: UserCheck, adminOnly: true }] 
      : [])
  ];

  return (
    <nav className="bg-[#0a0c10] border-b border-cyan-500/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Guild Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Shield className="text-cyan-400 w-5 h-5 filter drop-shadow-[0_0_3px_rgba(6,182,212,0.3)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black font-sans text-slate-100 uppercase tracking-widest leading-none">
                tooburnt
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80 tracking-wider uppercase mt-1 leading-none">
                Raven 2 Clan
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`nav-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  {tab.label}
                  {tab.adminOnly && (
                    <span className="ml-1 text-[8px] bg-cyan-500/20 text-cyan-400 px-1 rounded border border-cyan-500/30">
                      ADM
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Points & Desktop User Info */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Guild Points Badge */}
            <div className="flex items-center gap-2 bg-[#121620] border border-cyan-500/20 px-3.5 py-1.5 rounded-xl min-w-[120px]">
              <Coins className="text-cyan-400 w-4 h-4 animate-pulse shrink-0" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono text-slate-500 uppercase leading-[1]">Balance</span>
                <span className="text-sm font-bold font-mono text-cyan-400 leading-[1.2] mt-0.5 whitespace-nowrap">
                  {currentUser.points.toLocaleString()} GP
                </span>
              </div>
            </div>

            {/* User Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              title="View & Edit Character Profile"
              className="flex items-center gap-2 pl-2 border-l border-slate-800 text-left hover:opacity-85 active:scale-95 transition-all cursor-pointer focus:outline-none"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full bg-[#161a24] border border-slate-750"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200 leading-[1] max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[9px] font-mono text-slate-500 leading-[1] mt-1">
                  {currentUser.class.split(' ')[0]} • <span className="text-cyan-400">{currentUser.rank}</span>
                </span>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              id="logout-btn"
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile menu button and quick points display */}
          <div className="flex md:hidden items-center gap-3">
            
            {/* Quick points item for mobile */}
            <div className="bg-[#121620] border border-cyan-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Coins className="text-cyan-400 w-3.5 h-3.5" />
              <span className="text-xs font-bold font-mono text-cyan-400">
                {currentUser.points} GP
              </span>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-0 cursor-pointer"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0c0e14] border-t border-slate-800/80"
          >
            <div className="px-2 pt-2 pb-4 space-y-1">
              
              {/* User profile row in mobile menu */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-[calc(100%-8px)] p-3 mb-2 bg-[#121620] hover:bg-slate-800/40 rounded-xl border border-slate-800/60 mx-1 cursor-pointer transition-all text-left focus:outline-none"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full bg-[#161a24] border border-slate-700"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-200">{currentUser.name}</span>
                  <span className="text-xs font-mono text-slate-500">
                    {currentUser.class} • <span className="text-cyan-400">{currentUser.rank}</span>
                  </span>
                </div>
              </button>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-950/20 border-l-2 border-cyan-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.adminOnly && (
                      <span className="ml-auto text-[8px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 font-mono">
                        ADM
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 mt-4 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
