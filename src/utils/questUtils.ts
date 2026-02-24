import { Quest, QuestCategory } from '../types';
import { Colors } from '../constants/colors';

export function getQuestProgress(quest: Quest): number {
  if (quest.milestones.length === 0) return 0;
  const done = quest.milestones.filter((m) => m.completed).length;
  return done / quest.milestones.length;
}

export function getQuestProgressText(quest: Quest): string {
  const done = quest.milestones.filter((m) => m.completed).length;
  return `${done}/${quest.milestones.length}`;
}

export function isQuestComplete(quest: Quest): boolean {
  return quest.milestones.length > 0 && quest.milestones.every((m) => m.completed);
}

export function getCategoryEmoji(category: QuestCategory): string {
  const map: Record<QuestCategory, string> = {
    health: '💪',
    career: '🚀',
    education: '📚',
    personal: '🌟',
    finance: '💰',
    relationships: '❤️',
  };
  return map[category] ?? '🎯';
}

export function getCategoryLabel(category: QuestCategory): string {
  const map: Record<QuestCategory, string> = {
    health: 'Health',
    career: 'Career',
    education: 'Education',
    personal: 'Personal',
    finance: 'Finance',
    relationships: 'Relationships',
  };
  return map[category] ?? category;
}

// Pre-defined zigzag slot grid (800×1400 canvas)
const MAP_SLOTS: Array<{ x: number; y: number }> = [
  { x: 400, y: 1250 },
  { x: 200, y: 1050 },
  { x: 600, y: 880 },
  { x: 250, y: 700 },
  { x: 560, y: 540 },
  { x: 180, y: 380 },
  { x: 500, y: 230 },
  { x: 360, y: 100 },
];

export function generateMapPosition(existingQuests: Quest[]): { x: number; y: number } {
  const index = existingQuests.length % MAP_SLOTS.length;
  return MAP_SLOTS[index];
}

export function getMapSlots(): Array<{ x: number; y: number }> {
  return MAP_SLOTS;
}

export function buildSvgPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export function getQuestColor(category: QuestCategory): string {
  return Colors.categoryColors[category] ?? Colors.primary;
}
