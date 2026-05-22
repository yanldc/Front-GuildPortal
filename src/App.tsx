import { useState, useEffect } from 'react';
import { Member, Auction, UserRank, UserRole } from './types';
import { useAuth } from './hooks/useAuth';
import { useMembers } from './hooks/useMembers';
import { useAuctions } from './hooks/useAuctions';
import { useEvents } from './hooks/useEvents';
import { useTransactions } from './hooks/useTransactions';
import { useToast } from './hooks/useToast';
import { useWebSocket } from './hooks/useWebSocket';
import { auctionsService } from './services/auctions';
import { eventsService } from './services/events';
import { transactionsService } from './services/transactions';
import { membersService } from './services/members';
import { getClassAvatar } from './utils/classAvatar';
import LoginScreen from './components/LoginScreen';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EventsScreen from './components/events/EventsScreen';
import AuctionsScreen from './components/auctions/AuctionsScreen';
import MyAuctionsScreen from './components/MyAuctionsScreen';
import AdminPanel from './components/admin/AdminPanel';
import ProfileScreen from './components/ProfileScreen';
import LevelUpScreen from './components/levelup/LevelUpScreen';
import ToastContainer from './components/ToastContainer';

export default function App() {
  const { currentUser, login, logout, refreshUser, loading } = useAuth();
  const { members, fetchMembers } = useMembers();
  const { auctions, fetchAuctions } = useAuctions();
  const { events, fetchEvents } = useEvents();
  const { transactions, fetchTransactions } = useTransactions();
  const { toasts, addToast, removeToast } = useToast();

  // Real-time updates via WebSocket
  useWebSocket({
    'auctions:updated': fetchAuctions,
    'events:updated': fetchEvents,
    'members:updated': fetchMembers,
    'transactions:updated': fetchTransactions,
  }, !!currentUser);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeAuctionIdFromDashboard, setActiveAuctionIdFromDashboard] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchMembers();
      fetchAuctions();
      fetchEvents();
      fetchTransactions();
    }
  }, [currentUser, fetchMembers, fetchAuctions, fetchEvents, fetchTransactions]);

  const handleLogin = async (user: Member) => {
    const email = user.email || user.name;
    await login(email);
    setActiveTab('dashboard');
  };

  const handleRsvpChange = async (eventId: string, _isRsvped?: boolean) => {
    try {
      await eventsService.toggleRsvp(eventId);
      fetchEvents();
    } catch (e: any) {
      addToast(e.message || 'Failed to update RSVP', 'error');
    }
  };

  const handlePlaceBid = async (auctionId: string, amount: number) => {
    try {
      await auctionsService.placeBid(auctionId, amount);
      addToast(`Bid of ${amount} GP placed successfully!`, 'success');
      fetchAuctions();
      fetchTransactions();
      refreshUser();
    } catch (e: any) {
      addToast(e.message || 'Failed to place bid', 'error');
    }
  };

  const handleCreateAuction = async (details: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) => {
    try {
      await auctionsService.create(details);
      addToast('Auction created successfully!', 'success');
      fetchAuctions();
    } catch (e: any) {
      addToast(e.message || 'Failed to create auction', 'error');
    }
  };

  const handleUpdatePoints = async (memberId: string, amount: number, type: 'add' | 'remove', reason: string) => {
    try {
      await transactionsService.adjust({ memberId, amount, type, reason });
      addToast(`${amount} GP ${type === 'add' ? 'added' : 'removed'} successfully`, 'success');
      fetchMembers();
      fetchTransactions();
      if (currentUser?.id === memberId) refreshUser();
    } catch (e: any) {
      addToast(e.message || 'Failed to adjust points', 'error');
    }
  };

  const handleUpdatePointsBulk = async (memberIds: string[], amount: number, type: 'add' | 'remove', reason: string) => {
    try {
      await transactionsService.bulkAdjust({ memberIds, amount, type, reason });
      addToast(`Bulk ${type}: ${amount} GP applied to ${memberIds.length} members`, 'success');
      fetchMembers();
      fetchTransactions();
      if (currentUser && memberIds.includes(currentUser.id)) refreshUser();
    } catch (e: any) {
      addToast(e.message || 'Failed to bulk adjust points', 'error');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: UserRole, rank: UserRank) => {
    try {
      await membersService.updateRole(memberId, { role, rank });
      addToast('Member role updated', 'success');
      fetchMembers();
      if (currentUser?.id === memberId) {
        const updated = await refreshUser();
        if (updated.role !== 'admin' && activeTab === 'admin') setActiveTab('dashboard');
      }
    } catch (e: any) {
      addToast(e.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await membersService.delete(memberId);
      addToast('Member permanently removed from roster', 'success');
      fetchMembers();
      fetchTransactions();
    } catch (e: any) {
      addToast(e.message || 'Failed to delete member', 'error');
    }
  };

  const handleUpdateEvents = async () => {
    fetchEvents();
  };

  const handleUpdateProfile = async (updatedUser: Member) => {
    try {
      await membersService.updateProfile(updatedUser.id, {
        name: updatedUser.name,
        avatar: getClassAvatar(updatedUser.class),
        class: updatedUser.class,
        guild: updatedUser.guild,
        level: updatedUser.level,
        altNames: updatedUser.altNames,
        rpgProfile: updatedUser.rpgProfile,
      });
      addToast('Profile updated successfully!', 'success');
      refreshUser();
      fetchMembers();
    } catch (e: any) {
      addToast(e.message || 'Failed to update profile', 'error');
    }
  };

  const renderTabContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} members={members} auctions={auctions} events={events} onRsvpChange={handleRsvpChange} setActiveTab={setActiveTab} setSelectedAuctionId={setActiveAuctionIdFromDashboard} />;
      case 'events':
        return <EventsScreen currentUser={currentUser} members={members} events={events} onRsvpChange={handleRsvpChange} onUpdateEvents={handleUpdateEvents} />;
      case 'auctions':
        return <AuctionsScreen currentUser={currentUser} auctions={auctions} onPlaceBid={handlePlaceBid} onCreateAuction={handleCreateAuction} activeAuctionIdFromDashboard={activeAuctionIdFromDashboard} clearActiveAuctionId={() => setActiveAuctionIdFromDashboard(null)} />;
      case 'my_auctions':
        return <MyAuctionsScreen currentUser={currentUser} auctions={auctions} onPlaceBid={handlePlaceBid} />;
      case 'levelup':
        return <LevelUpScreen currentUser={currentUser} />;
      case 'admin':
        if (currentUser.role !== 'admin') { setActiveTab('dashboard'); return null; }
        return <AdminPanel currentUser={currentUser} members={members} transactions={transactions} onAddMember={(_member: Member) => fetchMembers()} onUpdatePoints={handleUpdatePoints} onUpdatePointsBulk={handleUpdatePointsBulk} onUpdateMemberRole={handleUpdateMemberRole} onDeleteMember={handleDeleteMember} />;
      case 'profile':
        return <ProfileScreen currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06080B] text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 bg-[#06080B] font-sans antialiased">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {currentUser ? (
        <div className="flex flex-col min-h-screen">
          <Navbar currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderTabContent()}
          </main>
          <footer className="py-6 border-t border-slate-900 bg-[#07090F] shrink-0 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wide">
            <div>Guild Coordination Platform • tooburnnt Raven 2</div>
            <div className="mt-1 text-[9px] text-slate-600">© 2026 tooburnnt. All rights reserved.</div>
          </footer>
        </div>
      ) : (
        <LoginScreen onLogin={handleLogin} members={members} />
      )}
    </div>
  );
}
