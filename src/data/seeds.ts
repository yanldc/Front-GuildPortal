import { Member, Auction, GuildEvent, PointTransaction } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Yan Lemke',
    email: 'yanlemkedecastro@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yan',
    class: 'Vanguard',
    level: 72,
    rank: 'Leader',
    role: 'admin',
    points: 4250,
    joinedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'm2',
    name: 'BloodRage',
    email: 'bloodrage@guild.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Blood',
    class: 'Berserker',
    level: 68,
    rank: 'Officer',
    role: 'admin',
    points: 2450,
    joinedAt: '2026-01-12T15:30:00Z'
  },
  {
    id: 'm3',
    name: 'ShadowVixen',
    email: 'shadowvixen@guild.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow',
    class: 'Assassin',
    level: 67,
    rank: 'Elite',
    role: 'member',
    points: 1800,
    joinedAt: '2026-01-15T18:45:00Z'
  },
  {
    id: 'm4',
    name: 'ChronoMage',
    email: 'chronomage@guild.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chrono',
    class: 'Elementalist',
    level: 64,
    rank: 'Member',
    role: 'member',
    points: 980,
    joinedAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'm5',
    name: 'HolyShield',
    email: 'holyshield@guild.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shield',
    class: 'Divine Caster',
    level: 65,
    rank: 'Member',
    role: 'member',
    points: 750,
    joinedAt: '2026-02-05T14:20:00Z'
  },
  {
    id: 'm6',
    name: 'GoldDigger',
    email: 'golddigger@guild.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gold',
    class: 'Night Ranger',
    level: 59,
    rank: 'Recruit',
    role: 'member',
    points: 320,
    joinedAt: '2026-03-10T11:00:00Z'
  }
];

export const INITIAL_AUCTIONS: Auction[] = [
  {
    id: 'auc1',
    itemName: 'Longsword of the Dark Nightmare',
    itemGrade: 'legendary',
    minBid: 800,
    currentBid: 1550,
    currentWinnerId: 'm3',
    currentWinnerName: 'ShadowVixen',
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    createdBy: 'Yan Lemke',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=400&auto=format&fit=crop',
    description: 'Legendary physical high-DPS weapon obtained from Shadow Dragon Guild Boss. Chance to apply unholy bleed debuff on execution.',
    allowedClasses: ['any'],
    bids: [
      { id: 'b1', auctionId: 'auc1', memberId: 'm4', memberName: 'ChronoMage', amount: 800, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
      { id: 'b2', auctionId: 'auc1', memberId: 'm5', memberName: 'HolyShield', amount: 1000, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
      { id: 'b3', auctionId: 'auc1', memberId: 'm3', memberName: 'ShadowVixen', amount: 1550, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
    ]
  },
  {
    id: 'auc2',
    itemName: 'Dark Mithril Breastplate',
    itemGrade: 'heroic',
    minBid: 400,
    currentBid: 650,
    currentWinnerId: 'm5',
    currentWinnerName: 'HolyShield',
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 32).toISOString(),
    createdBy: 'BloodRage',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1627948386348-12cd27546fb4?q=80&w=400&auto=format&fit=crop',
    description: 'Heroic chestplate with high physical and magical defense attributes. Ideal for Paladins or Gladiators.',
    allowedClasses: ['Vanguard'],
    bids: [
      { id: 'b4', auctionId: 'auc2', memberId: 'm5', memberName: 'HolyShield', amount: 650, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() }
    ]
  },
  {
    id: 'auc3',
    itemName: "Raven's Sight Pendant",
    itemGrade: 'rare',
    minBid: 150,
    currentBid: 200,
    currentWinnerId: 'm6',
    currentWinnerName: 'GoldDigger',
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    createdBy: 'Yan Lemke',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
    description: 'Rare pendant granting +15 dexterity and increasing critical strike chance by 2%. Excellent gear for rangers or rogues.',
    allowedClasses: ['any'],
    bids: [
      { id: 'b5', auctionId: 'auc3', memberId: 'm6', memberName: 'GoldDigger', amount: 200, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() }
    ]
  },
  {
    id: 'auc4',
    itemName: 'Imperial Fire Scepter',
    itemGrade: 'legendary',
    minBid: 1200,
    currentBid: 2200,
    currentWinnerId: 'm2',
    currentWinnerName: 'BloodRage',
    endAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdBy: 'Yan Lemke',
    status: 'finished',
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=400&auto=format&fit=crop',
    description: 'Legendary elemental staff overflowing with ancient volcanic embers.',
    allowedClasses: ['Elementalist'],
    bids: [
      { id: 'b6', auctionId: 'auc4', memberId: 'm2', memberName: 'BloodRage', amount: 2200, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString() }
    ]
  }
];

export const INITIAL_EVENTS: GuildEvent[] = [
  {
    id: 'evt-rift-daily',
    title: 'Daily Rift (Rift)',
    type: 'rift',
    description: 'Fixed daily Rift for organized farming of refinement materials and guild prestige. Join the voice channel a few minutes early.',
    date: 'Daily at 22:30',
    status: 'upcoming',
    minLevel: 60,
    rewards: ['+30 GP Points', 'Refinement Material', 'Guild Credits'],
    rsvps: ['m1', 'm2', 'm3', 'm4', 'm5'],
    weekday: 'Every day',
    time: '22:30'
  },
  {
    id: 'evt-boss-t3',
    title: 'Guild Boss Elite T3',
    type: 'guild_dungeon',
    description: 'Daily Guild Boss T3 hunt. Essential for rare guild drops and transparent GP distribution.',
    date: 'Daily at 23:30',
    status: 'upcoming',
    minLevel: 60,
    rewards: ['+50 GP Points', 'Epic/Legendary Drops Chance', 'Clan Resources'],
    rsvps: ['m1', 'm2', 'm3', 'm5', 'm6'],
    weekday: 'Every day',
    time: '23:30'
  },
  {
    id: 'evt-gvg-sat',
    title: 'Territory War (GvG) Conquest',
    type: 'ancient_fortress',
    description: 'Territory conquest war on Saturdays. Bring maximum HP potions, damage, and defense buffs.',
    date: 'Saturday at 21:00',
    status: 'upcoming',
    minLevel: 65,
    rewards: ['+150 GP Points', 'Rare Conquest Chests', 'Clan Coins'],
    rsvps: ['m1', 'm2', 'm3', 'm4', 'm5'],
    weekday: 'Saturday',
    time: '21:00'
  },
  {
    id: 'evt-raid-sun',
    title: 'Weekly Raid: Midnight Dragon',
    type: 'world_boss',
    description: 'Grand guild Raid held on Sundays to defeat the Elder Dragon.',
    date: 'Sunday at 20:00',
    status: 'upcoming',
    minLevel: 62,
    rewards: ['+100 GP Points', 'Loot Raffle Winner', 'Activity GP Bonus'],
    rsvps: ['m1', 'm2', 'm3', 'm5'],
    weekday: 'Sunday',
    time: '20:00'
  }
];

export const INITIAL_TRANSACTIONS: PointTransaction[] = [
  {
    id: 't1',
    memberId: 'm3',
    memberName: 'ShadowVixen',
    amount: 100,
    reason: 'Reliable attendance and premier DPS output on weekly Raid Boss',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    type: 'add'
  },
  {
    id: 't2',
    memberId: 'm5',
    memberName: 'HolyShield',
    amount: 50,
    reason: 'Voluntary coaching and support for recruits on starter dungeon runs',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    type: 'add'
  },
  {
    id: 't3',
    memberId: 'm4',
    memberName: 'ChronoMage',
    amount: 150,
    reason: 'Purchased Epic Crystal Boots at previous Guild Auction',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    type: 'remove'
  },
  {
    id: 't4',
    memberId: 'm6',
    memberName: 'GoldDigger',
    amount: 80,
    reason: 'Contributed essential crafting materials directly to Clan Vault',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    type: 'add'
  }
];
