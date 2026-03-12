export type QuestCategory =
  | 'health'
  | 'career'
  | 'education'
  | 'personal'
  | 'finance'
  | 'relationships';

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  photo?: string;
  xpReward: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  milestones: Milestone[];
  createdAt: string;
  completedAt?: string;
  mapPosition: { x: number; y: number };
  color: string;
  mapIcon?: string;           // current displayed icon (emoji fallback)
  islandImageUrl?: string;    // AI-generated island image (base64 data URI)
  questMascotUrl?: string;    // AI-generated mascot image for this quest
  suggestedAssets?: string[]; // Gemini-generated asset options
  assetChanges?: number;      // times user has changed the icon
  assetLocked?: boolean;      // true after 1 user change
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate: string;
  totalQuestsCompleted: number;
  badges: Badge[];
  buddyMascotId: string;
  mascotImageUrl?: string;    // AI-generated base mascot image
  buddyEquipped: {
    hat?: string;
    outfit?: string;
    accessory?: string;
  };
}

export interface ChatPlan {
  questTitle: string;
  category: QuestCategory;
  steps: string[];
  newStepIndex?: number; // index of newly added step (for highlighting)
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  plan?: ChatPlan; // optional plan attached to assistant messages
}

export interface Notification {
  id: string;
  type: 'milestone' | 'badge' | 'streak' | 'levelup' | 'tip';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface AppState {
  user: User;
  quests: Quest[];
  messages: Message[];
  notifications: Notification[];
  hasOnboarded: boolean;
}

export type AppAction =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'SET_ONBOARDED' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_QUEST'; payload: Quest }
  | { type: 'DELETE_QUEST'; payload: { questId: string } }
  | { type: 'COMPLETE_MILESTONE'; payload: { questId: string; milestoneId: string } }
  | { type: 'ADD_MILESTONE_PHOTO'; payload: { questId: string; milestoneId: string; uri: string } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'UNLOCK_BADGE'; payload: Badge }
  | { type: 'CHECK_STREAK' }
  | { type: 'SET_BUDDY_MASCOT'; payload: { mascotId: string } }
  | { type: 'EQUIP_BUDDY_ITEM'; payload: { slot: 'hat' | 'outfit' | 'accessory'; itemId: string | undefined } }
  | { type: 'UPDATE_QUEST_ICON'; payload: { questId: string; icon: string } }
  | { type: 'UPDATE_QUEST_IMAGE'; payload: { questId: string; islandImageUrl: string } }
  | { type: 'UPDATE_QUEST_MASCOT'; payload: { questId: string; questMascotUrl: string } }
  | { type: 'UPDATE_USER_MASCOT'; payload: { mascotImageUrl: string } };
