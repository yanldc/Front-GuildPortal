import React, { useState, useEffect } from 'react';
import { 
  Member, 
  Auction, 
  GuildEvent, 
  PointTransaction,
  UserRank,
  UserRole,
  INITIAL_MEMBERS,
  INITIAL_AUCTIONS,
  INITIAL_EVENTS,
  INITIAL_TRANSACTIONS
} from './types';
import LoginScreen from './components/LoginScreen';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EventsScreen from './components/EventsScreen';
import AuctionsScreen from './components/AuctionsScreen';
import MyAuctionsScreen from './components/MyAuctionsScreen';
import AdminPanel from './components/AdminPanel';
import ProfileScreen from './components/ProfileScreen';
import LevelUpScreen from './components/LevelUpScreen';

export default function App() {
  
  // -- Load state from localStorage with safe fallback --
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    try {
      const saved = localStorage.getItem('raven2_currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('raven2_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [auctions, setAuctions] = useState<Auction[]>(() => {
    try {
      const saved = localStorage.getItem('raven2_auctions');
      return saved ? JSON.parse(saved) : INITIAL_AUCTIONS;
    } catch {
      return INITIAL_AUCTIONS;
    }
  });

  const [events, setEvents] = useState<GuildEvent[]>(() => {
    try {
      const saved = localStorage.getItem('raven2_events');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [transactions, setTransactions] = useState<PointTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('raven2_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Direct reference to select an auction from dashboard quick actions
  const [activeAuctionIdFromDashboard, setActiveAuctionIdFromDashboard] = useState<string | null>(null);

  // -- Sincronização explícita com localStorage (Evita re-renders desnecessários de useEffects profundos) --
  const syncCurrentUser = (user: Member | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('raven2_currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('raven2_currentUser');
    }
  };

  const syncMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    localStorage.setItem('raven2_members', JSON.stringify(newMembers));
  };

  const syncAuctions = (newAuctions: Auction[]) => {
    setAuctions(newAuctions);
    localStorage.setItem('raven2_auctions', JSON.stringify(newAuctions));
  };

  const syncEvents = (newEvents: GuildEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('raven2_events', JSON.stringify(newEvents));
  };

  const syncTransactions = (newTransactions: PointTransaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('raven2_transactions', JSON.stringify(newTransactions));
  };

  // Login handler
  const handleLogin = (user: Member) => {
    // Verify if member exists in the members list
    const exists = members.find((m) => {
      if (user.email && m.email) {
        return m.email.toLowerCase() === user.email.toLowerCase();
      }
      return m.name.toLowerCase() === user.name.toLowerCase();
    });

    if (exists) {
      // Sync properties (e.g. level, rank, or avatar and points)
      const updatedList = members.map((m) => {
        const matches = (user.email && m.email)
          ? m.email.toLowerCase() === user.email.toLowerCase()
          : m.name.toLowerCase() === user.name.toLowerCase();

        if (matches) {
          return { 
            ...m, 
            name: user.name, 
            avatar: user.avatar,
            altNames: user.altNames || m.altNames 
          };
        }
        return m;
      });
      syncMembers(updatedList);
      // Ensure current logged in user has latest points from database list
      syncCurrentUser({ 
        ...user, 
        id: exists.id, 
        points: exists.points, 
        role: exists.role, 
        rank: exists.rank,
        level: exists.level,
        altNames: user.altNames || exists.altNames
      });
    } else {
      // Append brand new signup to roster
      const updatedList = [...members, user];
      syncMembers(updatedList);
      syncCurrentUser(user);
    }
    setActiveTab('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    syncCurrentUser(null);
  };

  // RSVP attendee confirmation toggle handler
  const handleRsvpChange = (eventId: string, isRsvped: boolean) => {
    if (!currentUser) return;

    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        let updatedRsvps = [...event.rsvps];
        if (isRsvped) {
          if (!updatedRsvps.includes(currentUser.id)) {
            updatedRsvps.push(currentUser.id);
          }
        } else {
          updatedRsvps = updatedRsvps.filter((id) => id !== currentUser.id);
        }
        return { ...event, rsvps: updatedRsvps };
      }
      return event;
    });

    syncEvents(updatedEvents);
  };

  // Bid placement handler with exact outbid-refund and transaction records
  const handlePlaceBid = (auctionId: string, amount: number) => {
    if (!currentUser) return;

    const targetAuction = auctions.find((a) => a.id === auctionId);
    if (!targetAuction) return;

    // 30 seconds spam check (state level safety check)
    let lastBidTime: number | null = null;
    auctions.forEach((a) => {
      a.bids.forEach((b) => {
        if (b.memberId === currentUser.id) {
          const t = new Date(b.timestamp).getTime();
          if (lastBidTime === null || t > lastBidTime) {
            lastBidTime = t;
          }
        }
      });
    });

    if (lastBidTime !== null && (Date.now() - lastBidTime) < 30000) {
      console.warn('Spam protection: Bid rejected due to less than 30 seconds gap.');
      return;
    }

    const previousWinnerId = targetAuction.currentWinnerId;
    const previousBidAmount = targetAuction.currentBid;
    const previousWinnerName = targetAuction.currentWinnerName;

    // Build the new bid structure
    const newBidObj = {
      id: 'bid-' + Date.now(),
      auctionId,
      memberId: currentUser.id,
      memberName: currentUser.name,
      amount,
      timestamp: new Date().toISOString()
    };

    let updatedMembers = [...members];
    let listTransactions = [...transactions];

    // 1. Refund the previous highest bidder (if someone was winning)
    if (previousWinnerId) {
      updatedMembers = updatedMembers.map((m) => {
        if (m.id === previousWinnerId) {
          return { ...m, points: m.points + previousBidAmount };
        }
        return m;
      });

      // Point refund log
      listTransactions.push({
        id: 'refund-' + Date.now() + '-b',
        memberId: previousWinnerId,
        memberName: previousWinnerName || 'Clan Member',
        amount: previousBidAmount,
        reason: `Refund for outbid item: ${targetAuction.itemName}`,
        timestamp: new Date().toISOString(),
        type: 'add'
      });
    }

    // 2. Deduct points from the new highest bidder (the current user)
    updatedMembers = updatedMembers.map((m) => {
      if (m.id === currentUser.id) {
        const newPointsValue = Math.max(0, m.points - amount);
        // Sync logged in user points state immediately
        syncCurrentUser({ ...currentUser, points: newPointsValue });
        return { ...m, points: newPointsValue };
      }
      return m;
    });

    // Point deduction log
    listTransactions.push({
      id: 'deduct-' + Date.now() + '-b',
      memberId: currentUser.id,
      memberName: currentUser.name,
      amount,
      reason: `Bid placed on auction item: ${targetAuction.itemName}`,
      timestamp: new Date().toISOString(),
      type: 'remove'
    });

    // 3. Update the target auction details
    const updatedAuctions = auctions.map((auc) => {
      if (auc.id === auctionId) {
        return {
          ...auc,
          currentBid: amount,
          currentWinnerId: currentUser.id,
          currentWinnerName: currentUser.name,
          bids: [...auc.bids, newBidObj]
        };
      }
      return auc;
    });

    // Save states to stores
    syncMembers(updatedMembers);
    syncTransactions(listTransactions);
    syncAuctions(updatedAuctions);
  };

  // Admin: Register a new loot auction
  const handleCreateAuction = (newAuctionDetails: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) => {
    if (!currentUser) return;

    const newAuction: Auction = {
      ...newAuctionDetails,
      id: 'auc-' + Date.now(),
      currentBid: newAuctionDetails.minBid,
      currentWinnerId: null,
      currentWinnerName: 'None',
      createdBy: currentUser.name,
      status: 'active',
      bids: []
    };

    syncAuctions([...auctions, newAuction]);
  };

  // Admin: Allocate points to user individually (+ logs)
  const handleUpdatePoints = (memberId: string, amount: number, type: 'add' | 'remove', reason: string) => {
    const targetM = members.find((m) => m.id === memberId);
    if (!targetM) return;

    // Calculate points variation
    let pDiff = amount;
    const finalPoints = type === 'add' ? targetM.points + pDiff : Math.max(0, targetM.points - pDiff);

    // Save logs
    const newTx: PointTransaction = {
      id: 'tx-' + Date.now(),
      memberId,
      memberName: targetM.name,
      amount,
      reason,
      timestamp: new Date().toISOString(),
      type
    };

    const updatedMembersList = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, points: finalPoints };
      }
      return m;
    });

    // If point update targets the current user, sync their profile points immediately
    if (currentUser && currentUser.id === memberId) {
      syncCurrentUser({ ...currentUser, points: finalPoints });
    }

    syncMembers(updatedMembersList);
    syncTransactions([...transactions, newTx]);
  };

  // Admin: Allocate points to multiple users simultaneously
  const handleUpdatePointsBulk = (memberIds: string[], amount: number, type: 'add' | 'remove', reason: string) => {
    let updatedMembersList = [...members];
    const newTxs: PointTransaction[] = [];
    const timestamp = new Date().toISOString();

    memberIds.forEach((memberId, idx) => {
      const targetM = updatedMembersList.find((m) => m.id === memberId);
      if (!targetM) return;

      const finalPoints = type === 'add' ? targetM.points + amount : Math.max(0, targetM.points - amount);
      
      // Update inside the list copy
      updatedMembersList = updatedMembersList.map((m) => {
        if (m.id === memberId) {
          return { ...m, points: finalPoints };
        }
        return m;
      });

      newTxs.push({
        id: 'tx-' + Date.now() + '-' + idx,
        memberId,
        memberName: targetM.name,
        amount,
        reason,
        timestamp,
        type
      });

      if (currentUser && currentUser.id === memberId) {
        currentUser.points = finalPoints;
      }
    });

    if (currentUser && memberIds.includes(currentUser.id)) {
      syncCurrentUser({ ...currentUser, points: currentUser.points });
    }

    syncMembers(updatedMembersList);
    syncTransactions([...transactions, ...newTxs]);
  };

  // Admin: Change Rank, promotion or role permission level
  const handleUpdateMemberRole = (memberId: string, role: UserRole, rank: UserRank) => {
    const updatedList = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, role, rank };
      }
      return m;
    });

    // If change targets current logged user, sync layout instantly
    if (currentUser && currentUser.id === memberId) {
      syncCurrentUser({ ...currentUser, role, rank });
      // If administrative privilege is revoked from currently logged user, redirect them to dashboard
      if (role !== 'admin' && activeTab === 'admin') {
        setActiveTab('dashboard');
      }
    }

    syncMembers(updatedList);
  };

  // Admin: Append/join new invited member
  const handleAddMember = (newMember: Member) => {
    const updatedList = [...members, newMember];
    syncMembers(updatedList);

    // Automatically create a track point transaction for their start points
    if (newMember.points > 0) {
       const newTx: PointTransaction = {
         id: 'tx-start-' + Date.now(),
         memberId: newMember.id,
         memberName: newMember.name,
         amount: newMember.points,
         reason: 'Initial GP Enlistment Reward',
         timestamp: new Date().toISOString(),
         type: 'add'
       };
       syncTransactions([...transactions, newTx]);
    }
  };

  // Handle user updating their RPG stats and registration details
  const handleUpdateProfile = (updatedUser: Member) => {
    syncCurrentUser(updatedUser);

    // Also cascade update into list of members to save in database roster
    const updatedList = members.map((m) => {
      if (m.id === updatedUser.id) {
        return updatedUser;
      }
      return m;
    });
    syncMembers(updatedList);
  };

  // Navigate to auctions screen and select a specific item
  const handleSetSelectedAuctionId = (id: string | null) => {
    setActiveAuctionIdFromDashboard(id);
  };

  const clearActiveAuctionId = () => {
    setActiveAuctionIdFromDashboard(null);
  };

  // Render components according to active tab
  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            members={members}
            auctions={auctions}
            events={events}
            onRsvpChange={handleRsvpChange}
            setActiveTab={setActiveTab}
            setSelectedAuctionId={handleSetSelectedAuctionId}
          />
        );
      case 'events':
        return (
          <EventsScreen
            currentUser={currentUser}
            members={members}
            events={events}
            onRsvpChange={handleRsvpChange}
            onUpdateEvents={syncEvents}
          />
        );
      case 'auctions':
        return (
          <AuctionsScreen
            currentUser={currentUser}
            auctions={auctions}
            onPlaceBid={handlePlaceBid}
            onCreateAuction={handleCreateAuction}
            activeAuctionIdFromDashboard={activeAuctionIdFromDashboard}
            clearActiveAuctionId={clearActiveAuctionId}
          />
        );
      case 'my_auctions':
        return (
          <MyAuctionsScreen
            currentUser={currentUser}
            auctions={auctions}
            onPlaceBid={handlePlaceBid}
          />
        );
      case 'levelup':
        return (
          <LevelUpScreen
            currentUser={currentUser}
          />
        );
      case 'admin':
        if (currentUser.role !== 'admin') {
          setActiveTab('dashboard');
          return null;
        }
        return (
          <AdminPanel
            currentUser={currentUser}
            members={members}
            transactions={transactions}
            onAddMember={handleAddMember}
            onUpdatePoints={handleUpdatePoints}
            onUpdatePointsBulk={handleUpdatePointsBulk}
            onUpdateMemberRole={handleUpdateMemberRole}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[#06080B] font-sans antialiased">
      {currentUser ? (
        <div className="flex flex-col min-h-screen">
          <Navbar 
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
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
