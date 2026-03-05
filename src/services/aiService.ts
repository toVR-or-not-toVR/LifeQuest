import { Milestone, Quest, QuestCategory } from '../types';
import { uuid } from '../utils/uuid';

const API_KEY = 'AIzaSyDI-rKIFj0OpkLp6w4sUIlKwX6yol-LaNM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function parseJSON<T>(raw: string): T | null {
  const clean = raw.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(clean) as T; } catch { return null; }
}

// ─── Fallback milestone templates ────────────────────────────────────────────

const FALLBACK_MILESTONES = [
  { title: 'Define your goal clearly', description: 'Write down exactly what success looks like', xpReward: 50 },
  { title: 'Research & plan', description: 'Spend time learning the best approach', xpReward: 75 },
  { title: 'Take the first step', description: 'Complete one small but real action today', xpReward: 100 },
  { title: 'Build momentum', description: 'Complete 3 consecutive days of progress', xpReward: 150 },
  { title: 'Reach the halfway point', description: "You're halfway there — celebrate this milestone!", xpReward: 200 },
  { title: 'Push through resistance', description: 'Complete the hardest part of your journey', xpReward: 300 },
  { title: 'Quest complete!', description: 'You achieved your goal — take a moment to be proud', xpReward: 500 },
];

// ─── Milestone generation ─────────────────────────────────────────────────────

export async function generateQuestMilestones(
  goalTitle: string,
  category: QuestCategory
): Promise<Milestone[]> {
  try {
    const prompt = `Create exactly 7 quest milestones for the goal: "${goalTitle}" (category: ${category}).
Return ONLY a valid JSON array with exactly 7 objects. Each object must have:
- "title": string (max 40 characters)
- "description": string (max 100 characters)
- "xpReward": number (choose from: 50, 75, 100, 150, 200, 300, 500)
Order from easiest to hardest. First milestone: planning/preparation. Last: final achievement.
Return ONLY raw JSON array, no markdown, no explanation.`;

    const raw = await callGemini(prompt);
    const parsed = parseJSON<Array<{ title: string; description: string; xpReward: number }>>(raw);
    if (parsed && Array.isArray(parsed) && parsed.length >= 3) {
      return parsed.slice(0, 7).map((t) => ({
        id: uuid(),
        title: String(t.title ?? 'Milestone').slice(0, 60),
        description: String(t.description ?? '').slice(0, 120),
        completed: false,
        xpReward: typeof t.xpReward === 'number' ? t.xpReward : 100,
      }));
    }
  } catch (e) {
    console.warn('Gemini generateQuestMilestones failed, using fallback:', e);
  }
  return FALLBACK_MILESTONES.map((t) => ({
    id: uuid(),
    title: t.title,
    description: t.description,
    completed: false,
    xpReward: t.xpReward,
  }));
}

// ─── Island asset generation ──────────────────────────────────────────────────

const ASSET_FALLBACKS: Record<string, string[]> = {
  health:        ['💪', '🏋️', '🏃', '🥗', '❤️', '🏆'],
  career:        ['💼', '📈', '🎯', '💡', '🏆', '⭐'],
  education:     ['📚', '🎓', '💡', '🔬', '✏️', '🏆'],
  personal:      ['❤️', '🌟', '🎨', '✨', '🦋', '🌈'],
  finance:       ['💰', '📈', '🏠', '✈️', '💎', '🏆'],
  relationships: ['❤️', '👫', '🤝', '💌', '🌹', '✨'],
};

export async function generateIslandAssets(
  goalTitle: string,
  category: QuestCategory
): Promise<string[]> {
  try {
    const prompt = `For the goal: "${goalTitle}" (category: ${category}), suggest 6 single emoji that best represent this goal visually on an adventure map island.
Return ONLY a valid JSON array of 6 emoji strings.
Example: ["🏋️","⚡","🎯","💪","🏆","🌟"]
Return ONLY the raw JSON array, no markdown, no explanation.`;

    const raw = await callGemini(prompt);
    const parsed = parseJSON<string[]>(raw);
    if (parsed && Array.isArray(parsed) && parsed.length >= 1) {
      return parsed.slice(0, 6).filter((e) => typeof e === 'string' && e.length > 0);
    }
  } catch (e) {
    console.warn('Gemini generateIslandAssets failed, using fallback:', e);
  }
  return ASSET_FALLBACKS[category] ?? ASSET_FALLBACKS.personal;
}

// ─── AI companion chat ────────────────────────────────────────────────────────

export async function chatWithCompanion(
  message: string,
  questContext: Quest[]
): Promise<string> {
  try {
    const active = questContext.filter((q) => !q.completedAt).length;
    const done = questContext.filter((q) => q.completedAt).length;
    const prompt = `You are Lumi, a warm and encouraging AI companion helping users achieve life goals in a gamified adventure app.
User stats: ${active} active quests, ${done} completed quests.
User says: "${message}"
Reply in 1-2 short sentences. Be warm, motivating, use 1 emoji. Max 180 characters.
Reply in the same language the user wrote in.`;

    const reply = await callGemini(prompt);
    return reply.trim().slice(0, 350);
  } catch (e) {
    console.warn('Gemini chatWithCompanion failed:', e);
    const fallbacks = [
      `That's the spirit! You have ${questContext.filter((q) => !q.completedAt).length} active quests — keep going! 🌟`,
      `Every legend starts with a single step. You're doing amazing! ⚔️`,
      `I believe in you! Your journey is unique and every effort counts. 💪`,
      `The map grows with every milestone you conquer. Keep exploring! 🗺️`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// ─── Next step suggestion ─────────────────────────────────────────────────────

export async function suggestNextStep(quest: Quest): Promise<string> {
  const next = quest.milestones.find((m) => !m.completed);
  if (!next) return '🎉 You have completed ALL milestones! You are a legend!';
  const done = quest.milestones.filter((m) => m.completed).length;
  const total = quest.milestones.length;

  try {
    const prompt = `Quest: "${quest.title}". Progress: ${done}/${total} milestones done.
Next milestone: "${next.title}" — ${next.description}
Give one short encouraging tip (max 120 characters) to help complete this milestone. Use 1 emoji.`;

    const tip = await callGemini(prompt);
    return tip.trim().slice(0, 250);
  } catch (e) {
    console.warn('Gemini suggestNextStep failed:', e);
    return `Your next step: "${next.title}" (${done + 1}/${total}). ${next.description}. You can do it! 💪`;
  }
}
