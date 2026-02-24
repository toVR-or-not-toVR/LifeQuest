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
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
  | { type: 'CHECK_STREAK' };
