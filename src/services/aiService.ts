import { Milestone, Quest, QuestCategory, Message, ChatPlan } from '../types';
import { uuid } from '../utils/uuid';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
const IMAGEN_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`;

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

async function callGeminiChat(
  systemPrompt: string,
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: history.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
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

// ─── Island asset generation (emoji fallback) ─────────────────────────────────

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

// ─── Island image generation (Imagen 3) ──────────────────────────────────────

const CATEGORY_ISLAND_THEMES: Record<QuestCategory, string> = {
  health:        'gym equipment, dumbbells, running track, healthy food, green trees',
  career:        'office building, briefcase, golden trophy, business charts',
  education:     'books, graduation cap, telescope, school desk, diploma scroll',
  personal:      'colorful flowers, art easel, guitar, journal, lanterns',
  finance:       'gold coins pile, treasure chest, piggy bank, stock chart',
  relationships: 'heart decorations, flowers, couple bench, pink blossoms',
};

export async function generateIslandImage(
  questTitle: string,
  category: QuestCategory
): Promise<string> {
  const themeElements = CATEGORY_ISLAND_THEMES[category] ?? 'colorful decorations';
  const prompt = `Isometric 3D cartoon game art, small floating tropical island in blue ocean, featuring ${themeElements} related to "${questTitle}", lush green grass on top, rocky cliff base, palm trees, colorful flowers, vibrant game art style, no text no labels, soft warm lighting, high quality render, game icon style`;

  const res = await fetch(IMAGEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '1:1' },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Imagen API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No image returned from Imagen API');
  return `data:image/png;base64,${b64}`;
}

// ─── Mascot image generation (Imagen 3) ──────────────────────────────────────

const CATEGORY_MASCOT_OUTFITS: Record<QuestCategory, string> = {
  health:        'wearing bright gym clothes and sneakers, holding dumbbells',
  career:        'wearing a sharp business suit with tie, holding a briefcase',
  education:     'wearing a graduation cap and robe, holding a stack of books',
  personal:      'wearing a colorful casual outfit with a scarf, holding flowers',
  finance:       'wearing a top hat and golden waistcoat, holding a gold coin',
  relationships: 'wearing a heart-patterned outfit, holding a bouquet of roses',
};

export async function generateMascotImage(
  category: QuestCategory
): Promise<string> {
  const outfit = CATEGORY_MASCOT_OUTFITS[category] ?? 'wearing a colorful outfit';
  const prompt = `Cute cartoon chibi purple otter character, white fluffy belly, round eyes, small ears, ${outfit}, standing upright friendly pose, bright smile, vibrant colors, game character art style, clean simple background, full body, high quality illustration`;

  const res = await fetch(IMAGEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '1:1' },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Imagen API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No mascot image returned from Imagen API');
  return `data:image/png;base64,${b64}`;
}

// ─── AI companion chat (proactive life coach) ─────────────────────────────────

const COACH_SYSTEM_PROMPT = `You are Lumi — a proactive, warm, and highly practical AI life coach inside a gamified goal-achievement app. Your role is to help users turn vague dreams into concrete action plans and actually start them.

BEHAVIOR RULES:
1. When a user mentions ANY goal or desire, immediately create a specific step-by-step action plan — don't ask permission, just do it.
2. Be concrete and practical. For travel: list visa requirements, documents needed, embassy contacts. For fitness: suggest specific workout schedules. For career: list specific skills, courses, certifications.
3. If the user shares context (location, situation, constraints), update the plan to reflect it.
4. Keep responses conversational and warm — use 1-2 emojis max per message.
5. After creating a plan, ask ONE clarifying question to refine it further.
6. ALWAYS detect the language the user writes in and respond in the SAME language.

RESPONSE FORMAT:
You MUST always respond with valid JSON (no markdown wrapper):
{
  "message": "your conversational response here",
  "plan": {
    "questTitle": "Short title for the goal",
    "category": "one of: health|career|education|personal|finance|relationships",
    "steps": ["Step 1", "Step 2", ...],
    "newStepIndex": null
  }
}

If this is a continuation and you add a new step, set "newStepIndex" to the 0-based index of the new step.
If no plan is relevant (e.g. motivational chat, question about progress), return "plan": null.
Steps should be 5-8 items, short and actionable (max 60 chars each).
CRITICAL: Return ONLY the JSON object. No markdown, no code blocks, no extra text.`;

export async function chatWithCompanion(
  messages: Message[],
  questContext: Quest[]
): Promise<{ message: string; plan: ChatPlan | null }> {
  const active = questContext.filter((q) => !q.completedAt).length;
  const done = questContext.filter((q) => q.completedAt).length;
  const questSummary = questContext
    .filter((q) => !q.completedAt)
    .map((q) => {
      const completedCount = q.milestones.filter((m) => m.completed).length;
      return `"${q.title}" (${completedCount}/${q.milestones.length} milestones done)`;
    })
    .join(', ');

  const contextNote = `User context: ${active} active quests, ${done} completed. Active: ${questSummary || 'none yet'}.`;

  // Build conversation history for Gemini (skip system messages)
  const history = messages.map((m) => ({
    role: m.role === 'user' ? 'user' as const : 'model' as const,
    // For model messages that had a plan, include a simplified version so context is preserved
    text: m.role === 'assistant' && m.plan
      ? JSON.stringify({ message: m.content, plan: m.plan })
      : m.content,
  }));

  // Inject context into the last user message
  if (history.length > 0 && history[history.length - 1].role === 'user') {
    history[history.length - 1] = {
      role: 'user',
      text: `${history[history.length - 1].text}\n\n[${contextNote}]`,
    };
  }

  try {
    const raw = await callGeminiChat(COACH_SYSTEM_PROMPT, history);
    const parsed = parseJSON<{ message: string; plan: ChatPlan | null }>(raw);
    if (parsed && typeof parsed.message === 'string') {
      return {
        message: parsed.message,
        plan: parsed.plan ?? null,
      };
    }
    // If JSON parsing failed but we got text, return as plain message
    return { message: raw.trim().slice(0, 500), plan: null };
  } catch (e) {
    console.warn('Gemini chatWithCompanion failed:', e);
    const fallbacks = [
      `Tell me about your goal and I'll build you a step-by-step plan right away! 🗺️`,
      `What would you like to achieve? Share your dream and let's turn it into action! 🚀`,
      `I'm here to help you crush your goals! What are you working towards? 💪`,
    ];
    return {
      message: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      plan: null,
    };
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
