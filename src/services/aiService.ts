import { Milestone, Quest, QuestCategory } from '../types';
import { uuid } from '../utils/uuid';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Milestone generation stubs ──────────────────────────────────────────────

const MILESTONE_TEMPLATES: Record<string, Array<{ title: string; description: string; xpReward: number }>> = {
  health: [
    { title: 'Define your why', description: 'Write down exactly why this health goal matters to you', xpReward: 50 },
    { title: 'Set up your environment', description: 'Prepare your space: get equipment, clear obstacles', xpReward: 75 },
    { title: 'Day 1 complete', description: 'Take your very first action toward this goal today', xpReward: 100 },
    { title: '3-day streak', description: 'Maintain consistent effort for 3 days in a row', xpReward: 150 },
    { title: 'One week in', description: 'Complete a full week — you are building a real habit', xpReward: 200 },
    { title: 'Overcome the plateau', description: 'Push through when motivation dips — this is where heroes are made', xpReward: 300 },
    { title: 'Goal achieved!', description: 'You did it — celebrate and share your victory!', xpReward: 500 },
  ],
  career: [
    { title: 'Clarify your vision', description: 'Write a clear one-sentence description of your career goal', xpReward: 50 },
    { title: 'Skill gap analysis', description: 'List the top 3 skills you need to reach this goal', xpReward: 75 },
    { title: 'First concrete action', description: 'Apply, reach out, or start the first real step today', xpReward: 100 },
    { title: 'Build your network', description: 'Connect with 3 people who can help or inspire you', xpReward: 150 },
    { title: 'Complete key milestone', description: 'Finish the most important deliverable on this path', xpReward: 250 },
    { title: 'Level up your skills', description: 'Complete a course, project, or significant learning task', xpReward: 300 },
    { title: 'Goal achieved!', description: 'You have reached your career milestone — celebrate!', xpReward: 500 },
  ],
  education: [
    { title: 'Choose your materials', description: 'Select books, courses, or resources for this topic', xpReward: 50 },
    { title: 'Set a study schedule', description: 'Block dedicated time in your calendar every week', xpReward: 75 },
    { title: 'Complete first session', description: 'Do your first focused study session — at least 30 minutes', xpReward: 100 },
    { title: 'First chapter/module done', description: 'Finish the first major section of your learning material', xpReward: 150 },
    { title: 'Practice what you learned', description: 'Apply the knowledge with a real project or exercise', xpReward: 200 },
    { title: 'Teach it to someone', description: 'Explain what you learned to another person — the ultimate test', xpReward: 300 },
    { title: 'Mastery achieved!', description: 'You have learned what you set out to learn — amazing!', xpReward: 500 },
  ],
  default: [
    { title: 'Define your goal clearly', description: 'Write down exactly what success looks like', xpReward: 50 },
    { title: 'Research & plan', description: 'Spend time learning the best approach', xpReward: 75 },
    { title: 'Take the first step', description: 'Complete one small but real action today', xpReward: 100 },
    { title: 'Build momentum', description: 'Complete 3 consecutive days of progress', xpReward: 150 },
    { title: 'Reach the halfway point', description: 'You are halfway there — celebrate this milestone!', xpReward: 200 },
    { title: 'Push through resistance', description: 'Complete the hardest part of your journey', xpReward: 300 },
    { title: 'Quest complete!', description: 'You achieved your goal — take a moment to be proud', xpReward: 500 },
  ],
};

export async function generateQuestMilestones(
  goalTitle: string,
  category: QuestCategory
): Promise<Milestone[]> {
  await delay(1500);
  const templates = MILESTONE_TEMPLATES[category] ?? MILESTONE_TEMPLATES.default;
  return templates.map((t) => ({
    id: uuid(),
    title: t.title,
    description: t.description,
    completed: false,
    xpReward: t.xpReward,
  }));
}

// ─── Chat companion stubs ─────────────────────────────────────────────────────

const COMPANION_RESPONSES = [
  (quests: Quest[]) =>
    `That's the spirit, adventurer! You have ${quests.filter((q) => !q.completedAt).length} active quest${quests.filter((q) => !q.completedAt).length !== 1 ? 's' : ''} — keep going!`,
  () => `Every legend starts with a single step. What you just said shows real courage! 🌟`,
  () => `I believe in you! Your journey is unique and every effort counts.`,
  () => `The map grows with every milestone you conquer. Keep exploring, brave one!`,
  () => `Remember: consistent progress beats perfect bursts every single time. You are doing amazing!`,
  () => `Obstacles are just plot twists in your story. Push through and write an epic ending! ⚔️`,
  (quests: Quest[]) => {
    const completed = quests.filter((q) => q.completedAt).length;
    return completed > 0
      ? `You have already completed ${completed} quest${completed !== 1 ? 's' : ''}! That is real momentum — keep it up!`
      : `Your first quest completion will feel incredible. You are closer than you think!`;
  },
];

export async function chatWithCompanion(
  message: string,
  questContext: Quest[]
): Promise<string> {
  await delay(900 + Math.random() * 400);
  const respFn = COMPANION_RESPONSES[Math.floor(Math.random() * COMPANION_RESPONSES.length)];
  return respFn(questContext);
}

// ─── Next step suggestion ─────────────────────────────────────────────────────

export async function suggestNextStep(quest: Quest): Promise<string> {
  await delay(800);
  const next = quest.milestones.find((m) => !m.completed);
  if (!next) return '🎉 You have completed ALL milestones! You are a legend!';
  const done = quest.milestones.filter((m) => m.completed).length;
  const total = quest.milestones.length;
  return `Your next step: "${next.title}" (${done + 1}/${total}). ${next.description}. I know you can do it! 💪`;
}
