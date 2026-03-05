import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path, Circle, Ellipse, G, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getCategoryEmoji } from '../utils/questUtils';

// ── Island layout ──────────────────────────────────────────────────────────
const START_R = 36;
const ISLAND_R = 46;
const ISLAND_TOP_R = 36;

// Slot positions as fraction of map canvas [rx, ry]
const SLOT_POSITIONS = [
  [0.20, 0.14],
  [0.80, 0.14],
  [0.08, 0.50],
  [0.92, 0.50],
  [0.20, 0.86],
  [0.80, 0.86],
];

// ── Mascot emoji map ───────────────────────────────────────────────────────
const MASCOT_EMOJI: Record<string, string> = {
  owl: '🦉', fox: '🦊', cat: '🐱', capybara: '🦫', panda: '🐼',
};

// ── Bottom panel icon data ─────────────────────────────────────────────────
type MapIconItem = { id: string; emoji: string; name: string };
type MapIconCategory = { id: string; label: string; tabIcon: string; items: MapIconItem[] };

const ICON_CATEGORIES: MapIconCategory[] = [
  {
    id: 'landmarks', label: 'Места', tabIcon: '🗼',
    items: [
      { id: 'eiffel', emoji: '🗼', name: 'Эйфель' },
      { id: 'castle', emoji: '🏰', name: 'Замок' },
      { id: 'torii', emoji: '⛩️', name: 'Тории' },
      { id: 'moai', emoji: '🗿', name: 'Моаи' },
      { id: 'bridge', emoji: '🌉', name: 'Мост' },
      { id: 'temple', emoji: '🏛️', name: 'Храм' },
    ],
  },
  {
    id: 'nature', label: 'Природа', tabIcon: '🌴',
    items: [
      { id: 'palm', emoji: '🌴', name: 'Пальма' },
      { id: 'mountain', emoji: '🏔️', name: 'Гора' },
      { id: 'volcano', emoji: '🌋', name: 'Вулкан' },
      { id: 'island', emoji: '🏝️', name: 'Остров' },
      { id: 'rainbow', emoji: '🌈', name: 'Радуга' },
      { id: 'crystal', emoji: '💎', name: 'Кристалл' },
    ],
  },
  {
    id: 'sport', label: 'Спорт', tabIcon: '🎾',
    items: [
      { id: 'tennis', emoji: '🎾', name: 'Теннис' },
      { id: 'football', emoji: '⚽', name: 'Футбол' },
      { id: 'gym', emoji: '🏋️', name: 'Зал' },
      { id: 'cycling', emoji: '🚴', name: 'Велик' },
      { id: 'swimming', emoji: '🏊', name: 'Плавание' },
      { id: 'yoga', emoji: '🧘', name: 'Йога' },
    ],
  },
  {
    id: 'education', label: 'Учёба', tabIcon: '🏫',
    items: [
      { id: 'school', emoji: '🏫', name: 'Школа' },
      { id: 'books', emoji: '📚', name: 'Книги' },
      { id: 'science', emoji: '🔬', name: 'Наука' },
      { id: 'code', emoji: '💻', name: 'Кодинг' },
      { id: 'diploma', emoji: '🎓', name: 'Диплом' },
      { id: 'music', emoji: '🎵', name: 'Музыка' },
    ],
  },
  {
    id: 'finance', label: 'Финансы', tabIcon: '💰',
    items: [
      { id: 'money', emoji: '💰', name: 'Деньги' },
      { id: 'plane', emoji: '✈️', name: 'Самолёт' },
      { id: 'car', emoji: '🚗', name: 'Машина' },
      { id: 'house', emoji: '🏠', name: 'Дом' },
      { id: 'chart', emoji: '📈', name: 'Рост' },
      { id: 'boat', emoji: '⛵', name: 'Яхта' },
    ],
  },
  {
    id: 'personal', label: 'Личное', tabIcon: '❤️',
    items: [
      { id: 'heart', emoji: '❤️', name: 'Любовь' },
      { id: 'star', emoji: '⭐', name: 'Мечта' },
      { id: 'target', emoji: '🎯', name: 'Цель' },
      { id: 'art', emoji: '🎨', name: 'Творчество' },
      { id: 'travel', emoji: '🧳', name: 'Путешествие' },
      { id: 'family', emoji: '👨‍👩‍👧', name: 'Семья' },
    ],
  },
];

// ── Bezier helpers ─────────────────────────────────────────────────────────
function getCtrl(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const k = Math.min(55, len * 0.22);
  return { cx: mx + (-dy / len) * k, cy: my + (dx / len) * k };
}

function sampleBezier(
  n: number,
  x0: number, y0: number,
  cpx: number, cpy: number,
  x1: number, y1: number
): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / (n + 1);
    const mt = 1 - t;
    return {
      x: mt * mt * x0 + 2 * mt * t * cpx + t * t * x1,
      y: mt * mt * y0 + 2 * mt * t * cpy + t * t * y1,
    };
  });
}

// ── Component ──────────────────────────────────────────────────────────────
export function MapScreen() {
  const navigation = useNavigation<any>();
  const { state, dispatch } = useAppContext();
  const { width } = useWindowDimensions();
  const quests = state.quests.slice(0, 6);

  const [mapHeight, setMapHeight] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState<MapIconItem | null>(null);
  // Which quest is focused for icon assignment
  const [targetQuestId, setTargetQuestId] = useState<string | null>(null);

  const petEmoji = MASCOT_EMOJI[state.user.buddyMascotId] ?? '🦉';

  const onMapLayout = (e: LayoutChangeEvent) =>
    setMapHeight(e.nativeEvent.layout.height);

  const centerX = width / 2;
  const centerY = mapHeight / 2;

  const slots = useMemo(
    () => SLOT_POSITIONS.map(([rx, ry]) => ({ x: rx * width, y: ry * mapHeight })),
    [width, mapHeight]
  );

  // ── Compute pet position: last-completed milestone across all quests ──────
  const petDot = useMemo<{ x: number; y: number } | null>(() => {
    if (mapHeight === 0 || slots.length === 0) return null;
    let best: { x: number; y: number } | null = null;
    let bestDate = '';
    quests.forEach((quest, i) => {
      if (!slots[i]) return;
      const completed = quest.milestones.filter((m) => m.completed);
      if (completed.length === 0) return;
      const sorted = [...completed].sort((a, b) =>
        (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
      );
      const lastDate = sorted[0]?.completedAt ?? '';
      if (!lastDate || lastDate <= bestDate) return;
      bestDate = lastDate;
      const { x: ix, y: iy } = slots[i];
      const { cx: cpx, cy: cpy } = getCtrl(centerX, centerY, ix, iy);
      const dots = sampleBezier(quest.milestones.length, centerX, centerY, cpx, cpy, ix, iy);
      const dot = dots[completed.length - 1];
      if (dot) best = dot;
    });
    return best;
  }, [quests, slots, mapHeight, centerX, centerY]);

  const currentItems = ICON_CATEGORIES[activeTab].items;
  const targetQuest = quests.find((q) => q.id === targetQuestId) ?? null;

  function handleApplyIcon() {
    if (!selectedIcon || !targetQuestId) return;
    dispatch({ type: 'UPDATE_QUEST_ICON', payload: { questId: targetQuestId, icon: selectedIcon.emoji } });
    setSelectedIcon(null);
    setTargetQuestId(null);
  }

  // Icons to show in grid: quest's suggestedAssets at top when quest focused, else category items
  const panelItems: MapIconItem[] = useMemo(() => {
    if (targetQuest?.suggestedAssets && targetQuest.suggestedAssets.length > 0) {
      const suggested = targetQuest.suggestedAssets.map((e, idx) => ({
        id: `suggested-${idx}`,
        emoji: e,
        name: 'AI ✨',
      }));
      return [...suggested, ...currentItems];
    }
    return currentItems;
  }, [targetQuest, currentItems]);

  return (
    <ScreenWrapper>
      {/* ── MAP AREA ── */}
      <View style={styles.mapArea} onLayout={onMapLayout}>
        {mapHeight > 0 && (
          <>
            <Svg width={width} height={mapHeight} style={StyleSheet.absoluteFill}>
              {/* Water */}
              <Rect x={0} y={0} width={width} height={mapHeight} fill="#12B5A2" />

              {/* Wave lines */}
              {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((ry, i) => {
                const y = ry * mapHeight;
                return (
                  <Path
                    key={i}
                    d={`M 0 ${y} Q ${width * 0.25} ${y - 10} ${width * 0.5} ${y} Q ${width * 0.75} ${y + 10} ${width} ${y}`}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1.5}
                    fill="none"
                  />
                );
              })}

              {/* Clouds */}
              {[
                [width * 0.12, mapHeight * 0.07],
                [width * 0.80, mapHeight * 0.10],
                [width * 0.06, mapHeight * 0.42],
                [width * 0.88, mapHeight * 0.38],
                [width * 0.15, mapHeight * 0.80],
                [width * 0.80, mapHeight * 0.74],
              ].map(([cx, cy], i) => (
                <G key={i} opacity={0.85}>
                  <Ellipse cx={cx} cy={cy} rx={22} ry={12} fill="white" />
                  <Ellipse cx={cx - 13} cy={cy + 4} rx={14} ry={9} fill="white" />
                  <Ellipse cx={cx + 13} cy={cy + 4} rx={14} ry={9} fill="white" />
                </G>
              ))}

              {/* Boat decoration */}
              <G transform={`translate(${width * 0.87}, ${mapHeight * 0.60})`}>
                <Path d="M -8 4 L 8 4 L 5 -4 L -5 -4 Z" fill="#D4783A" />
                <Path d="M 0 -4 L 0 -18 L 9 -11 Z" fill="white" />
              </G>

              {/* Paths + milestone dots */}
              {quests.map((quest, i) => {
                if (!slots[i]) return null;
                const { x: ix, y: iy } = slots[i];
                const { cx: cpx, cy: cpy } = getCtrl(centerX, centerY, ix, iy);
                const pathD = `M ${centerX} ${centerY} Q ${cpx} ${cpy} ${ix} ${iy}`;
                const total = quest.milestones.length;
                const done = quest.milestones.filter((m) => m.completed).length;
                const dots = sampleBezier(total, centerX, centerY, cpx, cpy, ix, iy);

                return (
                  <G key={quest.id}>
                    <Path
                      d={pathD}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth={2.5}
                      strokeDasharray="7,6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {dots.map((dot, di) => (
                      <Circle
                        key={di}
                        cx={dot.x}
                        cy={dot.y}
                        r={5.5}
                        fill={di < done ? Colors.primary : 'transparent'}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </G>
                );
              })}
            </Svg>

            {/* Pet mascot at last completed milestone */}
            {petDot && (
              <Text style={[styles.petEmoji, { left: petDot.x - 12, top: petDot.y - 20 }]}>
                {petEmoji}
              </Text>
            )}

            {/* START island */}
            <View style={[styles.startWrapper, { left: centerX - START_R, top: centerY - START_R }]}>
              <View style={styles.startBase}>
                <View style={styles.startSurface}>
                  <Text style={styles.startEmoji}>🏠</Text>
                </View>
              </View>
              <Text style={styles.startLabel}>START</Text>
            </View>

            {/* Quest islands */}
            {quests.map((quest, i) => {
              if (!slots[i]) return null;
              const { x: ix, y: iy } = slots[i];
              const allDone = quest.milestones.every((m) => m.completed);
              const isFocused = targetQuestId === quest.id;
              const icon = quest.mapIcon || getCategoryEmoji(quest.category);
              return (
                <TouchableOpacity
                  key={quest.id}
                  onPress={() => {
                    if (selectedIcon) {
                      // icon-assignment mode: toggle target quest
                      setTargetQuestId(isFocused ? null : quest.id);
                    } else {
                      navigation.navigate('QuestDetail', { questId: quest.id });
                    }
                  }}
                  style={[
                    styles.islandWrapper,
                    { left: ix - ISLAND_R, top: iy - ISLAND_R },
                  ]}
                  activeOpacity={0.85}
                >
                  <View style={[styles.islandBase, isFocused && styles.islandFocused]}>
                    <View style={[styles.islandSurface, allDone && styles.islandDone]}>
                      <Text style={styles.islandEmoji}>{icon}</Text>
                    </View>
                  </View>
                  {quest.assetLocked && (
                    <Text style={styles.lockBadge}>🔒</Text>
                  )}
                  <Text style={styles.islandName} numberOfLines={1}>{quest.title}</Text>
                </TouchableOpacity>
              );
            })}

            {quests.length === 0 && (
              <View style={[styles.emptyHint, { left: centerX - 95, top: centerY + START_R + 14 }]}>
                <Text style={styles.emptyHintText}>Создай квест и он появится на карте ✨</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* ── BOTTOM PANEL ── */}
      <View style={styles.panel}>
        <View style={styles.panelHandle} />

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {ICON_CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => { setActiveTab(i); setSelectedIcon(null); }}
              style={[styles.tab, activeTab === i && styles.tabActive]}
            >
              <Text style={styles.tabIcon}>{cat.tabIcon}</Text>
              <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Icon grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.iconGrid}
          nestedScrollEnabled
        >
          {panelItems.map((item) => {
            const sel = selectedIcon?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.iconCell}
                onPress={() => setSelectedIcon(sel ? null : item)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, sel && styles.iconBoxSelected]}>
                  <Text style={styles.iconEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.iconName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Action bar: icon selected → pick a quest to apply */}
        {selectedIcon && quests.length > 0 && (
          <View style={styles.actionBar}>
            <Text style={styles.actionBarLabel}>
              {targetQuestId ? `Применить ${selectedIcon.emoji} к:` : `Выбери квест для ${selectedIcon.emoji}:`}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questChips}>
              {quests.map((q) => {
                const focused = targetQuestId === q.id;
                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => setTargetQuestId(focused ? null : q.id)}
                    style={[styles.questChip, focused && styles.questChipActive, q.assetLocked && styles.questChipLocked]}
                    disabled={q.assetLocked === true}
                  >
                    <Text style={styles.questChipEmoji}>{q.mapIcon || getCategoryEmoji(q.category)}</Text>
                    <Text style={[styles.questChipName, focused && styles.questChipNameActive]} numberOfLines={1}>
                      {q.assetLocked ? `${q.title} 🔒` : q.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {targetQuestId && (
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyIcon} activeOpacity={0.85}>
                <Text style={styles.applyBtnText}>Применить {selectedIcon.emoji}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* No quests: go create one */}
        {selectedIcon && quests.length === 0 && (
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => navigation.navigate('Create' as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>Создать квест с {selectedIcon.emoji}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mapArea: { flex: 1, overflow: 'hidden' },

  petEmoji: {
    position: 'absolute',
    fontSize: 22,
    zIndex: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // START island
  startWrapper: { position: 'absolute', width: START_R * 2, alignItems: 'center' },
  startBase: {
    width: START_R * 2, height: START_R * 2, borderRadius: START_R,
    backgroundColor: '#C0855A', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35, shadowRadius: 5, elevation: 8,
  },
  startSurface: {
    width: START_R * 1.75, height: START_R * 1.75, borderRadius: START_R,
    backgroundColor: '#EEE0B0', alignItems: 'center', justifyContent: 'center',
  },
  startEmoji: { fontSize: 20 },
  startLabel: {
    marginTop: 4, fontSize: 10, fontWeight: '800', color: 'white',
    backgroundColor: '#D4693A', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, overflow: 'hidden', letterSpacing: 1,
  },

  // Quest island
  islandWrapper: { position: 'absolute', width: ISLAND_R * 2, alignItems: 'center' },
  islandBase: {
    width: ISLAND_R * 2, height: ISLAND_R * 2, borderRadius: ISLAND_R,
    backgroundColor: '#E89080', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 10,
  },
  islandFocused: {
    borderWidth: 3, borderColor: Colors.gold,
    shadowColor: Colors.gold, shadowOpacity: 0.8, shadowRadius: 10,
  },
  islandSurface: {
    width: ISLAND_TOP_R * 2, height: ISLAND_TOP_R * 2, borderRadius: ISLAND_TOP_R,
    backgroundColor: '#F2E0B0', alignItems: 'center', justifyContent: 'center',
  },
  islandDone: { backgroundColor: '#B8E890' },
  islandEmoji: { fontSize: 26 },
  lockBadge: {
    position: 'absolute', top: -4, right: -4,
    fontSize: 13, zIndex: 5,
  },
  islandName: {
    marginTop: 5, fontSize: 10, fontWeight: '700', color: 'white', textAlign: 'center',
    maxWidth: ISLAND_R * 2 + 12,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },

  emptyHint: {
    position: 'absolute', backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  emptyHintText: { color: 'white', fontSize: 12, fontWeight: '600' },

  // Panel
  panel: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingBottom: Theme.spacing.md,
    maxHeight: 310,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 12,
  },
  panelHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 10,
  },
  tabsRow: { paddingHorizontal: Theme.spacing.md, gap: 4, marginBottom: 10 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: Theme.borderRadius.pill, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.cardLight,
  },
  tabActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  tabIcon: { fontSize: 13 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  tabLabelActive: { color: Colors.primary },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Theme.spacing.md, gap: 8 },
  iconCell: { width: '30%', alignItems: 'center', marginBottom: 2 },
  iconBox: {
    width: 62, height: 62, borderRadius: 16,
    backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  iconBoxSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '18' },
  iconEmoji: { fontSize: 28 },
  iconName: { marginTop: 3, fontSize: 10, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Action bar
  actionBar: { paddingHorizontal: Theme.spacing.md, paddingTop: 8, gap: 6 },
  actionBarLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  questChips: { gap: 8, paddingBottom: 4 },
  questChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: Colors.cardLight, borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  questChipActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '20' },
  questChipLocked: { opacity: 0.45 },
  questChipEmoji: { fontSize: 14 },
  questChipName: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, maxWidth: 90 },
  questChipNameActive: { color: Colors.gold },

  applyBtn: {
    marginHorizontal: Theme.spacing.md, marginTop: 6,
    backgroundColor: Colors.primary, borderRadius: Theme.borderRadius.pill,
    paddingVertical: 11, alignItems: 'center',
  },
  applyBtnText: { color: '#0D1B2A', fontSize: Theme.fontSize.md, fontWeight: '800' },
});
