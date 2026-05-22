import { useState } from 'react';
import { Member, Auction, PointTransaction, UserRank, UserRole } from './types';
import { useAuth } from './hooks/useAuth';
import { useMembers } from './hooks/useMembers';
import { useAuctions } from './hooks/useAuctions';
import { useEvents } from './hooks/useEvents';
import { useTransactions } from './hooks/useTransactions';
import LoginScreen from './components/LoginScreen';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EventsScreen from './components/events/EventsScreen';
import AuctionsScreen from './components/auctions/AuctionsScreen';
import MyAuctionsScreen from './components/MyAuctionsScreen';
import AdminPanel from './components/admin/AdminPanel';
import ProfileScreen from './components/ProfileScreen';
import LevelUpScreen from './components/levelup/LevelUpScreen';

export default function App() {
  const { currentUser, syncCurrentUser, logout } = useAuth();
  const { members, syncMembers } = useMembers();
  const { auctions, syncAuctions } = useAuctions();
  const { events, syncEvents } = useEvents();
  const { transactions, syncTransactions } = useTransactions();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeAuctionIdFromDashboard, setActiveAuctionIdFromDashboard] = useState<string | null>(null);

  // Login handler
  const handleLogin = (user: Member) => {
    const exists = members.find((m) => {
      if (user.email && m.email) return m.email.toLowerCase() === user.email.toLowerCase();
      return m.name.toLowerCase() === user.name.toLowerCase();
    });

    if (exists) {
      const updatedList = members.map((m) => {
        const matches = (user.email && m.email)
          ? m.email.toLowerCase() === user.email.toLowerCase()
          : m.name.toLowerCase() === user.name.toLowerCase();
        if (matches) return { ...m, name: user.name, avatar: user.avatar, altNames: user.altNames || m.altNames };
        return m;
      });
      syncMembers(updatedList);
      syncCurrentUser({ ...user, id: exists.id, points: exists.points, role: exists.role, rank: exists.rank, level: exists.level, altNames: user.altNames || exists.altNames });
    } else {
      syncMembers([...members, user]);
      syncCurrentUser(user);
    }
    setActiveTab('dashboard');
  };

  // RSVP handler
  const handleRsvpChange = (eventId: string, isRsvped: boolean) => {
    if (!currentUser) return;
    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        let updatedRsvps = [...event.rsvps];
        if (isRsvped) {
          if (!updatedRsvps.includes(currentUser.id)) updatedRsvps.push(currentUser.id);
        } else {
          updatedRsvps = updatedRsvps.filter((id) => id !== currentUser.id);
        }
        return { ...event, rsvps: updatedRsvps };
      }
      return event;
    });
    syncEvents(updatedEvents);
  };

  // Bid placement handler
  const handlePlaceBid = (auctionId: string, amount: number) => {
    if (!currentUser) return;
    const targetAuction = auctions.find((a) => a.id === auctionId);
    if (!targetAuction) return;

    // Spam check
    let lastBidTime: number | null = null;
    auctions.forEach((a) => {
      a.bids.forEach((b) => {
        if (b.memberId === currentUser.id) {
          const t = new Date(b.timestamp).getTime();
          if (lastBidTime === null || t > lastBidTime) lastBidTime = t;
        }
      });
    });
    if (lastBidTime !== null && (Date.now() - lastBidTime) < 30000) return;

    const previousWinnerId = targetAuction.currentWinnerId;
    const previousBidAmount = targetAuction.currentBid;
    const previousWinnerName = targetAuction.currentWinnerName;

    const newBidObj = { id: 'bid-' + Date.now(), auctionId, memberId: currentUser.id, memberName: currentUser.name, amount, timestamp: new Date().toISOString() };

    let updatedMembers = [...members];
    let listTransactions = [...transactions];

    // Refund previous winner
    if (previousWinnerId) {
      updatedMembers = updatedMembers.map((m) => m.id === previousWinnerId ? { ...m, points: m.points + previousBidAmount } : m);
      listTransactions.push({ id: 'refund-' + Date.now() + '-b', memberId: previousWinnerId, memberName: previousWinnerName || 'Clan Member', amount: previousBidAmount, reason: `Refund for outbid item: ${targetAuction.itemName}`, timestamp: new Date().toISOString(), type: 'add' });
    }

    // Deduct from current user
    updatedMembers = updatedMembers.map((m) => {
      if (m.id === currentUser.id) {
        const newPoints = Math.max(0, m.points - amount);
        syncCurrentUser({ ...currentUser, points: newPoints });
        return { ...m, points: newPoints };
      }
      return m;
    });
    listTransactions.push({ id: 'deduct-' + Date.now() + '-b', memberId: currentUser.id, memberName: currentUser.name, amount, reason: `Bid placed on auction item: ${targetAuction.itemName}`, timestamp: new Date().toISOString(), type: 'remove' });

    // Update auction
    const updatedAuctions = auctions.map((auc) => {
      if (auc.id === auctionId) return { ...auc, currentBid: amount, currentWinnerId: currentUser.id, currentWinnerName: currentUser.name, bids: [...auc.bids, newBidObj] };
      return auc;
    });

    syncMembers(updatedMembers);
    syncTransactions(listTransactions);
    syncAuctions(updatedAuctions);
  };

  // Create auction
  const handleCreateAuction = (newAuctionDetails: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) => {
    if (!currentUser) return;
    const newAuction: Auction = { ...newAuctionDetails, id: 'auc-' + Date.now(), currentBid: newAuctionDetails.minBid, currentWinnerId: null, currentWinnerName: 'None', createdBy: currentUser.name, status: 'active', bids: [] };
    syncAuctions([...auctions, newAuction]);
  };

  // Update points (single)
  const handleUpdatePoints = (memberId: string, amount: number, type: 'add' | 'remove', reason: string) => {
    const targetM = members.find((m) => m.id === memberId);
    if (!targetM) return;
    const finalPoints = type === 'add' ? targetM.points + amount : Math.max(0, targetM.points - amount);
    const newTx: PointTransaction = { id: 'tx-' + Date.now(), memberId, memberName: targetM.name, amount, reason, timestamp: new Date().toISOString(), type };
    const updatedMembersList = members.map((m) => m.id === memberId ? { ...m, points: finalPoints } : m);
    if (currentUser && currentUser.id === memberId) syncCurrentUser({ ...currentUser, points: finalPoints });
    syncMembers(updatedMembersList);
    syncTransactions([...transactions, newTx]);
  };

  // Update points (bulk)
  const handleUpdatePointsBulk = (memberIds: string[], amount: number, type: 'add' | 'remove', reason: string) => {
    let updatedMembersList = [...members];
    const newTxs: PointTransaction[] = [];
    const timestamp = new Date().toISOString();

    memberIds.forEach((memberId, idx) => {
      const targetM = updatedMembersList.find((m) => m.id === memberId);
      if (!targetM) return;
      const finalPoints = type === 'add' ? targetM.points + amount : Math.max(0, targetM.points - amount);
      updatedMembersList = updatedMembersList.map((m) => m.id === memberId ? { ...m, points: finalPoints } : m);
      newTxs.push({ id: 'tx-' + Date.now() + '-' + idx, memberId, memberName: targetM.name, amount, reason, timestamp, type });
      if (currentUser && currentUser.id === memberId) syncCurrentUser({ ...currentUser, points: finalPoints });
    });

    syncMembers(updatedMembersList);
    syncTransactions([...transactions, ...newTxs]);
  };

  // Update member role
  const handleUpdateMemberRole = (memberId: string, role: UserRole, rank: UserRank) => {
    const updatedList = members.map((m) => m.id === memberId ? { ...m, role, rank } : m);
    if (currentUser && currentUser.id === memberId) {
      syncCurrentUser({ ...currentUser, role, rank });
      if (role !== 'admin' && activeTab === 'admin') setActiveTab('dashboard');
    }
    syncMembers(updatedList);
  };

  // Add member
  const handleAddMember = (newMember: Member) => {
    syncMembers([...members, newMember]);
    if (newMember.points > 0) {
      syncTransactions([...transactions, { id: 'tx-start-' + Date.now(), memberId: newMember.id, memberName: newMember.name, amount: newMember.points, reason: 'Initial GP Enlistment Reward', timestamp: new Date().toISOString(), type: 'add' }]);
    }
  };

  // Update profile
  const handleUpdateProfile = (updatedUser: Member) => {
    syncCurrentUser(updatedUser);
    syncMembers(members.map((m) => m.id === updatedUser.id ? updatedUser : m));
  };

  const renderTabContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} members={members} auctions={auctions} events={events} onRsvpChange={handleRsvpChange} setActiveTab={setActiveTab} setSelectedAuctionId={setActiveAuctionIdFromDashboard} />;
      case 'events':
        return <EventsScreen currentUser={currentUser} members={members} events={events} onRsvpChange={handleRsvpChange} onUpdateEvents={syncEvents} />;
      case 'auctions':
        return <AuctionsScreen currentUser={currentUser} auctions={auctions} onPlaceBid={handlePlaceBid} onCreateAuction={handleCreateAuction} activeAuctionIdFromDashboard={activeAuctionIdFromDashboard} clearActiveAuctionId={() => setActiveAuctionIdFromDashboard(null)} />;
      case 'my_auctions':
        return <MyAuctionsScreen currentUser={currentUser} auctions={auctions} onPlaceBid={handlePlaceBid} />;
      case 'levelup':
        return <LevelUpScreen currentUser={currentUser} />;
      case 'admin':
        if (currentUser.role !== 'admin') { setActiveTab('dashboard'); return null; }
        return <AdminPanel currentUser={currentUser} members={members} transactions={transactions} onAddMember={handleAddMember} onUpdatePoints={handleUpdatePoints} onUpdatePointsBulk={handleUpdatePointsBulk} onUpdateMemberRole={handleUpdateMemberRole} />;
      case 'profile':
        return <ProfileScreen currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[#06080B] font-sans antialiased">
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
