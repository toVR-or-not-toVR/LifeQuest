import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Card } from '../components/common/Card';
import { XPBar } from '../components/common/XPBar';
import { BadgeTile } from '../components/common/BadgeTile';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getLevelTitle } from '../utils/xpUtils';
import { ALL_BADGES } from '../constants/mockData';

const MASCOTS: Record<string, string> = {
  owl: '🦉', fox: '🦊', cat: '🐱', capybara: '🦫', panda: '🐼',
};

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { state, resetState } = useAppContext();

  function handleReset() {
    Alert.alert(
      'Сбросить прогресс?',
      'Все квесты, XP и достижения будут удалены. Это нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Сбросить', style: 'destructive', onPress: () => resetState() },
      ]
    );
  }
  const { user, quests } = state;
  const mascotEmoji = MASCOTS[user.buddyMascotId] ?? '🦉';
  const totalMilestones = quests.reduce(
    (sum, q) => sum + q.milestones.filter((m) => m.completed).length,
    0
  );

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <LinearGradient colors={['#1A2E45', '#0D1B2A']} style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{user.avatar}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.levelRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{user.level}</Text>
            </View>
            <Text style={styles.levelTitle}>{getLevelTitle(user.level)}</Text>
          </View>
        </LinearGradient>

        {/* XP Bar */}
        <Card style={styles.xpCard} elevated>
          <XPBar xp={user.xp} level={user.level} xpToNextLevel={user.xpToNextLevel} animated showLabels />
        </Card>

        {/* Buddy button */}
        <TouchableOpacity
          style={styles.buddyBtn}
          onPress={() => navigation.navigate('Buddy')}
          activeOpacity={0.85}
        >
          <Text style={styles.buddyBtnEmoji}>{mascotEmoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.buddyBtnTitle}>Мой питомец</Text>
            <Text style={styles.buddyBtnSub}>Снаряди и кастомизируй</Text>
          </View>
          <Text style={styles.buddyArrow}>›</Text>
        </TouchableOpacity>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { icon: '⚔️', label: 'Quests Done', value: user.totalQuestsCompleted },
            { icon: '🔥', label: 'Day Streak', value: user.streak },
            { icon: '⭐', label: 'Total XP', value: user.xp },
            { icon: '🎯', label: 'Milestones', value: totalMilestones },
            { icon: '🏅', label: 'Badges', value: user.badges.length },
            { icon: '🗺️', label: 'Active', value: quests.filter((q) => !q.completedAt).length },
          ].map((stat) => (
            <Card key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeGrid}>
          {ALL_BADGES.map((badgeDef) => {
            const unlocked = user.badges.find((b) => b.id === badgeDef.id);
            return (
              <BadgeTile
                key={badgeDef.id}
                badge={unlocked ?? { ...badgeDef, unlockedAt: '' }}
                locked={!unlocked}
              />
            );
          })}
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetBtnText}>🗑️ Сбросить прогресс</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  profileHeader: {
    alignItems: 'center',
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xxl,
    gap: Theme.spacing.sm,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    ...Theme.shadow.glow(Colors.primary),
  },
  avatarEmoji: { fontSize: 48 },
  name: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  levelBadge: {
    backgroundColor: Colors.primary + '22',
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  levelText: {
    color: Colors.primary,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
  },
  levelTitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: Theme.fontWeight.medium,
  },
  xpCard: {
    marginHorizontal: Theme.spacing.md,
    marginTop: -Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  buddyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  buddyBtnEmoji: { fontSize: 36 },
  buddyBtnTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
  },
  buddyBtnSub: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  buddyArrow: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: Theme.fontWeight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  statCard: { width: '30%', flexGrow: 1, alignItems: 'center', gap: 4, padding: Theme.spacing.sm },
  statIcon: { fontSize: 24 },
  statValue: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: Theme.fontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  resetBtn: {
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.xl,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.danger,
    fontWeight: Theme.fontWeight.semibold,
  },
});
