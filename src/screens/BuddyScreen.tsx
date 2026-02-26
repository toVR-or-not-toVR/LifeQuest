import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { ProgressBar } from '../components/common/ProgressBar';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { xpForCurrentLevel } from '../utils/xpUtils';

// ── Mascots ────────────────────────────────────────────────────────────────
const MASCOTS = [
  { id: 'owl',      name: 'Луми',   emoji: '🦉', color: '#4A9EFF', bg: '#1A3A6A' },
  { id: 'fox',      name: 'Лиса',   emoji: '🦊', color: '#E8844A', bg: '#5A2A10' },
  { id: 'cat',      name: 'Минти',  emoji: '🐱', color: '#00D4AA', bg: '#0A3A30' },
  { id: 'capybara', name: 'Кэппи',  emoji: '🦫', color: '#C4956A', bg: '#3A2A10' },
  { id: 'panda',    name: 'Панда',  emoji: '🐼', color: '#FF6B8A', bg: '#4A1020' },
];

// ── Items ──────────────────────────────────────────────────────────────────
type BuddyItem = { id: string; name: string; emoji: string; minLevel: number };

const HATS: BuddyItem[] = [
  { id: 'cap',    name: 'Кепка',   emoji: '🧢', minLevel: 1 },
  { id: 'tophat', name: 'Цилиндр', emoji: '🎩', minLevel: 3 },
  { id: 'crown',  name: 'Корона',  emoji: '👑', minLevel: 5 },
  { id: 'wizard', name: 'Колпак',  emoji: '🪄', minLevel: 7 },
];

const OUTFITS: BuddyItem[] = [
  { id: 'scarf',  name: 'Шарф',    emoji: '🧣', minLevel: 1 },
  { id: 'sailor', name: 'Матрос',  emoji: '⚓', minLevel: 2 },
  { id: 'tuxedo', name: 'Смокинг', emoji: '🤵', minLevel: 5 },
  { id: 'armor',  name: 'Броня',   emoji: '🛡️', minLevel: 8 },
];

const ACCESSORIES: BuddyItem[] = [
  { id: 'glasses', name: 'Очки',  emoji: '🕶️', minLevel: 1 },
  { id: 'bow',     name: 'Бант',  emoji: '🎀', minLevel: 1 },
  { id: 'guitar',  name: 'Гитара',emoji: '🎸', minLevel: 3 },
  { id: 'wand',    name: 'Жезл',  emoji: '✨', minLevel: 5 },
];

const TABS = [
  { label: 'Шляпы',    items: HATS,        slot: 'hat' as const },
  { label: 'Наряды',   items: OUTFITS,     slot: 'outfit' as const },
  { label: 'Аксессуары', items: ACCESSORIES, slot: 'accessory' as const },
];

// ── Component ──────────────────────────────────────────────────────────────
export function BuddyScreen() {
  const navigation = useNavigation();
  const { state, dispatch } = useAppContext();
  const { user } = state;

  const mascot = MASCOTS.find((m) => m.id === (user.buddyMascotId || 'owl')) ?? MASCOTS[0];
  const [activeTab, setActiveTab] = useState(0);
  const [previewItem, setPreviewItem] = useState<BuddyItem | null>(null);

  const currentSlot = TABS[activeTab].slot;
  const currentItems = TABS[activeTab].items;
  const equippedId = user.buddyEquipped?.[currentSlot];

  // XP progress within current level
  const xpProgress = xpForCurrentLevel(user.xp);

  function handleSelectMascot(id: string) {
    dispatch({ type: 'SET_BUDDY_MASCOT', payload: { mascotId: id } });
  }

  function handleEquip() {
    if (!previewItem) return;
    dispatch({
      type: 'EQUIP_BUDDY_ITEM',
      payload: { slot: currentSlot, itemId: previewItem.id },
    });
    setPreviewItem(null);
  }

  function handleUnequip() {
    dispatch({
      type: 'EQUIP_BUDDY_ITEM',
      payload: { slot: currentSlot, itemId: undefined },
    });
    setPreviewItem(null);
  }

  // Displayed item on buddy: preview takes priority, else equipped
  const displayedItem = previewItem ?? currentItems.find((it) => it.id === equippedId);

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Мой питомец</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Buddy display */}
        <LinearGradient
          colors={[mascot.bg, Colors.background]}
          style={styles.buddyStage}
        >
          {/* Glow ring */}
          <View style={[styles.glowRing, { shadowColor: mascot.color, borderColor: mascot.color + '55' }]}>
            <View style={[styles.avatarCircle, { backgroundColor: mascot.bg }]}>
              {/* Hat overlay */}
              {displayedItem && TABS[activeTab].slot === 'hat' && (
                <Text style={styles.hatOverlay}>{displayedItem.emoji}</Text>
              )}
              <Text style={styles.mascotEmoji}>{mascot.emoji}</Text>
              {/* Accessory overlay */}
              {displayedItem && TABS[activeTab].slot === 'accessory' && (
                <Text style={styles.accOverlay}>{displayedItem.emoji}</Text>
              )}
            </View>
          </View>

          {/* Outfit chip */}
          {displayedItem && TABS[activeTab].slot === 'outfit' && (
            <View style={[styles.outfitChip, { backgroundColor: mascot.color + '33', borderColor: mascot.color }]}>
              <Text style={styles.outfitChipText}>{displayedItem.emoji} {displayedItem.name}</Text>
            </View>
          )}

          {/* Name + level */}
          <Text style={[styles.mascotName, { color: mascot.color }]}>{mascot.name}</Text>
          <Text style={styles.mascotLevel}>Уровень {user.level}</Text>

          {/* XP bar */}
          <View style={styles.xpRow}>
            <ProgressBar progress={xpProgress} color={mascot.color} height={8} showPercent={false} />
            <Text style={[styles.xpLabel, { color: mascot.color }]}>
              {Math.round(xpProgress * 100)}% до след. уровня
            </Text>
          </View>
        </LinearGradient>

        {/* Mascot picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Выбери питомца</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mascotRow}>
            {MASCOTS.map((m) => {
              const active = m.id === user.buddyMascotId;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => handleSelectMascot(m.id)}
                  style={[styles.mascotChip, active && { borderColor: m.color, backgroundColor: m.color + '22' }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.mascotChipEmoji}>{m.emoji}</Text>
                  <Text style={[styles.mascotChipName, active && { color: m.color }]}>{m.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Item tabs */}
        <View style={styles.section}>
          <View style={styles.tabRow}>
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab.slot}
                onPress={() => { setActiveTab(i); setPreviewItem(null); }}
                style={[styles.itemTab, activeTab === i && { borderColor: mascot.color, backgroundColor: mascot.color + '22' }]}
              >
                <Text style={[styles.itemTabText, activeTab === i && { color: mascot.color }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Item grid */}
          <View style={styles.itemGrid}>
            {currentItems.map((item) => {
              const locked = user.level < item.minLevel;
              const equipped = item.id === equippedId;
              const previewing = previewItem?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  disabled={locked}
                  onPress={() => setPreviewItem(previewing ? null : item)}
                  style={[
                    styles.itemCard,
                    equipped && { borderColor: mascot.color },
                    previewing && { borderColor: Colors.gold, backgroundColor: Colors.gold + '15' },
                    locked && styles.itemCardLocked,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.itemEmoji, locked && { opacity: 0.3 }]}>{item.emoji}</Text>
                  {locked && (
                    <View style={styles.lockBadge}>
                      <Text style={styles.lockText}>🔒 {item.minLevel} ур.</Text>
                    </View>
                  )}
                  {equipped && !previewing && (
                    <View style={[styles.equippedBadge, { backgroundColor: mascot.color }]}>
                      <Text style={styles.equippedText}>✓</Text>
                    </View>
                  )}
                  <Text style={[styles.itemName, locked && { opacity: 0.4 }]}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {previewItem && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: mascot.color }]}
              onPress={handleEquip}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Надеть {previewItem.emoji}</Text>
            </TouchableOpacity>
          )}
          {equippedId && !previewItem && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: Colors.danger }]}
              onPress={handleUnequip}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Снять</Text>
            </TouchableOpacity>
          )}
          {!previewItem && !equippedId && (
            <Text style={styles.hintText}>Нажми на предмет, чтобы примерить</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, color: Colors.textPrimary },

  buddyStage: { alignItems: 'center', paddingVertical: Theme.spacing.xl, paddingHorizontal: Theme.spacing.md },

  glowRing: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
    marginBottom: Theme.spacing.sm,
  },
  avatarCircle: {
    width: '100%', height: '100%', borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
  },
  mascotEmoji: { fontSize: 70 },
  hatOverlay: { fontSize: 30, position: 'absolute', top: -8 },
  accOverlay: { fontSize: 22, position: 'absolute', bottom: 8, right: 8 },

  outfitChip: {
    borderRadius: Theme.borderRadius.pill, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 4, marginBottom: Theme.spacing.sm,
  },
  outfitChipText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  mascotName: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  mascotLevel: { fontSize: 13, color: Colors.textSecondary, marginBottom: Theme.spacing.sm },
  xpRow: { width: '80%', alignItems: 'center', gap: 4 },
  xpLabel: { fontSize: 11, fontWeight: '600' },

  section: { paddingHorizontal: Theme.spacing.md, marginTop: Theme.spacing.lg },
  sectionTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: Colors.textPrimary, marginBottom: Theme.spacing.sm },

  mascotRow: { gap: Theme.spacing.sm, paddingBottom: 4 },
  mascotChip: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: Theme.borderRadius.lg, borderWidth: 2,
    borderColor: Colors.border, backgroundColor: Colors.card,
  },
  mascotChipEmoji: { fontSize: 32, marginBottom: 4 },
  mascotChipName: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },

  tabRow: { flexDirection: 'row', gap: Theme.spacing.sm, marginBottom: Theme.spacing.md },
  itemTab: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: Theme.borderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  itemTabText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.sm },
  itemCard: {
    width: '22%', aspectRatio: 0.9, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.card, borderRadius: Theme.borderRadius.md,
    borderWidth: 2, borderColor: Colors.border, position: 'relative', padding: 4,
  },
  itemCardLocked: { opacity: 0.7 },
  itemEmoji: { fontSize: 32, marginBottom: 2 },
  itemName: { fontSize: 9, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  lockBadge: {
    position: 'absolute', top: 2, left: 2,
    backgroundColor: Colors.cardLight, borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1,
  },
  lockText: { fontSize: 8, color: Colors.textMuted },
  equippedBadge: {
    position: 'absolute', top: 2, right: 2, width: 16, height: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  equippedText: { fontSize: 9, color: 'white', fontWeight: '800' },

  actionRow: { paddingHorizontal: Theme.spacing.md, marginTop: Theme.spacing.lg, alignItems: 'center', gap: Theme.spacing.sm },
  actionBtn: {
    width: '100%', paddingVertical: 14, borderRadius: Theme.borderRadius.pill, alignItems: 'center',
  },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 2 },
  actionBtnText: { fontSize: Theme.fontSize.md, fontWeight: '800', color: Colors.background },
  hintText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
