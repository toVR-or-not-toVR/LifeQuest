import { AppState, AppAction, Notification } from '../types';
import { calculateLevel, xpToNextLevel } from '../utils/xpUtils';
import { isQuestComplete } from '../utils/questUtils';
import { uuid } from '../utils/uuid';
import { todayISO, calculateStreak } from '../utils/dateUtils';

function makeNotif(
  type: Notification['type'],
  title: string,
  body: string
): Notification {
  return { id: uuid(), type, title, body, timestamp: todayISO(), read: false };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ── Load persisted state ──────────────────────────────────────────────
    case 'LOAD_STATE':
      return action.payload;

    // ── Onboarding ────────────────────────────────────────────────────────
    case 'SET_ONBOARDED':
      return {
        ...state,
        hasOnboarded: true,
        quests: [],
        user: { ...state.user, lastActiveDate: todayISO() },
      };

    // ── Update user fields ────────────────────────────────────────────────
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };

    // ── Add a new quest ───────────────────────────────────────────────────
    case 'ADD_QUEST': {
      const isFirst = state.quests.length === 0;
      const newNotifs: Notification[] = [];
      if (isFirst) {
        newNotifs.push(makeNotif('tip', 'First quest created!', `Your map is alive. "${action.payload.title}" is now on your journey! 🗺️`));
      }
      const badges = [...state.user.badges];
      if (isFirst && !badges.find((b) => b.id === 'badge-first-quest')) {
        badges.push({
          id: 'badge-first-quest',
          title: 'First Quest',
          icon: '🗺️',
          description: 'Created your first quest',
          unlockedAt: todayISO(),
        });
        newNotifs.push(makeNotif('badge', 'Badge unlocked: First Quest 🗺️', 'You created your first quest!'));
      }
      return {
        ...state,
        quests: [...state.quests, action.payload],
        user: { ...state.user, badges },
        notifications: [...newNotifs, ...state.notifications],
      };
    }

    // ── Delete a quest ────────────────────────────────────────────────────
    case 'DELETE_QUEST':
      return {
        ...state,
        quests: state.quests.filter((q) => q.id !== action.payload.questId),
      };

    // ── Complete a milestone ──────────────────────────────────────────────
    case 'COMPLETE_MILESTONE': {
      const { questId, milestoneId } = action.payload;
      const quest = state.quests.find((q) => q.id === questId);
      if (!quest) return state;
      const milestone = quest.milestones.find((m) => m.id === milestoneId);
      if (!milestone || milestone.completed) return state;

      const xpEarned = milestone.xpReward;
      const prevXP = state.user.xp;
      const newXP = prevXP + xpEarned;
      const prevLevel = state.user.level;
      const newLevel = calculateLevel(newXP);
      const newXpToNext = xpToNextLevel(newXP);

      const updatedQuests = state.quests.map((q) => {
        if (q.id !== questId) return q;
        const updatedMilestones = q.milestones.map((m) =>
          m.id !== milestoneId
            ? m
            : { ...m, completed: true, completedAt: todayISO() }
        );
        const questDone = updatedMilestones.every((m) => m.completed);
        return {
          ...q,
          milestones: updatedMilestones,
          completedAt: questDone ? todayISO() : undefined,
        };
      });

      const updatedQuest = updatedQuests.find((q) => q.id === questId)!;
      const questJustCompleted = isQuestComplete(updatedQuest);

      // Build notifications
      const newNotifs: Notification[] = [];
      newNotifs.push(
        makeNotif(
          'milestone',
          `+${xpEarned} XP earned!`,
          `Milestone "${milestone.title}" completed. Keep going!`
        )
      );
      if (newLevel > prevLevel) {
        newNotifs.push(
          makeNotif('levelup', `Level Up! You are now Level ${newLevel} 🎉`, `You have reached ${getLevelTitle(newLevel)}!`)
        );
      }
      if (questJustCompleted) {
        newNotifs.push(
          makeNotif('milestone', `Quest Complete: "${quest.title}"! ⚔️`, 'You conquered this quest! Check your profile for rewards.')
        );
      }

      // Badges
      const badges = [...state.user.badges];
      const newTotalCompleted =
        state.user.totalQuestsCompleted + (questJustCompleted ? 1 : 0);

      if (questJustCompleted && !badges.find((b) => b.id === 'badge-first-complete')) {
        badges.push({
          id: 'badge-first-complete',
          title: 'Quest Slayer',
          icon: '⚔️',
          description: 'Completed your first quest',
          unlockedAt: todayISO(),
        });
        newNotifs.push(makeNotif('badge', 'Badge unlocked: Quest Slayer ⚔️', 'You completed your first quest!'));
      }
      if (newLevel >= 5 && !badges.find((b) => b.id === 'badge-level-5')) {
        badges.push({
          id: 'badge-level-5',
          title: 'Level 5',
          icon: '⭐',
          description: 'Reached level 5',
          unlockedAt: todayISO(),
        });
        newNotifs.push(makeNotif('badge', 'Badge unlocked: Level 5 ⭐', 'You have reached Level 5!'));
      }

      return {
        ...state,
        quests: updatedQuests,
        user: {
          ...state.user,
          xp: newXP,
          level: newLevel,
          xpToNextLevel: newXpToNext,
          totalQuestsCompleted: newTotalCompleted,
          badges,
          lastActiveDate: todayISO(),
        },
        notifications: [...newNotifs, ...state.notifications],
      };
    }

    // ── Add photo to milestone ────────────────────────────────────────────
    case 'ADD_MILESTONE_PHOTO': {
      const { questId, milestoneId, uri } = action.payload;
      const badges = [...state.user.badges];
      const newNotifs: Notification[] = [];
      if (!badges.find((b) => b.id === 'badge-photo')) {
        badges.push({
          id: 'badge-photo',
          title: 'Memory Keeper',
          icon: '📸',
          description: 'Added your first milestone photo',
          unlockedAt: todayISO(),
        });
        newNotifs.push(makeNotif('badge', 'Badge unlocked: Memory Keeper 📸', 'You captured your first milestone memory!'));
      }
      return {
        ...state,
        quests: state.quests.map((q) =>
          q.id !== questId
            ? q
            : {
                ...q,
                milestones: q.milestones.map((m) =>
                  m.id !== milestoneId ? m : { ...m, photo: uri }
                ),
              }
        ),
        user: { ...state.user, badges },
        notifications: [...newNotifs, ...state.notifications],
      };
    }

    // ── Chat messages ─────────────────────────────────────────────────────
    case 'ADD_MESSAGE': {
      const badges = [...state.user.badges];
      const newNotifs: Notification[] = [];
      const isFirstChat = state.messages.filter((m) => m.role === 'user').length === 0;
      if (action.payload.role === 'user' && isFirstChat && !badges.find((b) => b.id === 'badge-chat')) {
        badges.push({
          id: 'badge-chat',
          title: 'Companion Bond',
          icon: '✨',
          description: 'Had your first conversation with Lumi',
          unlockedAt: todayISO(),
        });
        newNotifs.push(makeNotif('badge', 'Badge unlocked: Companion Bond ✨', 'You bonded with your AI companion Lumi!'));
      }
      return {
        ...state,
        messages: [...state.messages, action.payload],
        user: { ...state.user, badges },
        notifications: [...newNotifs, ...state.notifications],
      };
    }

    // ── Notifications ─────────────────────────────────────────────────────
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    // ── Badge unlock ──────────────────────────────────────────────────────
    case 'UNLOCK_BADGE':
      if (state.user.badges.find((b) => b.id === action.payload.id)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          badges: [...state.user.badges, action.payload],
        },
      };

    // ── Streak check ──────────────────────────────────────────────────────
    case 'CHECK_STREAK': {
      const newStreak = calculateStreak(state.user.lastActiveDate, state.user.streak);
      const badges = [...state.user.badges];
      const newNotifs: Notification[] = [];
      if (newStreak >= 7 && !badges.find((b) => b.id === 'badge-streak-7')) {
        badges.push({
          id: 'badge-streak-7',
          title: '7-Day Warrior',
          icon: '🔥',
          description: 'Maintained a 7-day streak',
          unlockedAt: todayISO(),
        });
        newNotifs.push(makeNotif('badge', 'Badge unlocked: 7-Day Warrior 🔥', '7 days in a row! You are unstoppable!'));
      }
      return {
        ...state,
        user: {
          ...state.user,
          streak: newStreak,
          lastActiveDate: todayISO(),
          badges,
        },
        notifications: [...newNotifs, ...state.notifications],
      };
    }

    // ── Buddy mascot ──────────────────────────────────────────────────────
    case 'SET_BUDDY_MASCOT':
      return {
        ...state,
        user: { ...state.user, buddyMascotId: action.payload.mascotId },
      };

    // ── Equip buddy item ──────────────────────────────────────────────────
    case 'EQUIP_BUDDY_ITEM':
      return {
        ...state,
        user: {
          ...state.user,
          buddyEquipped: {
            ...state.user.buddyEquipped,
            [action.payload.slot]: action.payload.itemId,
          },
        },
      };

    default:
      return state;
  }
}

function getLevelTitle(level: number): string {
  if (level >= 50) return 'Legendary Hero';
  if (level >= 40) return 'Grandmaster';
  if (level >= 30) return 'Champion';
  if (level >= 20) return 'Warrior';
  if (level >= 15) return 'Knight';
  if (level >= 10) return 'Adventurer';
  if (level >= 5) return 'Explorer';
  return 'Novice';
}
