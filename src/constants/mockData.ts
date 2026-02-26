import { AppState, User, Quest, Message, Notification } from '../types';
import { Colors } from './colors';

export const INITIAL_USER: User = {
  id: 'user-1',
  name: 'Adventurer',
  avatar: '🧙',
  level: 1,
  xp: 0,
  xpToNextLevel: 283,
  streak: 0,
  lastActiveDate: new Date().toISOString(),
  totalQuestsCompleted: 0,
  badges: [],
  buddyMascotId: 'owl',
  buddyEquipped: {},
};

export const SAMPLE_QUESTS: Quest[] = [
  {
    id: 'quest-demo-1',
    title: 'Morning Fitness',
    description: 'Build a consistent morning workout habit',
    category: 'health',
    color: Colors.categoryColors.health,
    mapIcon: '🏋️',
    mapPosition: { x: 400, y: 1250 },
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: 'm-d1-1',
        title: 'Define your routine',
        description: 'Write out your ideal morning workout plan',
        completed: true,
        completedAt: new Date().toISOString(),
        xpReward: 50,
      },
      {
        id: 'm-d1-2',
        title: 'First workout done!',
        description: 'Complete your very first session',
        completed: false,
        xpReward: 100,
      },
      {
        id: 'm-d1-3',
        title: '7-day streak',
        description: 'Work out every day for a week',
        completed: false,
        xpReward: 300,
      },
    ],
  },
  {
    id: 'quest-demo-2',
    title: 'Learn Spanish',
    description: 'Reach conversational level in Spanish',
    category: 'education',
    color: Colors.categoryColors.education,
    mapIcon: '📚',
    mapPosition: { x: 200, y: 1050 },
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: 'm-d2-1',
        title: 'Choose learning resources',
        description: 'Pick an app, book, or course',
        completed: false,
        xpReward: 50,
      },
      {
        id: 'm-d2-2',
        title: 'First lesson complete',
        description: 'Finish your first Spanish lesson',
        completed: false,
        xpReward: 75,
      },
      {
        id: 'm-d2-3',
        title: 'Learn 100 words',
        description: 'Build your first vocabulary set',
        completed: false,
        xpReward: 150,
      },
    ],
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content:
      "¡Hola, brave adventurer! I am Lumi ✨, your AI companion on this epic journey. I am here to cheer you on, suggest your next steps, and celebrate your victories. What goal shall we conquer first? Tell me anything! 🗺️",
    timestamp: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-welcome',
    type: 'tip',
    title: 'Welcome to LifeQuest!',
    body: 'Your adventure begins now. Create your first quest and watch your map come alive.',
    timestamp: new Date().toISOString(),
    read: false,
  },
];

export const INITIAL_STATE: AppState = {
  user: INITIAL_USER,
  quests: [],
  messages: INITIAL_MESSAGES,
  notifications: INITIAL_NOTIFICATIONS,
  hasOnboarded: false,
};

export const ALL_BADGES = [
  { id: 'badge-first-quest', title: 'First Quest', icon: '🗺️', description: 'Created your first quest' },
  { id: 'badge-first-complete', title: 'Quest Slayer', icon: '⚔️', description: 'Completed your first quest' },
  { id: 'badge-level-5', title: 'Level 5', icon: '⭐', description: 'Reached level 5' },
  { id: 'badge-streak-7', title: '7-Day Warrior', icon: '🔥', description: 'Maintained a 7-day streak' },
  { id: 'badge-photo', title: 'Memory Keeper', icon: '📸', description: 'Added your first milestone photo' },
  { id: 'badge-chat', title: 'Companion Bond', icon: '✨', description: 'Had your first conversation with Lumi' },
];
