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
  mainWeapon?: GearItem;
  gloves?: GearItem;
  cape?: GearItem;
  helmet?: GearItem;
  chest?: GearItem;
  pants?: GearItem;
  boots?: GearItem;
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
  endAt: string;
  createdBy: string;
  status: 'active' | 'finished';
  bids: Bid[];
  imageUrl: string;
  description?: string;
  allowedClasses?: string[];
  allowedGuilds?: string[];
}

export type GuildEventType = 'world_boss' | 'rift' | 'guild_dungeon' | 'ancient_fortress' | 'clash' | 'abyss_boss';

export interface GuildEvent {
  id: string;
  title: string;
  type: GuildEventType;
  description: string;
  date: string;
  status: 'upcoming' | 'completed';
  minLevel: number;
  rewards: string[];
  rsvps: string[];
  weekday?: string;
  time?: string;
  allowedGuilds?: string[];
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
  weekday: string;
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
  weekday: string;
  createdAt: string;
}
