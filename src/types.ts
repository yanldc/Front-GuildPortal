/**
 * Types and Initial Data for Raven 2 Guild Management - tooburnnt
 */

export type UserRole = 'admin' | 'member';

export type UserRank = 'Leader' | 'Officer' | 'Elite' | 'Member' | 'Recruit';

export interface GearItem {
  preset: string;
  refinement: string;
}

export interface RPGProfile {
  atk?: number;
  def?: number;
  acc?: number;
  itemsCollection?: string;
  garmentCollection?: string;
  familiarCollection?: string;
  riftFloor?: string;
  towerFloor?: string;
  mainQuest?: string;
  
  // Gear
  mainWeapon?: GearItem;
  gloves?: GearItem;
  cape?: GearItem;
  helmet?: GearItem;
  chest?: GearItem;
  pants?: GearItem;
  boots?: GearItem;

  // Jewelry & Accessories
  lEarrings?: GearItem;
  rEarrings?: GearItem;
  necklace?: GearItem;
  belt?: GearItem;
  lBracelet?: GearItem;
  rBracelet?: GearItem;
  lRing?: GearItem;
  rRing?: GearItem;
  toten?: GearItem;
  seal?: GearItem;

  // Symbols
  riftHunterSymbol?: GearItem;
  honorableSymbol?: GearItem;
  dimensionalWanderersSymbol?: GearItem;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  class: string;
  level: number;
  rank: UserRank;
  role: UserRole;
  points: number;
  joinedAt: string;
  altNames?: string[];
  rpgProfile?: RPGProfile;
  guild?: string;
}

export type ItemGrade = 'rare' | 'heroic' | 'legendary';

export interface Bid {
  id: string;
  auctionId: string;
  memberId: string;
  memberName: string;
  amount: number;
  timestamp: string;
}

export interface Auction {
  id: string;
  itemName: string;
  itemGrade: ItemGrade;
  minBid: number;
  currentBid: number;
  currentWinnerId: string | null;
  currentWinnerName: string | null;
  endAt: string; // ISO string
  createdBy: string;
  status: 'active' | 'finished';
  bids: Bid[];
  imageUrl: string;
  description?: string;
  allowedClasses?: string[]; // array of classes allowed, if ['any'] or empty, any class can bid
}

export type GuildEventType = 'world_boss' | 'rift' | 'guild_dungeon' | 'ancient_fortress' | 'clash' | 'abyss_boss';

export interface GuildEvent {
  id: string;
  title: string;
  type: GuildEventType;
  description: string;
  date: string; // ISO or human-readable
  status: 'upcoming' | 'completed';
  minLevel: number;
  rewards: string[];
  rsvps: string[]; // memberIds
  weekday?: string; // 'Segunda-feira', 'Terça-feira', etc., or 'Todos os dias'
  time?: string; // e.g. '22:30'
}

export interface PointTransaction {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  reason: string;
  timestamp: string;
  type: 'add' | 'remove';
}

// Preset images representing item artworks
export const ITEM_PRESETS = [
  {
    name: 'Legendary Sword of Eclipse',
    url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=300&auto=format&fit=crop',
    grade: 'legendary' as ItemGrade
  },
  {
    name: "Arcanist's Ice Staff",
    url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=300&auto=format&fit=crop',
    grade: 'heroic' as ItemGrade
  },
  {
    name: 'Shadow Raven Helm',
    url: 'https://images.unsplash.com/photo-1627948386348-12cd27546fb4?q=80&w=300&auto=format&fit=crop',
    grade: 'heroic' as ItemGrade
  },
  {
    name: 'Ring of Absolute Power',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop',
    grade: 'legendary' as ItemGrade
  },
  {
    name: 'Voracious Assassin Boots',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop',
    grade: 'rare' as ItemGrade
  },
  {
    name: 'Howling Wind Bow',
    url: 'https://images.unsplash.com/photo-1609144416181-ed0c18d184eb?q=80&w=300&auto=format&fit=crop',
    grade: 'heroic' as ItemGrade
  }
];

export const CLASSES_RAVEN2 = [
  'Assassin',
  'Night Ranger',
  'Berserker',
  'Deathbringer',
  'Divine Caster',
  'Elementalist',
  'Destroyer',
  'Gunslinger',
  'Vanguard',
  'Warlord'
];

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
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18h from now
    createdBy: 'Yan Lemke',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=400&auto=format&fit=crop',
    description: 'Legendary physical high-DPS weapon obtained from Shadow Dragon Guild Boss. Chance to apply unholy bleed debuff on execution.',
    allowedClasses: ['any'],
    bids: [
      {
        id: 'b1',
        auctionId: 'auc1',
        memberId: 'm4',
        memberName: 'ChronoMage',
        amount: 800,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      },
      {
        id: 'b2',
        auctionId: 'auc1',
        memberId: 'm5',
        memberName: 'HolyShield',
        amount: 1000,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
      },
      {
        id: 'b3',
        auctionId: 'auc1',
        memberId: 'm3',
        memberName: 'ShadowVixen',
        amount: 1550,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
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
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 32).toISOString(), // 32h from now
    createdBy: 'BloodRage',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1627948386348-12cd27546fb4?q=80&w=400&auto=format&fit=crop',
    description: 'Heroic chestplate with high physical and magical defense attributes. Ideal for Paladins or Gladiators.',
    allowedClasses: ['Vanguard'],
    bids: [
      {
        id: 'b4',
        auctionId: 'auc2',
        memberId: 'm5',
        memberName: 'HolyShield',
        amount: 650,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
      }
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
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4h from now
    createdBy: 'Yan Lemke',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
    description: 'Rare pendant granting +15 dexterity and increasing critical strike chance by 2%. Excellent gear for rangers or rogues.',
    allowedClasses: ['any'],
    bids: [
      {
        id: 'b5',
        auctionId: 'auc3',
        memberId: 'm6',
        memberName: 'GoldDigger',
        amount: 200,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
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
    endAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // Terminated 12h ago
    createdBy: 'Yan Lemke',
    status: 'finished',
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=400&auto=format&fit=crop',
    description: 'Legendary elemental staff overflowing with ancient volcanic embers.',
    allowedClasses: ['Elementalist'],
    bids: [
      {
        id: 'b6',
        auctionId: 'auc4',
        memberId: 'm2',
        memberName: 'BloodRage',
        amount: 2200,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString()
      }
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

export interface LevelUpEnroll {
  joinedById: string;
  joinedByName: string;
  characterName: string;
  isAlt: boolean;
}

export interface LevelUpRequest {
  id: string;
  title: string;
  time: string;
  weekday: string; // e.g. 'Monday', 'Every day', etc.
  createdBy: string;
  createdByName: string;
  class: string;
  slots: LevelUpEnroll[];
  createdAt: string;
}

export interface LevelUpHelper {
  id: string;
  memberId: string;
  memberOriginalName: string;
  characterName: string;
  class: string;
  isAlt: boolean;
  availability: string;
  weekday: string; // e.g. 'Monday', 'Every day', etc.
  createdAt: string;
}

